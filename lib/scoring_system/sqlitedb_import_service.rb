module ScoringSystem
  class SqlitedbImportService
    include ActiveStorage::Downloading
    attr_accessor :blob

    def import_to_event(event)
      self.blob = event.import

      download_blob_to_tempfile do |file|
        @db = SQLite3::Database.new file.path
        @db.results_as_hash = true
        ActiveRecord::Base.transaction do
          verify_event(event)
          import_teams(event)
          import_quals(event)
          import_elims(event)
          import_league_results(event)
          generate_rankings(event) unless event.context_type == 'Division'
          create_rankings(event)

          event.finalize!
          event.save!
        end
      end

      # TODO: compute rankings :sadpanda:
    end

    private

    def verify_event(event)
      team = @db.execute "SELECT value FROM config WHERE key LIKE 'code'"
      raise "DB is for '#{team[0]['value']}', expected DB for '#{event.slug}'" unless team[0]['value'] == event.slug
    end

    def import_teams(event)
      teams = @db.execute 'SELECT number FROM teams'
      teams = Team.find(teams.map { |t| t['number'] })
      event.teams = teams
      event.save!
    end

    def import_quals(event)
      quals = @db.execute 'SELECT match, red1, red2, blue1, blue2, red1s, red2s, blue1s, blue2s FROM quals'

      quals.each do |q|
        red_alliance = Alliance.new event: event, is_elims: false, teams: Team.find([q['red1'], q['red2']])
        blue_alliance = Alliance.new event: event, is_elims: false, teams: Team.find([q['blue1'], q['blue2']])
        red_alliance.save!
        blue_alliance.save!
        red_match_alliance = MatchAlliance.new alliance: red_alliance
        blue_match_alliance = MatchAlliance.new alliance: blue_alliance
        red_match_alliance.surrogate[0] = true if q['red1S'].positive?
        red_match_alliance.surrogate[1] = true if q['red2S'].positive?
        blue_match_alliance.surrogate[0] = true if q['blue1S'].positive?
        blue_match_alliance.surrogate[1] = true if q['blue2S'].positive?
        match = Match.new event: event, phase: 'qual', number: q['match'], red_alliance: red_match_alliance, blue_alliance: blue_match_alliance
        match.red_score = Score.new
        match.blue_score = Score.new
        match.save!
      end

      quals_scores = @db.execute 'SELECT match, alliance, card1, card2, dq1, dq2, noshow1, noshow2, major, minor FROM qualsScores'
      quals_scores.each do |s|
        match = ss_match_to_results_match(event, 'qual', s['match'])
        match_alliance = s['alliance'].zero? ? match.red_alliance : match.blue_alliance
        match_alliance.red_card[0] = true if s['card1'] >= 2
        match_alliance.red_card[1] = true if s['card2'] >= 2
        match_alliance.yellow_card[0] = true if s['card1'] >= 1
        match_alliance.yellow_card[1] = true if s['card2'] >= 1
        match_alliance.present[0] = false if s['noshow1'].positive?
        match_alliance.present[1] = false if s['noshow2'].positive?
        match_alliance.save!
        #TODO generalize
        rr_score = RoverRuckusScore.new major_penalties: s['major'], minor_penalties: s['minor']
        score = Score.new season_score: rr_score
        match.red_score = score if s['alliance'] == 0
        match.blue_score = score if s['alliance'] == 1
        match.played = true
        match.save!
      end

      import_match_scores(event: event, phase: 'qual', table: 'qualsGameSpecific')
    end

    def import_elims(event)
      alliances = @db.execute 'SELECT rank, team1, team2, team3 FROM alliances'
      alliance_map = {}
      alliances.each do |a|
        teams = Team.find_by number: [a['team1'], a['team2'], a['team3']]
        alliance = Alliance.new event: event, is_elims: true, seed: a['rank'], teams: teams
        alliance.save!
        alliance_map[alliance.seed] = alliance
      end

      elims = @db.execute 'SELECT match, red, blue FROM elims'
      elims.each do |e|
        red_match_alliance = MatchAlliance.new alliance: alliance_map[e['red']]
        blue_match_alliance = MatchAlliance.new alliance: alliance_map[e['blue']]
        match = Match.new event: event, red_alliance: red_match_alliance, blue_alliance: blue_match_alliance
        match.update(elim_match_map[e['match']])
        match.save!
      end
      quals_scores = @db.execute 'SELECT match, alliance, card, dq, noshow1, noshow2, noshow3, major, minor FROM elimsScores'
      quals_scores.each do |s|
        match = ss_match_to_results_match(event, 'elim', elim_match_map[s['match']])
        match_alliance = s['alliance'] == 0 ? match.red_alliance : match.blue_alliance
        match_alliance.red_card.fill(true) if s['card'] >= 2
        match_alliance.yellow_card.fill(true) if s['card'] >= 1
        match_alliance.present[0] = false if s['noshow1']
        match_alliance.present[1] = false if s['noshow2']
        match_alliance.present[2] = false if s['noshow3']
        match_alliance.save!
        rr_score = RoverRuckusScore.new major_penalties: s['major'], minor_penalties: s['minor']
        score = Score.new season_score: rr_score
        match.red_score = score if s['alliance'] == 0
        match.blue_score = score if s['alliance'] == 1
        match.save!
      end

      import_match_scores(event: event, phase: 'elim', table: 'elimsGameSpecific')
    end

    def import_match_scores(event:, phase:, table:)
      season_results = @db.execute 'SELECT match, alliance, landed1, landed2, claimed1, claimed2, autoParking1, autoParking2, sampleFieldState, depot, gold, silver, latched1, latched2, endParked1, endParked2 FROM ' + table

      season_results.each do |r|
        match = ss_match_to_results_match(event, phase, r['match'])
        score = r['alliance'].zero? ? match.red_score : match.blue_score
        rr_score = score.season_score
        rr_score.robots_landed = (r['landed1']) + (r['landed2'])
        rr_score.depots_claimed = (r['claimed1']) + (r['claimed2'])
        rr_score.robots_parked_auto = (r['autoParking1']) + (r['autoParking2'])
        rr_score.fields_sampled = compute_fields(r['match'], table, r['sampleFieldState'])
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

    def elim_match_map
      @elim_match_map ||= begin
        elims = @db.execute 'SELECT match, red, blue FROM elims'
        map = {}
        seriespos = {}
        seriespos.default = 0
        elims.each do |e|
          if e.red == 1 && e.blue == 4
            map[e.match] = { phase: 'semi', series: 1, number: seriespos[:sf1] += 1 }
            next
          end
          if e.red == 2 && e.blue == 3
            map[e.match] = { phase: 'semi', series: 2, number: seriespos[:sf2] += 1 }
            next
          end
          map[e.match] = { phase: 'final', number: seriespos[:final] += 1 }
        end
      end
    end

    def ss_match_to_results_match(event, phase, number)
      if phase == 'qual'
        Match.where(event: event, phase: phase, number: number).first
      else
        Match.where(elim_match_map[number].merge(event: event)).first
      end
    end

    def compute_fields(match, table, val)
      stmt = 'SELECT randomization FROM ' + (table.gsub 'GameSpecific', 'Data') + " WHERE match LIKE '#{match}'"
      r = @db.execute(stmt)[0]['randomization']

      r = 1 if r <= 0

      sf1 = val & 7
      sf2 = (val & 56) >> 3
      map = [3, 5, 6, 6, 5, 3]
      (sf1 == map[r - 1] ? 1 : 0) + (sf2 == map[r - 1] ? 1 : 0)
    end

    def import_league_results(event)
      results = @db.execute "SELECT team, match, rp, tbp, score FROM leagueHistory WHERE eventCode LIKE '#{event.slug}'"

      results.each do |r|
        team = Team.find r['team']
        match = ss_match_to_results_match(event, 'qual', r['match'])
        match.set_rp_for_team(team, r['rp'])
        match.set_tbp_for_team(team, r['tbp'])
        match.set_score_for_team(team, r['score'])
        match.save!
      end
    end

    def generate_rankings(event)
      event.matches.each do |m|
        m.update_ranking_data
        m.save!
      end
    end

    def create_rankings(event)
        Rankings::EventRankingsService.new(event).compute.values.sort.reverse.map.with_index do |tr, idx|
        rank = Ranking.new team: tr.team,
                           event: event,
                           ranking: idx + 1,
                           ranking_points: tr.rp,
                           tie_breaker_points: tr.tbp,
                           matches_played: tr.matches_played
        rank.save!
      end
    end
  end
end
