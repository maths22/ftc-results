module ScoringSystem
  TYPE_SCRIMMAGE = 0
  TYPE_LEAGUE_MEET = 1
  TYPE_QUALIFIER = 2
  TYPE_LEAGUE_TOURNAMENT = 3
  TYPE_CHAMPIONSHIP = 4
  TYPE_OTHER = 5

  class SqlitedbExportService
    attr_reader :event

    def initialize(event)
      @event = event
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
        make_event_db(paths)
        yield paths
      ensure
        division_files.map { |div| div.file.close }
      end
    end

    private

    def make_server_db(db_file)
      db = SQLite3::Database.new db_file
      db.execute_batch IO.binread(File.join(__dir__, 'sql', 'create_server_db.sql'))

      create_event_stmt = db.prepare "INSERT INTO events
                             (code, name, type, status, finals, divisions, start, end)
                             VALUES (:code, :name, :type, :status, :finals, :divisions, :start, :end)"

      type = if event.league_meet?
               ScoringSystem::TYPE_LEAGUE_MEET
             elsif event.league_championship?
               ScoringSystem::TYPE_LEAGUE_TOURNAMENT
             else
               ScoringSystem::TYPE_CHAMPIONSHIP
             end
      create_event_stmt.execute code: event.slug + (event.divisions? ? '_0' : ''),
                                name: event.name,
                                type: type,
                                status: 1, # setup status
                                finals: event.divisions? ? 1 : 0,
                                divisions: 0,
                                start: event.start_date.to_time.to_i.to_s + '000',
                                end: event.end_date.to_time.to_i.to_s + '000'

      event.event_divisions.each do |div|
        create_event_stmt.execute code: event.slug + '_' + div.number.to_s,
                                  name: div.name,
                                  type: type,
                                  status: 1, # setup status
                                  finals: 0,
                                  divisions: div.number,
                                  start: event.start_date.to_time.to_i.to_s + '000',
                                  end: event.end_date.to_time.to_i.to_s + '000'
      end
    end

    def copy_from_globaldb(db, table, columns)
      @value_cache ||= {}
      @value_cache["#{table}:#{columns}"] ||= begin
        ZipService.new.with_globaldb do |db_file|
          db = SQLite3::Database.new db_file
          db.execute "SELECT #{columns.join(',')} FROM #{table}"
        end
      end

      add_rows_stmt = db.prepare("INSERT INTO #{table}
                          (#{columns.join(',')})
                          VALUES (#{columns.map('?').join(',')})")

      @value_cache["#{table}:#{columns}"].each { |a| add_rows_stmt.execute a }
    end

    def make_event_db(db_files)
      db = SQLite3::Database.new db_files[0]
      db.execute_batch IO.binread(File.join(__dir__, 'sql/create_event_db.sql'))

      db.execute 'INSERT INTO config (key, value) VALUES (:key, :value)',
                 key: 'fieldCount',
                 value: event.league_championship? ? 2 : 1

      copy_from_globaldb(db, 'awardInfo',
                         %w[id name description teamAward editable required awardOrder])

      copy_from_globaldb(db, 'formRows',
                         %w[formID row type columnCount description rule page])

      copy_from_globaldb(db, 'formItems',
                         %w[formID row itemIndex label type])

      add_sponsors_stmt = db.prepare('INSERT INTO sponsors
                          (id, name, level, logoPath)
                          VALUES (:id, :name, :level, :logoPath)')

      Sponsor.global.each do |s|
        add_sponsors_stmt.execute id: s.id,
                                  name: s.name,
                                  level: 1,
                                  logoPath: "#{s.id}#{s.logo.filename.extension_with_delimiter}"
      end

      event.sponsors.each do |s|
        add_sponsors_stmt.execute id: s.id,
                                  name: s.name,
                                  level: 0,
                                  logoPath: "#{s.id}#{s.logo.filename.extension_with_delimiter}"
      end

      event.event_divisions.each do |div|
        add_division_stmt = db.prepare('INSERT INTO divisions
                          (id, name, abbrev)
                          VALUES (:id, :name, :abbrev)')

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

      return if event.context.nil?

      league = event.league_championship? ? event.context : event.context.league

      add_league_stmt = db.prepare('INSERT INTO leagueInfo
                            (code, name, country, state, city)
                            VALUES (:code, :name, :country, :state, :city)')

      add_league_event_stmt = db.prepare 'INSERT INTO leagueMeets
                             (eventCode, name, start, end)
                             VALUES (:code, :name, :start, :end)'

      add_league_team_stmt = db.prepare('INSERT INTO leagueMembers
                            (code, team)
                            VALUES (:code, :team)')

      add_teams_stmt = db.prepare('INSERT INTO teams
                            (number, advanced, division)
                            VALUES (:number, :advanced, :division)')

      add_league_history_stmt = db.prepare('INSERT INTO leagueHistory
                           (team, eventCode, match, rp, tbp, score)
                           VALUES (:team, :eventCode, :match, :rp, :tbp, :score)')

      add_team_info_stmt = db.prepare('INSERT INTO teamInfo
                           (number, name, school, city, state, country, rookie)
                           VALUES (:number, :name, :school, :city, :state, :country, :rookie)')

      league.divisions.each do |div|
        add_league_stmt.execute code: div.slug,
                                name: div.name,
                                country: 'USA',
                                state: 'IL',
                                city: ''
        div.events.each do |event|
          next unless event.finalized?

          add_league_event_stmt.execute code: event.slug,
                                        name: event.name,
                                        start: event.start_date.to_time.to_i.to_s + '000',
                                        end: event.end_date.to_time.to_i.to_s + '000'
        end
        div.teams.each do |team|
          add_league_team_stmt.execute code: div.slug, team: team.number

          team.match_alliances_for_season(season).each do |ma|
            next unless ma.counts_for_ranking?(team) && ma.match.phase == 'qual'

            add_league_history_stmt.execute team: team.number,
                                            eventCode: ma.match.event.slug,
                                            match: ma.match.number,
                                            rp: ma.rp_for_team(team),
                                            tbp: ma.tbp_for_team(team),
                                            score: ma.score_for_team(team)
          end

          next unless event.league_championship? || div == event.context

          add_teams_stmt.execute number: team.number,
                                 advanced: 0,
                                 division: 0

          add_team_info_stmt.execute number: team.number,
                                     name: team.name,
                                     school: team.organization,
                                     city: team.city,
                                     state: team.state,
                                     country: team.country,
                                     rookie: team.rookie_year
        end
      end
    end
  end
end
