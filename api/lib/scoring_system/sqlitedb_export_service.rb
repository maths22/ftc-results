module ScoringSystem
  TYPE_SCRIMMAGE = 0
  TYPE_LEAGUE_MEET = 1
  TYPE_QUALIFIER = 2
  TYPE_LEAGUE_TOURNAMENT = 3
  TYPE_CHAMPIONSHIP = 4
  TYPE_OTHER = 5

  DEFAULT_EVENT_DB_URL = 'https://ftcproductionstorage.blob.core.windows.net/public-downloads/season2019/defaultevent.db'.freeze

  # rubocop:disable Naming/AccessorMethodName
  class SqlitedbExportService
    include Rails.application.routes.url_helpers
    attr_reader :event, :test_db, :token, :root_url

    def initialize(event, test_db:, token:, root_url:)
      @event = event
      @test_db = test_db
      @token = token
      @root_url = root_url
    end

    def cleanup
      @server_db&.close
      @event_dbs&.values&.each(&:close)
    end

    require 'net/http'
    require 'tempfile'
    require 'uri'

    def event_dbs
      @event_dbs ||= begin
        f = Tempfile.new('event')
        division_files = event.event_divisions.map { |div| { number: div.number, file: Tempfile.open('event') } }
        files = { 0 => f }.merge Hash[division_files.map { |div| [div[:number], div[:file]] }]
        make_event_dbs(files.transform_values(&:path))
        files
      end
      @event_dbs.transform_values(&:path)
    end

    private

    def make_event_dbs(db_files)
      db_files.each do |db_file|
        db = SQLite3::Database.new db_file[1]
        event_uuid = SecureRandom.uuid
        db.results_as_hash = true
        db.execute_batch IO.binread(File.join(__dir__, 'sql/create_event_db.sql'))

        set_field_count db
        set_uuid db, event_uuid

        #TODO redo this for the modern world? or just ignore it?
        # copy_from_globaldb(db, 'awardInfo')

        # Note only works with new scoring system
        # copy_from_globaldb(db, 'Award')
        # add_award_assignment_stmt = db.prepare 'INSERT INTO AwardAssignment VALUES(:FMSAwardId,:FMSEventId,:Series,NULL,NULL,NULL,0,:CreatedOn,:CreatedBy,NULL,NULL,NULL);'
        # db.execute('SELECT FMSAwardId, DefaultQuantity from Award').map do |award|
        #   id = award['FMSAwardId']
        #   Range.new(1, award['DefaultQuantity']).each do |series|
        #     add_award_assignment_stmt.execute FMSAwardId: id,
        #                                       FMSEventId: DataHelper.uuid_to_bytes(event_uuid),
        #                                       Series: series,
        #                                       CreatedOn: DateTime.now.utc.iso8601(3),
        #                                       CreatedBy: 'Event Creator'
        #   end
        # end

        # copy_from_globaldb(db, 'formRows')

        # copy_from_globaldb(db, 'formItems')

        # add_sponsors db
      end

      db = SQLite3::Database.new db_files[0]

      set_config db, "code", event.slug.downcase
      set_config db, "onlineResultsUrl", "#{root_url}#{event.season.year}/events/summary/#{event.slug}"
      set_config db, "name", event.name
      set_config db, "start", event.start_date.in_time_zone.change(hour: 8).to_i.to_s + '000'
      set_config db, "end", event.end_date.in_time_zone.change(hour: 17).to_i.to_s + '000'
      set_config db, "division", 0
      set_config db, "status", 1
      set_config db, "finals", "false"

      type = if event.league_meet?
                     ScoringSystem::TYPE_LEAGUE_MEET
                   elsif event.league_tournament?
                     ScoringSystem::TYPE_LEAGUE_TOURNAMENT
                   elsif event.season.offseason?
                     ScoringSystem::TYPE_OTHER
                   else
                     ScoringSystem::TYPE_CHAMPIONSHIP
                   end
      set_config db, "type", type
      set_config db, "region", "USIL"
      set_config db, "address", event.address
      set_config db, "venue", event.location
      # here would be league/leagueId/leagueName if it was a league meet
      set_config db, "city", event.city
      set_config db, "state", event.state
      set_config db, "country", event.country
      set_config db, "ek", token
      set_config db, "cloudBaseUrl", "#{root_url}api/v1/scoring"
      set_config db, "advancement.enabled", "false"



      # map.put("db.version", "2022_0");
      # map.put("db.version.initial", "2022_0");


      setup_divisional_dbs db_files

      # For non-league events, don't preload any data
      return if event.context.nil?

      add_league_stmt = prepare_insert_statement(db, 'leagueInfo', %w[code name country state city])

      add_league_event_stmt = prepare_insert_statement(db, 'leagueMeets', %w[eventCode name start end])

      add_league_team_stmt = prepare_insert_statement(db, 'leagueMembers', %w[code team])

      add_teams_stmt = prepare_insert_statement(db, 'teams', %w[number advanced division])

      add_league_history_stmt = prepare_insert_statement(db, 'leagueHistory',
                                                         %w[team eventCode match rp tbp score DQ matchOutcome])

      league.divisions.each do |div|
        add_league_stmt.execute code: div.slug,
                                name: div.name,
                                country: 'USA',
                                state: 'IL',
                                city: ''
        div.events.each do |event|
          next unless event.finalized?

          add_league_event_stmt.execute eventCode: event.slug,
                                        name: event.name,
                                        start: event.start_date.in_time_zone.change(hour: 8).to_i.to_s + '000',
                                        end: event.end_date.in_time_zone.change(hour: 17).to_i.to_s + '000'
        end

        if event.league_tournament? || div == event.context
          copy_from_globaldb(db, 'Team', where: "TeamNumber IN (#{div.teams.map(&:number).join(', ')})", delete: false)
          copy_from_globaldb(db, 'teamInfo', where: "number IN (#{div.teams.map(&:number).join(', ')})", delete: false)
        end

        div.teams.each do |team|
          add_league_team_stmt.execute code: div.slug, team: team.number

          team.match_alliances_for_season(event.season).each do |ma|
            next unless ma.counts_for_ranking?(team) && ma.match.phase == 'qual'

            add_league_history_stmt.execute team: team.number,
                                            eventCode: ma.match.event.slug,
                                            match: ma.match.number,
                                            rp: ma.rp_for_team(team),
                                            tbp: ma.tbp_for_team(team),
                                            score: ma.score_for_team(team),
                                            DQ: ma.red_card_for_team(team) ? 1 : 0,
                                            matchOutcome: {
                                              0 => 'LOSS',
                                              1 => 'TIE',
                                              2 => 'WIN',
                                              nil => 'UNKNOWN'
                                            }[ma.match.record_for_team(team)]
          end

          next unless event.league_tournament? || div == event.context

          add_teams_stmt.execute number: team.number,
                                 advanced: 0,
                                 division: 0
        end
      end
    end

    def prepare_insert_statement(db, table, columns)
      db.prepare("INSERT INTO #{table}
                            (#{columns.join(', ')})
                            VALUES (#{columns.map { |col| ':' + col }.join(', ')})")
    end

    def league
      @league ||= event.league_tournament? ? event.context : event.context.league
    end

    def copy_from_globaldb(db, table, where: '1 = 1', globaldb: updated_global_db, delete: true)
      cache_key = "#{table}:#{where}"
      @value_cache ||= {}
      @value_cache[cache_key] ||= begin
        global_db = SQLite3::Database.new globaldb
        columns = global_db.execute("SELECT name FROM pragma_table_info('#{table}')").map { |row| row[0] }
        rows = global_db.execute "SELECT #{columns.join(', ')} FROM #{table} WHERE #{where}"
        pk = global_db.execute("SELECT name FROM pragma_table_info('#{table}') WHERE pk >= 1").map { |row| row[0] }
        { pk: pk, columns: columns, rows: rows }
      end

      columns = @value_cache[cache_key][:columns]
      # pk = @value_cache[cache_key][:pk]
      db.execute "DELETE FROM #{table}" if delete
      sql = <<~SQL
        INSERT INTO #{table}
        (#{columns.join(', ')})
        VALUES (#{Array.new(columns.length, '?').join(', ')})
      SQL
      # Once I can get a better version of sqlite do this
      # #{pk.empty? ? '' : "ON CONFLICT(#{pk.join(',')}) DO UPDATE SET #{columns.map { |c| "#{c}=excluded.#{c}" }.join(', ')}"}

      add_rows_stmt = db.prepare sql

      @value_cache[cache_key][:rows].each { |a| add_rows_stmt.execute a }
    end

    def set_field_count(db)
      set_config(db, 'fieldCount', event.league_meet? ? 1 : 2)
    end

    def set_uuid(db, uuid)
      set_config(db, 'FMSEventId', uuid)
    end

    def set_config(db, key, value)
      db.execute 'INSERT INTO config (key, value) VALUES (:key, :value)',
                 key: key,
                 value: value
    end

    def add_sponsors(db)
      # TODO: update to remove logos (maybe)

      add_sponsors_stmt = prepare_insert_statement(db, 'sponsors', %w[id name level])
      # %w[id name level logoPath])

      Sponsor.global.each do |s|
        add_sponsors_stmt.execute id: s.id,
                                  name: s.name,
                                  level: 1
        # logoPath: "#{s.id}#{s.logo.filename.extension_with_delimiter}"
      end

      event.sponsors.each do |s|
        add_sponsors_stmt.execute id: s.id,
                                  name: s.name,
                                  level: 0
        # logoPath: "#{s.id}#{s.logo.filename.extension_with_delimiter}"
      end
    end

    def setup_divisional_dbs(db_files)
      db = SQLite3::Database.new db_files[0]
      event.event_divisions.each do |div|
        add_division_stmt = prepare_insert_statement(db, 'divisions',
                                                     %w[id name abbrev])

        add_division_stmt.execute id: div.number,
                                  name: div.name,
                                  abbrev: div.name.downcase[0]

        div_db = SQLite3::Database.new db_files[div.number]

        set_config(div_db, 'parent', event.name)
      end
    end

    def with_defaultdb
      uri = URI.parse(DEFAULT_EVENT_DB_URL)
      resp = Net::HTTP.get(uri)
      Tempfile.create('defaultevent') do |file|
        file.binmode
        file.write(resp)
        file.flush
        yield file.path
      end
    end
  end
  # rubocop:enable Naming/AccessorMethodName
end
