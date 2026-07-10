module ScoringSystem
  class SqlitedbImportService
    attr_reader :event, :event_division

    def initialize(event, event_division = nil)
      @event = event
      @event_division = event_division
    end

    def process
      blob = event_division.nil? ? event.import : event_division.import

      blob.open do |file|
        @db = SQLite3::Database.new file.path
        @db.results_as_hash = true
        ActiveRecord::Base.transaction do
          verify_event
          import_teams
          import_phase('PRACTICE')
          import_phase('QUALS')
          import_alliances
          import_phase('ELIMS')
          import_rankings
          # import_league_results
          import_awards

          event.finalize! unless event.finalized?
          event.save!
        end
      end
    end

    private

    def verify_event
      team = @db.execute "SELECT value FROM config WHERE key LIKE 'code'"
      raise "DB is for '#{team[0]['value']}', expected DB for '#{event.slug.downcase}'" unless team[0]['value'].start_with? event.slug.downcase
    end

    def import_teams
      team_list = @db.execute('SELECT number FROM teams t JOIN teamData td ON td.teamId = t.teamId').map { |t| t['number'] }
      new_team_nums = team_list - event.teams.pluck(:number)
      teams = new_team_nums.map { |t| Team.find_or_create_by(number: t) }

      event.teams = event.teams + teams
      event.teams = event.teams.select { |t| team_list.include? t.number } if event_division.nil?
      unless event_division.nil?
        event.events_teams.select { |et| team_list.include?(et.team_id) }.each do |et|
          et.event_division = event_division
          et.save!
        end
      end
      event.save!
    end

    def import_phase(phase)
      results_phase = {
        'PRACTICE' => :practice,
        'QUALS' => :qual,
        'ELIMS' => :playoff
      }[phase]
      matches = @db.execute("SELECT m.matchId, series, number, scheduleStart, start FROM matches m JOIN matchData md ON m.matchId = md.matchId WHERE phase = ?", phase)

      matches.each do |m|
        if results_phase == :playoff
          alliances = @db.execute("SELECT matchId, alliance, seed FROM matchAlliances WHERE matchId = ?", m['matchId'])
          red_alliance = event.alliances.find_by(is_elims: true, seed: alliances.find { |a| a['alliance'] == 'RED' }['seed'])
          blue_alliance = event.alliances.find_by(is_elims: true, seed: alliances.find { |a| a['alliance'] == 'BLUE' }['seed'])
        else
          stations = @db.execute("SELECT matchId, alliance, station, surrogate, td.number as teamNumber FROM matchStations ms JOIN teamData td ON ms.teamId = td.teamId WHERE matchId = ? ORDER by alliance, station", m['matchId'])
          grouped_stations = stations.group_by { |x| x['alliance'] }
          red_alliance = Alliance.new event: event, is_elims: false, teams: Team.find(grouped_stations['RED'].map { |x| x['teamNumber'] }), event_division: event_division
          blue_alliance = Alliance.new event: event, is_elims: false, teams: Team.find(grouped_stations['BLUE'].map { |x| x['teamNumber'] }), event_division: event_division
        end
        red_alliance.save!
        blue_alliance.save!
        red_match_alliance = MatchAlliance.new alliance: red_alliance
        blue_match_alliance = MatchAlliance.new alliance: blue_alliance
        if grouped_stations
          red_match_alliance.surrogate = grouped_stations['RED'].map { |x| x['surrogate'] }
          blue_match_alliance.surrogate = grouped_stations['RED'].map { |x| x['surrogate'] }
        end
        match = Match.new event: event, phase: results_phase, series: results_phase == :playoff ? m['number'] : 0, number: results_phase == :playoff ? 1 : m['number'], red_alliance: red_match_alliance, blue_alliance: blue_match_alliance, event_division: event_division
        match.start = Time.at(m['start'] / 1000.0) if m['start']
        match.scheduled_start = ActiveSupport::TimeZone[event.timezone].parse(m['scheduleStart']) if m['scheduleStart']
        match.red_score = Score.new
        match.blue_score = Score.new
        match.save!
      end

      matches.each do |m|
        match = event.matches.find_by(phase: results_phase, series: results_phase == :playoff ? m['number'] : 0, number: results_phase == :playoff ? 1 : m['number'])

        participants = @db.execute("SELECT matchId, alliance, station, card, dq, noShow FROM matchParticipants WHERE matchId = ? ORDER by alliance, station", m['matchId'])
        grouped_participants = participants.group_by { |x| x['alliance'] }

        [:red, :blue].each do |alliance|
          match_alliance = match.send("#{alliance}_alliance")
          match_alliance.red_card = grouped_participants[alliance.to_s.upcase].map { |x| x['card'] == 'RED' || x['card'] == 'SECOND_YELLOW' }
          match_alliance.yellow_card = grouped_participants[alliance.to_s.upcase].map { |x| x['card'] == 'YELLOW' || x['card'] == 'SECOND_YELLOW' }
          match_alliance.teams_start = []
          match_alliance.teams_present = grouped_participants[alliance.to_s.upcase].map { |x| x['noShow'].zero? }
          match_alliance.save!
          score = Score.new(red_match: match)
          score.season_score = event.season.score_model.new(score: match.red_score)
          match.send("#{alliance}_score=", score)
        end
        match.played = true
        match.save!
      end

      specific_name = "import_#{event.season.score_model_name.tableize}"
      send(respond_to?(specific_name) ? specific_name : "import_modern_scores", phase: phase, results_phase: results_phase)
    end

    def import_rankings
      rankings = @db.execute('SELECT td.number as teamNumber, sortTuple, wins, losses, ties, matchesPlayed, matchesCounted FROM qualsRankings qr JOIN teamData td ON qr.teamId = td.teamId')
      rankings.each { |r| r['sortTuple'] = JSON.load(r['sortTuple']) }
      rankings = rankings.sort_by { |r| r['sortTuple'] }

      rankings.each_with_index do |r, idx|
        @event.rankings.create!(
          team_id: r['teamNumber'],
          ranking: idx + 1,
          sort_order1: r['sortTuple'][0],
          sort_order2: r['sortTuple'][1],
          sort_order3: r['sortTuple'][2],
          sort_order4: r['sortTuple'][3],
          sort_order5: r['sortTuple'][4],
          sort_order6: r['sortTuple'][5],
          matches_played: r['matchesPlayed'],
          wins: r['wins'],
          losses: r['losses'],
          ties: r['ties'],
          matches_counted: r['matchesCounted']
        )
      end

      rankings = @db.execute('SELECT seed, sortTuple, wins, losses, ties, matchesPlayed FROM playoffRankings pr')
      rankings.each { |r| r['sortTuple'] = JSON.load(r['sortTuple']) }
      rankings = rankings.sort_by { |r| r['sortTuple'] }

      rankings.each do |r|
        @event.rankings.create!(
          alliance: Alliance.find_by(event: @event, is_elims: true, seed: r['seed']),
          ranking: idx + 1,
          sort_order1: r['sortTuple'][0],
          sort_order2: r['sortTuple'][1],
          sort_order3: r['sortTuple'][2],
          sort_order4: r['sortTuple'][3],
          sort_order5: r['sortTuple'][4],
          sort_order6: r['sortTuple'][5],
          matches_played: r['matchesPlayed'],
          wins: r['wins'],
          losses: r['losses'],
          ties: r['ties'],
          # Playoffs always count all played matches
          matches_counted: r['matchesPlayed']
        )
      end
    end

    def import_alliances
      all_members = @db.execute("SELECT seed, position, td.number as teamNumber FROM allianceMembers am JOIN teamData td ON am.teamId = td.teamId ORDER BY seed, position")
      alliances = all_members.group_by { |a| a['seed'] }
      alliances.each do |seed, members|
        teams = Team.find(members.map { |x| x['teamNumber'] })
        event.alliances.create!(is_elims: true, seed:, teams:, event_division:)
      end
    end

    def import_rover_ruckus_scores(phase:, table:)
      season_results = @db.execute 'SELECT match, alliance, landed1, landed2, claimed1, claimed2, autoParking1, autoParking2, sampleFieldState, depot, gold, silver, latched1, latched2, endParked1, endParked2 FROM ' + table

      season_results.each do |r|
        match = ss_match_to_results_match(phase, r['match'])
        score = r['alliance'].zero? ? match.red_score : match.blue_score
        rr_score = score.season_score
        rr_score.robots_landed = (r['landed1']) + (r['landed2'])
        rr_score.depots_claimed = (r['claimed1']) + (r['claimed2'])
        rr_score.robots_parked_auto = (r['autoParking1']) + (r['autoParking2'])
        rr_score.fields_sampled = compute_rover_ruckus_fields(r['match'], table, r['sampleFieldState'])
        rr_score.depot_minerals = r['depot']
        rr_score.gold_cargo = r['gold']
        rr_score.silver_cargo = r['silver']
        rr_score.latched_robots = (r['latched1']) + (r['latched2'])
        rr_score.robots_in_crater = (r['endParked1'] == 1 ? 1 : 0) + (r['endParked2'] == 1 ? 1 : 0)
        rr_score.robots_completely_in_crater = (r['endParked1'] == 2 ? 1 : 0) + (r['endParked2'] == 2 ? 1 : 0)
        rr_score.save!
        score.save!
      end
    end

    def compute_rover_ruckus_fields(match, table, val)
      stmt = 'SELECT randomization FROM ' + (table.gsub 'GameSpecific', 'Data') + " WHERE match LIKE '#{match}'"
      r = @db.execute(stmt)[0]['randomization']

      r = 1 if r <= 0

      sf1 = val & 7
      sf2 = (val & 56) >> 3
      map = [3, 5, 6, 6, 5, 3]
      (sf1 == map[r - 1] ? 1 : 0) + (sf2 == map[r - 1] ? 1 : 0)
    end

    def import_skystone_scores(phase:, table:)
      season_results = @db.execute 'SELECT match, alliance, firstReturnedSkystone, secondBrick, autoDelivered, autoReturned, autoPlaced, repositioned, navigated1, navigated2, teleopDelivered, teleopReturned, teleopPlaced, tallestTower, capstone1, capstone2, foundationMoved, parked1, parked2 FROM ' + table

      season_results.each do |r|
        match = ss_match_to_results_match(phase, r['match'])
        score = r['alliance'].zero? ? match.red_score : match.blue_score

        auto_stones = r['autoDelivered'].bytes.map { |b| { 1 => :stone, 2 => :skystone }[b] || :none }

        s_score = score.season_score
        # TODO: fix how we handle reading in that blob
        s_score.auto_skystones = auto_stones.count { |s| s == :skystone } - (r['firstReturnedSkystone'].positive? ? 1 : 0)
        s_score.auto_delivered = auto_stones.count { |s| s == :stone } - (r['autoReturned'] + (r['firstReturnedSkystone'].positive? ? 1 : 0))
        s_score.auto_placed = r['autoPlaced']
        s_score.robots_navigated = (r['navigated1'].positive? ? 1 : 0) + (r['navigated2'].positive? ? 1 : 0)
        s_score.foundation_repositioned = r['repositioned']
        s_score.teleop_placed = r['teleopPlaced']
        s_score.teleop_delivered = r['teleopDelivered'] - r['teleopReturned']
        s_score.tallest_height = r['tallestTower']
        s_score.foundation_moved = r['foundationMoved'].positive? ? 1 : 0
        s_score.robots_parked = (r['parked1'].positive? ? 1 : 0) + (r['parked2'].positive? ? 1 : 0)
        s_score.capstone_1_level = r['capstone1']
        s_score.capstone_2_level = r['capstone2']
        s_score.save!
        score.save!
      end
    end

    def import_modern_scores(phase:, results_phase:)
      stmt = "SELECT matchId, series, number, (SELECT scoreData FROM matchScores ms WHERE ms.matchId = m.matchId AND ms.alliance = 'RED') as redScore, (SELECT scoreData FROM matchScores ms WHERE ms.matchId = m.matchId AND ms.alliance = 'BLUE') as blueScore FROM matches m WHERE phase = ?"

      season_results = @db.execute stmt, phase

      season_results.each do |r|
        match = event.matches.find_by(phase: results_phase, series: results_phase == :playoff ? r['number'] : 0, number: results_phase == :playoff ? 1 : r['number'])
        red_scores = JSON.load(r['redScore'])
        blue_scores = JSON.load(r['blueScore'])
        match.red_score.season_score.update_from_fms_score!(red_scores, blue_scores)
        match.red_score.update(auto: red_scores['autoPoints'],
                                teleop: red_scores['teleopPoints'],
                                endgame: 0,
                                penalty: red_scores['foulPointsCommitted'])
        match.blue_score.season_score.update_from_fms_score!(blue_scores, red_scores)
        match.blue_score.update(auto: blue_scores['autoPoints'],
                                teleop: blue_scores['teleopPoints'],
                                endgame: 0,
                                penalty: blue_scores['foulPointsCommitted'])
      end
    end

    def elim_match_map
      @elim_match_map ||= begin
        elims = @db.execute 'SELECT match, red, blue FROM elims'

        is_finals = @db.execute("SELECT value FROM config WHERE key LIKE 'finals'")[0]['value'] == 'true'

        map = {}
        seriespos = {}
        seriespos.default = 0
        elims.each do |e|
          # if is_finals
          #   map[e['match']] = { phase: 'interfinal', number: seriespos[:interfinal] += 1 }
          #   next
          # end
          # # if e['red'] == 1 && e['blue'] == 4
          # #   map[e['match']] = { phase: 'semi', series: 1, number: seriespos[:sf1] += 1 }
          # #   next
          # # end
          # # if e['red'] == 2 && e['blue'] == 3
          # #   map[e['match']] = { phase: 'semi', series: 2, number: seriespos[:sf2] += 1 }
          # #   next
          # # end
          # if e['match'] <= 13
          #   map[e['match']] = { phase: 'semi', series: 0, number: seriespos[:sf] += 1 }
          # else
          #   map[e['match']] = { phase: 'final', number: seriespos[:final] += 1 }
          # end
          map[e['match']] = { phase: 'playoff', series: seriespos[:playoff] += 1, number: 1 }
        end
        map
      end
    end

    def ss_match_to_results_match(phase, number)
      if phase == 'qual'
        Match.where(event: event, phase: phase, number: number, event_division: event_division).first
      else
        Match.where(elim_match_map[number].merge(event: event, event_division: event_division)).first
      end
    end

    def import_league_results
      results = @db.execute "SELECT team, match, rp, tbp, score, DQ FROM leagueHistory WHERE eventCode LIKE '#{event.slug}'"

      results.each do |r|
        team = Team.find r['team']
        match = ss_match_to_results_match('qual', r['match'])
        match.set_rp_for_team(team, r['rp'])
        match.set_tbp_for_team(team, r['tbp'])
        match.set_score_for_team(team, r['score'])
        match.set_red_card_for_team(team, r['DQ'].positive?)
        match.save!
      end
    end

    def import_awards
      # TODO: consider awardOrder
      awards_given = @db.execute 'SELECT a.name as awardName, a.script, td.number as teamNumber, aa.series as place, aa.name, aa.comment FROM awardAssignments aa
                        LEFT JOIN teamData td ON td.teamId = aa.teamId
                        JOIN awards a ON a.awardId = aa.awardId
                        AND NOT (aa.teamId IS NULL AND aa.name IS NULL)'
      awards_given.each do |ag|
        award = Award.find_or_create_by(name: ag['awardName'], event: event) do |new_award|
          new_award.description = ag['script']
        end

        AwardFinalist.new(
          team_id: ag['teamNumber'],
          recipient: ag['name'],
          place: ag['place'],
          description: ag['comment'],
          award: award
        ).save!
      end
    end
  end
end
