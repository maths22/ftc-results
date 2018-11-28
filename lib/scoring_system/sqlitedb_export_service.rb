module ScoringSystem
  TYPE_SCRIMMAGE = 0
  TYPE_LEAGUE_MEET = 1
  TYPE_QUALIFIER = 2
  TYPE_LEAGUE_TOURNAMENT = 3
  TYPE_CHAMPIONSHIP = 4
  TYPE_OTHER = 5

  class SqlitedbExportService
    attr_reader :season

    def season=(sea)
      @season = sea
      @events = nil
    end

    def initialize(work_dir)
      @work_dir = work_dir
    end

    def create_event_dbs
      events.each { |e| create_event_db e }
    end

    def create_server_db
      db_file = server_db_path
      File.delete(db_file) if File.exist?(db_file)
      db = SQLite3::Database.new db_file
      db.execute_batch IO.binread(File.join(__dir__, 'sql', 'create_server_db.sql'))

      create_event_stmt = db.prepare "INSERT INTO events
                             (code, name, type, status, finals, divisions, start, end)
                             VALUES (:code, :name, :type, :status, :finals, :divisions, :start, :end)"
      events.each do |event|
        type = ScoringSystem::TYPE_OTHER
        type = ScoringSystem::TYPE_LEAGUE_MEET if event.league_meet?
        type = ScoringSystem::TYPE_LEAGUE_TOURNAMENT if event.league_championship?
        create_event_stmt.execute code: event.slug,
                                  name: event.name,
                                  type: type,
                                  status: 1, # setup status
                                  finals: event.has_finals ? 1 : 0,
                                  divisions: 0, # multi-division events not supported currently
                                  start: event.start_date.to_time.to_i.to_s + '000',
                                  end: event.end_date.to_time.to_i.to_s + '000'
      end
    end

    def server_db_for_event(event)
      with_server_db_copy do |f|
        db = SQLite3::Database.new f
        remove_other_events_stmt = db.prepare 'DELETE FROM events WHERE code <> :code'
        remove_other_events_stmt.execute code: event.slug
        yield f
      end
    end

    def event_db(event)
      File.join(@work_dir, event.slug + '.db')
    end

    private

    def server_db_path
      @server_db_path ||= File.join(@work_dir, 'server.db')
    end

    def with_server_db_copy
      Tempfile.open 'serverdb' do |f|
        f.write File.open(server_db_path).read
        f.flush
        yield f.path
      end
    end

    def awards
      @awards ||= ZipService.new.with_globaldb do |db_file|
        db = SQLite3::Database.new db_file
        db.execute 'SELECT id, name, description, teamAward, editable, required, awardOrder FROM awardInfo'
      end
    end

    def create_event_db(evt)
      db_file = File.join(@work_dir, evt.slug + '.db')
      File.delete(db_file) if File.exist?(db_file)
      db = SQLite3::Database.new db_file
      db.execute_batch IO.binread(File.join(__dir__, 'sql/create_event_db.sql'))

      db.execute 'INSERT INTO config (key, value) VALUES (:key, :value)',
                 key: 'fieldCount',
                 value: evt.league_championship? ? 2 : 1

      league = evt.league_championship? ? evt.context : evt.context.league

      add_league_stmt = db.prepare('INSERT INTO leagueInfo
                            (code, name, country, state, city)
                            VALUES (:code, :name, :country, :state, :city)')

      add_league_evt_stmt = db.prepare 'INSERT INTO leagueMeets
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

      add_award_info_stmt = db.prepare('INSERT INTO awardInfo
                          (id, name, description, teamAward, editable, required, awardOrder)
                          VALUES (?, ?, ?, ?, ?, ?, ?)')

      awards.each { |a| add_award_info_stmt.execute a }

      league.divisions.each do |div|
        add_league_stmt.execute code: div.slug,
                                name: div.name,
                                country: 'USA',
                                state: 'IL',
                                city: ''
        div.events.each do |event|
          next unless event.finalized?

          add_league_evt_stmt.execute code: event.slug,
                                      name: event.name,
                                      start: event.start_date.to_time.to_i.to_s + '000',
                                      end: event.end_date.to_time.to_i.to_s + '000'
        end
        div.teams.each do |team|
          add_league_team_stmt.execute code: div.slug, team: team.number

          team.match_alliances_for_season(season).each do |ma|
            next unless ma.counts_for_ranking?(team)

            add_league_history_stmt.execute team: team.number,
                                            eventCode: ma.match.event.slug,
                                            match: ma.match.number,
                                            rp: ma.rp_for_team(team),
                                            tbp: ma.tbp_for_team(team),
                                            score: ma.score_for_team(team)
          end

          next unless evt.league_championship? || div == evt.context

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

    def events
      @events ||= Event.where(season: season)
    end
  end
end
