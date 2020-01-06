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
    attr_reader :event, :test_db, :token, :api_base

    def initialize(event, test_db:, token:, api_base:)
      @event = event
      @test_db = test_db
      @token = token
      @api_base = api_base
    end

    def cleanup
      @server_db&.close
      @event_dbs&.values&.each(&:close)
    end

    require 'net/http'
    require 'tempfile'
    require 'uri'

    def updated_global_db
      Rails.cache.fetch('global_db_path_v2', expires_in: 12.hours) do
        ZipService.new(event.season).with_globaldb do |db_file|
          db = SQLite3::Database.new db_file

          with_defaultdb do |defaultdb_file|
            copy_from_globaldb(db, 'Team', globaldb: defaultdb_file)
          end
          update_team_stmt = db.prepare 'UPDATE Team SET TeamNameShort = :name, TeamNameLong = :school, City = :city, StateProv = :state, Country = :country, ModifiedOn = :modified_on, ModifiedBy = :modified_by WHERE TeamNumber = :number'
          insert_team_stmt = db.prepare 'INSERT INTO Team (FMSTeamId, FMSSeasonId, TeamId, TeamNumber, TeamNameShort, TeamNameLong, City, StateProv, Country, RookieYear, CreatedOn, CreatedBy, ModifiedOn, ModifiedBy, WasAddedFromUI, CMPPrequalified, DemoTeam)
                                                      VALUES (:team_id, :season_id, 0, :number, :name, :school, :city, :state, :country, :rookie_year, :created_on, :created_by, :modified_on, :modified_by, 1, 0, 0)'

          update_team_info_stmt = db.prepare 'UPDATE teamInfo SET name = :name, school = :school, city = :city, state = :state, country = :country, rookie = :rookie WHERE number = :number'
          insert_team_info_stmt = db.prepare 'INSERT INTO teamInfo (number, name, school, city, state, country, rookie) VALUES (:number, :name, :school, :city, :state, :country, :rookie)'

          Team.all.each do |team|
            update_team_stmt.execute number: team.number,
                                     name: team.name,
                                     school: team.organization,
                                     city: team.city,
                                     state: team.state,
                                     country: team.country,
                                     modified_on: team.updated_at.utc.iso8601(3),
                                     modified_by: 'IL FTC Results'

            if db.changes.zero?
              insert_team_stmt.execute team_id: DataHelper.uuid_to_bytes(SecureRandom.uuid),
                                       # TODO: don't hardcode skystone
                                       season_id: DataHelper.uuid_to_bytes('803cdf38-6b9a-6544-b8f6-daf20191133a'),
                                       number: team.number,
                                       name: team.name,
                                       school: team.organization,
                                       city: team.city,
                                       state: team.state,
                                       country: team.country,
                                       rookie_year: team.rookie_year,
                                       created_on: team.updated_at.utc.iso8601(3),
                                       created_by: 'IL FTC Results',
                                       modified_on: team.updated_at.utc.iso8601(3),
                                       modified_by: 'IL FTC Results'
            end

            update_team_info_stmt.execute number: team.number,
                                          name: team.name,
                                          school: team.organization,
                                          city: team.city,
                                          state: team.state,
                                          country: team.country,
                                          rookie: team.rookie_year
            next unless db.changes.zero?

            insert_team_info_stmt.execute number: team.number,
                                          name: team.name,
                                          school: team.organization,
                                          city: team.city,
                                          state: team.state,
                                          country: team.country,
                                          rookie: team.rookie_year
          end

          FileUtils.cp(db_file, Rails.root.join('tmp/globaldb'))
        end
        Rails.root.join('tmp/globaldb').to_s
      end
    end

    def server_db
      @server_db ||= Tempfile.new('serverdb').tap { |f| make_server_db(f.path) }
      @server_db.path
    end

    def event_dbs
      @event_dbs ||= begin
        f = Tempfile.new('event')
        division_files = event.event_divisions.map { |div| { number: div.number, file: Tempfile.open('event') } }
        files = { 0 => f }.merge Hash[division_files.map { |div| [div.number, div.file] }]
        make_event_dbs(files.transform_values(&:path))
        files
      end
      @event_dbs.transform_values(&:path)
    end

    private

    def make_server_db(db_file)
      db = SQLite3::Database.new db_file
      db.execute_batch IO.binread(File.join(__dir__, 'sql', 'create_server_db.sql'))

      create_event_stmt = prepare_insert_statement(db, 'events',
                                                   %w[code name type status finals divisions start end region])

      type = if event.league_meet?
               ScoringSystem::TYPE_LEAGUE_MEET
             elsif event.league_championship?
               ScoringSystem::TYPE_LEAGUE_TOURNAMENT
             elsif event.season.offseason?
               ScoringSystem::TYPE_OTHER
             else
               ScoringSystem::TYPE_CHAMPIONSHIP
             end

      create_event_stmt.execute code: (test_db ? 'test_' : '') + event.slug + (event.divisions? ? '_0' : ''),
                                name: (test_db ? 'TEST ' : '') + event.name,
                                type: type,
                                status: 1, # setup status
                                finals: event.divisions? ? 1 : 0,
                                divisions: 0,
                                start: event.start_date.to_time.to_i.to_s + '000',
                                end: event.end_date.to_time.to_i.to_s + '000',
                                region: apk.split('-')[0]

      event.event_divisions.each do |div|
        create_event_stmt.execute code: (test_db ? 'test_' : '') + event.slug + '_' + div.number.to_s,
                                  name: (test_db ? 'TEST ' : '') + div.name,
                                  type: type,
                                  status: 1, # setup status
                                  finals: 0,
                                  divisions: div.number,
                                  start: event.start_date.to_time.to_i.to_s + '000',
                                  end: event.end_date.to_time.to_i.to_s + '000',
                                  region: apk.split('-')[0]
      end
    end

    def make_event_dbs(db_files)
      db = SQLite3::Database.new db_files[0]
      event_uuid = SecureRandom.uuid
      db.results_as_hash = true
      db.execute_batch IO.binread(File.join(__dir__, 'sql/create_event_db.sql'))

      set_field_count db
      set_uuid db, event_uuid
      set_apk db unless test_db
      set_il_token db unless test_db

      copy_from_globaldb(db, 'awardInfo')

      # Note only works with new scoring system
      copy_from_globaldb(db, 'Award')
      add_award_assignment_stmt = db.prepare 'INSERT INTO AwardAssignment VALUES(:FMSAwardId,:FMSEventId,:Series,NULL,NULL,NULL,0,:CreatedOn,:CreatedBy,NULL,NULL,NULL);'
      db.execute('SELECT FMSAwardId, DefaultQuantity from Award').map do |award|
        id = award['FMSAwardId']
        Range.new(1, award['DefaultQuantity']).each do |series|
          add_award_assignment_stmt.execute FMSAwardId: id,
                                            FMSEventId: DataHelper.uuid_to_bytes(event_uuid),
                                            Series: series,
                                            CreatedOn: DateTime.now.utc.iso8601(3),
                                            CreatedBy: 'Event Creator'
        end
      end

      copy_from_globaldb(db, 'formRows')

      copy_from_globaldb(db, 'formItems')

      add_sponsors db

      create_divisional_dbs db_files

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
                                        start: event.start_date.to_time.to_i.to_s + '000',
                                        end: event.end_date.to_time.to_i.to_s + '000'
        end

        if event.league_championship? || div == event.context
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

          next unless event.league_championship? || div == event.context

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
      @league ||= event.league_championship? ? event.context : event.context.league
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
      set_config(db, 'fieldCount', event.league_championship? ? 2 : 1)
    end

    def set_uuid(db, uuid)
      set_config(db, 'FMSEventId', uuid)
    end

    def set_apk(db)
      set_config(db, 'apk', apk)
    end

    def set_il_token(db)
      set_config(db, '_il_token', token)
      set_config(db, '_il_api_base', api_base)
      set_config(db, '_il_event_id', @event.id)
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

    def create_divisional_dbs(db_files)
      event.event_divisions.each do |div|
        division_uuid = SecureRandom.uuid
        set_uuid db, division_uuid
        add_division_stmt = prepare_insert_statement(db, 'divisions',
                                                     %w[id name abbrev])

        add_division_stmt.execute id: div.number,
                                  name: div.name,
                                  abbrev: div.name.downcase[0]

        div_db = SQLite3::Database.new db_files[div.number]
        div_db.execute_batch IO.binread(File.join(__dir__, 'sql/create_event_db.sql'))

        div_db.execute 'INSERT INTO config (key, value) VALUES (:key, :value)',
                       key: 'fieldCount',
                       value: 2

        div_db.execute 'INSERT INTO config (key, value) VALUES (:key, :value)',
                       key: 'parent',
                       value: event.name
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

    def apk
      @apk ||= ENV.fetch('AP_UPLOAD_KEY', 'dummy-key')
    end
  end
  # rubocop:enable Naming/AccessorMethodName
end
