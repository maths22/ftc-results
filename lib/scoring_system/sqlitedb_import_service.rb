module ScoringSystem
  class SqlitedbImportService
    include ActiveStorage::Downloading
    attr_accessor :blob

    def import_to_event(event, evt_division = nil)
      self.blob = evt_division.nil? ? event.import : evt_division.import

      download_blob_to_tempfile do |file|
        @db = SQLite3::Database.new file.path
        @db.results_as_hash = true
        ActiveRecord::Base.transaction do
          verify_event(event)
          import_teams(event, evt_division)
          import_quals(event, evt_division)
          import_elims(event, evt_division)
          import_league_results(event)
          import_awards(event)
          generate_rankings(event, evt_division) unless event.context_type == 'Division'
          create_rankings(event, evt_division)

          event.finalize! unless event.finalized?
          event.save!
        end
      end

      # TODO: compute rankings :sadpanda:
    end

    private

    def verify_event(event)
      team = @db.execute "SELECT value FROM config WHERE key LIKE 'code'"
      raise "DB is for '#{team[0]['value']}', expected DB for '#{event.slug}'" unless team[0]['value'].start_with? event.slug
    end

    def import_teams(event, evt_division)
      team_list = @db.execute('SELECT number FROM teams').map { |t| t['number'] }
      new_team_nums = team_list - event.teams.pluck(:number)
      teams = new_team_nums.map { |t| Team.find_or_create_by(number: t) }

      event.teams = event.teams + teams
      event.teams = event.teams.select { |t| team_list.include? t.number } if evt_division.nil?
      unless evt_division.nil?
        event.events_teams.select { |et| team_list.include?(et.team_id) }.each do |et|
          et.event_division = evt_division
          et.save!
        end
      end
      event.save!
    end

    def import_quals(event, evt_division)
      quals = @db.execute 'SELECT match, red1, red2, blue1, blue2, red1s, red2s, blue1s, blue2s FROM quals'

      quals.each do |q|
        red_alliance = Alliance.new event: event, is_elims: false, teams: [Team.find(q['red1']), Team.find(q['red2'])], event_division: evt_division
        blue_alliance = Alliance.new event: event, is_elims: false, teams: [Team.find(q['blue1']), Team.find(q['blue2'])], event_division: evt_division
        red_alliance.save!
        blue_alliance.save!
        red_match_alliance = MatchAlliance.new alliance: red_alliance
        blue_match_alliance = MatchAlliance.new alliance: blue_alliance
        red_match_alliance.surrogate[0] = true if q['red1S'].positive?
        red_match_alliance.surrogate[1] = true if q['red2S'].positive?
        blue_match_alliance.surrogate[0] = true if q['blue1S'].positive?
        blue_match_alliance.surrogate[1] = true if q['blue2S'].positive?
        match = Match.new event: event, phase: 'qual', number: q['match'], red_alliance: red_match_alliance, blue_alliance: blue_match_alliance, event_division: evt_division
        match.red_score = Score.new
        match.blue_score = Score.new
        match.save!
      end

      quals_scores = @db.execute 'SELECT match, alliance, card1, card2, dq1, dq2, noshow1, noshow2, major, minor FROM qualsScores'
      quals_scores.each do |s|
        match = ss_match_to_results_match(event, 'qual', s['match'], evt_division)
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

      import_match_scores(event: event, evt_division: evt_division, phase: 'qual', table: 'qualsGameSpecific')
    end

    def import_elims(event, evt_division)
      alliances = @db.execute 'SELECT rank, team1, team2, team3 FROM alliances'
      alliance_map = {}
      alliances.each do |a|
        next unless a['team1'].positive?

        teams = [Team.find(a['team1']), Team.find(a['team2'])]
        teams.append(Team.find(a['team3'])) if a['team3'].positive?
        alliance = Alliance.new event: event, is_elims: true, seed: a['rank'], teams: teams, event_division: evt_division
        alliance.save!
        alliance_map[alliance.seed] = alliance
      end

      elims = @db.execute 'SELECT match, red, blue FROM elims'
      elims.each do |e|
        red_match_alliance = MatchAlliance.new alliance: alliance_map[e['red']]
        blue_match_alliance = MatchAlliance.new alliance: alliance_map[e['blue']]
        match = Match.new event: event, red_alliance: red_match_alliance, blue_alliance: blue_match_alliance, event_division: evt_division
        match.update(elim_match_map[e['match']])
        match.save!
      end
      elims_score = @db.execute 'SELECT match, alliance, card, dq, noshow1, noshow2, noshow3, major, minor FROM elimsScores'
      elims_score.each do |s|
        match = ss_match_to_results_match(event, 'elim', s['match'], evt_division)
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
        match.played = true
        match.save!
      end

      import_match_scores(event: event, evt_division: evt_division, phase: 'elim', table: 'elimsGameSpecific')
    end

    def import_match_scores(event:, phase:, table:, evt_division:)
      season_results = @db.execute 'SELECT match, alliance, landed1, landed2, claimed1, claimed2, autoParking1, autoParking2, sampleFieldState, depot, gold, silver, latched1, latched2, endParked1, endParked2 FROM ' + table

      season_results.each do |r|
        match = ss_match_to_results_match(event, phase, r['match'], evt_division)
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

    def ss_match_to_results_match(event, phase, number, evt_division)
      if phase == 'qual'
        Match.where(event: event, phase: phase, number: number, event_division: evt_division).first
      else
        Match.where(elim_match_map[number].merge(event: event, event_division: evt_division)).first
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
        match = ss_match_to_results_match(event, 'qual', r['match'], nil)
        match.set_rp_for_team(team, r['rp'])
        match.set_tbp_for_team(team, r['tbp'])
        match.set_score_for_team(team, r['score'])
        match.save!
      end
    end

    def generate_rankings(event, evt_division)
      event.matches.where(event_division: evt_division).each do |m|
        puts m.event_division&.number.to_s + ' ' + m.phase + ' ' + m.series.to_s + ' ' + m.number.to_s
        m.update_ranking_data
        m.save!
      end
    end

    def create_rankings(event, evt_division)
      Rankings::EventRankingsService.new(event).compute.values.select do |tr|
        evt_division.nil? || evt_division.team_numbers.include?(tr.team.number)
      end.sort.reverse.map.with_index do |tr, idx|
        rank = Ranking.new team: tr.team,
                           event: event,
                           event_division: evt_division,
                           ranking: idx + 1,
                           ranking_points: tr.rp,
                           tie_breaker_points: tr.tbp,
                           matches_played: tr.matches_played
        rank.save!
      end
    end

    def import_awards(event)
      # TODO consider awardOrder
      awards_given = @db.execute 'SELECT id, winnerName, winnerTeam, winnerDescription, secondName, secondTeam, thirdName, thirdTeam FROM awardAssignment'
      awards_given.each do |ag|
        a = award_definitions[ag['id']]
        award = Award.new name: a['name'],
                          description: a['description'],
                          event: event
        award.save!
        suffix = a['teamAward'].zero? ? 'Name' : 'Team'
        recipient = a['teamAward'].zero? ? :recipient : :team_id
        if ag["winner#{suffix}"] && ag["winner#{suffix}"] != -1
          AwardFinalist.new(
            recipient => ag["winner#{suffix}"],
            :place => 1,
            :description => ag['winnerDescription'],
            :award => award
          ).save!
        end
        if ag["second#{suffix}"] && ag["second#{suffix}"] != -1
          AwardFinalist.new(
            recipient => ag["second#{suffix}"],
            :place => 2,
            :award => award
          ).save!
        end
        if ag["third#{suffix}"] && ag["third#{suffix}"] != -1
          AwardFinalist.new(
            recipient => ag["third#{suffix}"],
            :place => 3,
            :award => award
          ).save!
        end
      end
    end

    def award_definitions
      @award_definitions ||= begin
        awards = @db.execute 'SELECT id, name, description, awardOrder, teamAward FROM awardInfo'
        awards.map do |a|
          [a['id'], a]
        end.to_h
      end
    end
  end
end
