module ScoringSystem
  TYPE_SCRIMMAGE = 0
  TYPE_LEAGUE_MEET = 1
  TYPE_QUALIFIER = 2
  TYPE_LEAGUE_TOURNAMENT = 3
  TYPE_CHAMPIONSHIP = 4
  TYPE_OTHER = 5

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

    def updated_global_db
      ZipService.new(event.season).with_globaldb do |db_file|
        db = SQLite3::Database.new db_file
        update_team_stmt = db.prepare 'UPDATE Team SET TeamNameShort = :name, TeamNameLong = :school, City = :city, StateProv = :state, Country = :country, ModifiedOn = :modified_on, ModifiedBy = :modified_by WHERE TeamNumber = :number'
        update_team_info_stmt = db.prepare 'UPDATE teamInfo SET name = :name, school = :school, city = :city, state = :state, country = :country, rookie = :rookie WHERE number = :number'
        Team.all.each do |team|
          update_team_stmt.execute number: team.number,
                                   name: team.name,
                                   school: team.organization,
                                   city: team.city,
                                   state: team.state,
                                   country: team.country,
                                   modified_on: team.updated_at.utc.iso8601(3),
                                   modified_by: 'IL FTC Results'

          update_team_info_stmt.execute number: team.number,
                                        name: team.name,
                                        school: team.organization,
                                        city: team.city,
                                        state: team.state,
                                        country: team.country,
                                        rookie: team.rookie_year
        end
        yield db_file
      end
    end

    def create_server_db
      Tempfile.open 'serverdb' do |f|
        make_server_db(f.path)
        yield f.path
      end
    end

    def create_event_dbs
      Tempfile.open 'event' do |f|
        division_files = event.event_divisions.map { |div| { number: div.number, file: Tempfile.open('event') } }
        paths = { 0 => f.path }.merge Hash[division_files.map { |div| [div.number, div.file.path] }]
        make_event_dbs(paths)
        yield paths
      ensure
        division_files.map { |div| div.file.close }
      end
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
          copy_from_globaldb(db, 'Team', "TeamNumber IN (#{div.teams.map(&:number).join(', ')})")
          copy_from_globaldb(db, 'teamInfo', "number IN (#{div.teams.map(&:number).join(', ')})")
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

    def copy_from_globaldb(db, table, where_clause = '1 = 1')
      cache_key = "#{table}:#{where_clause}"
      @value_cache ||= {}
      @value_cache[cache_key] ||= begin
        updated_global_db do |db_file|
          global_db = SQLite3::Database.new db_file
          columns = global_db.execute("SELECT name FROM pragma_table_info('#{table}')").map { |row| row[0] }
          rows = global_db.execute "SELECT #{columns.join(', ')} FROM #{table} WHERE #{where_clause}"
          { columns: columns, rows: rows }
        end
      end

      columns = @value_cache[cache_key][:columns]
      add_rows_stmt = db.prepare("INSERT INTO #{table}
                          (#{columns.join(', ')})
                          VALUES (#{Array.new(columns.length, '?').join(', ')})")

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

    def apk
      @apk ||= ENV.fetch('AP_UPLOAD_KEY', 'dummy-key')
    end
  end
  # rubocop:enable Naming/AccessorMethodName
end
