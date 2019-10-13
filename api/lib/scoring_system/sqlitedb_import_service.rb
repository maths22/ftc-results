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
          import_quals
          import_elims
          import_league_results
          import_awards
          generate_rankings unless event.context_type == 'Division'
          create_rankings

          event.finalize! unless event.finalized?
          event.save!
        end
      end
    end

    private

    def verify_event
      team = @db.execute "SELECT value FROM config WHERE key LIKE 'code'"
      raise "DB is for '#{team[0]['value']}', expected DB for '#{event.slug}'" unless team[0]['value'].start_with? event.slug
    end

    def import_teams
      team_list = @db.execute('SELECT number FROM teams').map { |t| t['number'] }
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

    def import_quals
      quals = @db.execute 'SELECT match, red1, red2, blue1, blue2, red1s, red2s, blue1s, blue2s FROM quals'

      quals.each do |q|
        red_alliance = Alliance.new event: event, is_elims: false, teams: [Team.find(q['red1']), Team.find(q['red2'])], event_division: event_division
        blue_alliance = Alliance.new event: event, is_elims: false, teams: [Team.find(q['blue1']), Team.find(q['blue2'])], event_division: event_division
        red_alliance.save!
        blue_alliance.save!
        red_match_alliance = MatchAlliance.new alliance: red_alliance
        blue_match_alliance = MatchAlliance.new alliance: blue_alliance
        red_match_alliance.surrogate[0] = q['red1S'].positive?
        red_match_alliance.surrogate[1] = q['red2S'].positive?
        blue_match_alliance.surrogate[0] = q['blue1S'].positive?
        blue_match_alliance.surrogate[1] = q['blue2S'].positive?
        match = Match.new event: event, phase: 'qual', number: q['match'], red_alliance: red_match_alliance, blue_alliance: blue_match_alliance, event_division: event_division
        match.red_score = Score.new
        match.blue_score = Score.new
        match.save!
      end

      quals_scores = @db.execute 'SELECT match, alliance, card1, card2, dq1, dq2, noshow1, noshow2, major, minor FROM qualsScores'
      quals_scores.each do |s|
        match = ss_match_to_results_match('qual', s['match'])
        match_alliance = s['alliance'].zero? ? match.red_alliance : match.blue_alliance
        match_alliance.red_card[0] = s['card1'] >= 2
        match_alliance.red_card[1] = s['card2'] >= 2
        match_alliance.yellow_card[0] = s['card1'] >= 1
        match_alliance.yellow_card[1] = s['card2'] >= 1
        match_alliance.teams_present[0] = s['noshow1'].zero?
        match_alliance.teams_present[1] = s['noshow2'].zero?
        match_alliance.save!
        season_score = event.season.score_model.new major_penalties: s['major'], minor_penalties: s['minor']
        score = Score.new season_score: season_score
        # rubocop:disable Style/NumericPredicate
        match.red_score = score if s['alliance'] == 0
        match.blue_score = score if s['alliance'] == 1
        # rubocop:enable Style/NumericPredicate
        match.played = true
        match.save!
      end

      send("import_#{Season.last.score_model_name.tableize}", phase: 'qual', table: 'qualsGameSpecific')
    end

    def import_elims
      alliances = @db.execute 'SELECT rank, team1, team2, team3 FROM alliances'
      alliance_map = {}
      alliances.each do |a|
        next unless a['team1'].positive?

        teams = [Team.find(a['team1']), Team.find(a['team2'])]
        teams.append(Team.find(a['team3'])) if a['team3'].positive?
        alliance = Alliance.new event: event, is_elims: true, seed: a['rank'], teams: teams, event_division: event_division
        alliance.save!
        alliance_map[alliance.seed] = alliance
      end

      elims = @db.execute 'SELECT match, red, blue FROM elims'
      elims.each do |e|
        red_match_alliance = MatchAlliance.new alliance: alliance_map[e['red']]
        blue_match_alliance = MatchAlliance.new alliance: alliance_map[e['blue']]
        match = Match.new event: event, red_alliance: red_match_alliance, blue_alliance: blue_match_alliance, event_division: event_division
        match.update(elim_match_map[e['match']])
        match.save!
      end
      elims_score = @db.execute 'SELECT match, alliance, card, dq, noshow1, noshow2, noshow3, major, minor FROM elimsScores'
      elims_score.each do |s|
        match = ss_match_to_results_match('elim', s['match'])
        # rubocop:disable Style/NumericPredicate
        match_alliance = s['alliance'] == 0 ? match.red_alliance : match.blue_alliance
        # rubocop:enable Style/NumericPredicate
        match_alliance.red_card.fill(s['card'] >= 2)
        match_alliance.yellow_card.fill(s['card'] >= 1)
        match_alliance.teams_present[0] = s['noshow1'].zero?
        match_alliance.teams_present[1] = s['noshow2'].zero?
        match_alliance.teams_present[2] = s['noshow3'].zero?
        match_alliance.save!
        season_score = event.season.score_model.new major_penalties: s['major'], minor_penalties: s['minor']
        score = Score.new season_score: season_score
        # rubocop:disable Style/NumericPredicate
        match.red_score = score if s['alliance'] == 0
        match.blue_score = score if s['alliance'] == 1
        # rubocop:enable Style/NumericPredicate
        match.played = true
        match.save!
      end

      send("import_#{Season.last.score_model_name.tableize}", phase: 'elim', table: 'elimsGameSpecific')
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
        s_score.auto_skystones = auto_stones.count { |s| s == :skystone } - r['firstReturnedSkystone'] ? 1 : 0
        s_score.auto_delivered = r['autoDelivered'] - r['autoReturned'] - auto_stones.count { |s| s == :skystone }
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

    def elim_match_map
      @elim_match_map ||= begin
        elims = @db.execute 'SELECT match, red, blue FROM elims'

        is_finals = @db.execute("SELECT value FROM config WHERE key LIKE 'finals'")[0]['value'] == 'true'

        map = {}
        seriespos = {}
        seriespos.default = 0
        elims.each do |e|
          if is_finals
            map[e['match']] = { phase: 'interfinal', number: seriespos[:interfinal] += 1 }
            next
          end
          if e['red'] == 1 && e['blue'] == 4
            map[e['match']] = { phase: 'semi', series: 1, number: seriespos[:sf1] += 1 }
            next
          end
          if e['red'] == 2 && e['blue'] == 3
            map[e['match']] = { phase: 'semi', series: 2, number: seriespos[:sf2] += 1 }
            next
          end
          map[e['match']] = { phase: 'final', number: seriespos[:final] += 1 }
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
        match.set_red_card_for_team(team, r['DQ'])
        match.save!
      end
    end

    def generate_rankings
      event.matches.where(event_division: event_division).each do |m|
        m.update_ranking_data
        m.save!
      end
    end

    def create_rankings
      base_rankings = Rankings::EventRankingsService.new(event).compute.values.select do |tr|
        event_division.nil? || event_division.team_numbers.include?(tr.team.number)
      end
      base_rankings.sort.reverse.map.with_index do |tr, idx|
        rank = Ranking.new team: tr.team,
                           event: event,
                           event_division: event_division,
                           ranking: idx + 1,
                           ranking_points: tr.rp,
                           tie_breaker_points: tr.tbp,
                           matches_played: tr.matches_played
        rank.save!
      end
    end

    def import_awards
      # TODO: consider awardOrder
      awards_given = @db.execute 'SELECT Award.Description, Award.Script, Team.TeamNumber, AwardAssignment.FirstName, AwardAssignment.LastName, AwardAssignment.Series as Place, AwardAssignment.Comment FROM AwardAssignment
                        LEFT JOIN Team ON Team.FMSTeamId = AwardAssignment.FMSTeamId
                        JOIN Award ON Award.FMSAwardId = AwardAssignment.FMSAwardId
                        AND NOT (TeamNumber IS NULL AND FirstName IS NULL AND LastName IS NULL)'
      awards_given.each do |ag|
        award = Award.find_or_create_by(name: a['Description'], event: event) do |new_award|
          new_award.script = ag['Script']
        end

        AwardFinalist.new(
          team_number: ag['TeamNumber'],
          recipient: "#{ag['FirstName']} #{ag['LastName']}".strip,
          place: ag['Place'],
          description: ag['Comment'],
          award: award
        ).save!
      end
    end
  end
end
