module FtcApi
  class Updater
    LEVEL_TO_PHASE = {
      FtcApiV3Client::ApiV3TournamentLevel::PRACTICE => "practice",
      FtcApiV3Client::ApiV3TournamentLevel::QUALIFICATION => "qual",
      FtcApiV3Client::ApiV3TournamentLevel::FINAL => "final",
      FtcApiV3Client::ApiV3TournamentLevel::SEMIFINAL => "semi",
      FtcApiV3Client::ApiV3TournamentLevel::PLAYOFF => "playoff",
    }
    class << self
      def update_teams(season)
        teams = teams_api.list_teams(season.first_api_year).teams

        teams.each do |team_data|
          team = Team.find_or_create_by(number: team_data.number)
          team.name = team_data.name
          team.organization = team_data.affiliations
          team.city = team_data.city
          team.state = team_data.state_prov
          team.country = team_data.country
          team.rookie_year = team_data.rookie_cmp_year - 1 # For consistency with old API
          Rails.logger.error "Could not save team #{team_id}" unless team.save
        end
      end

      def update_leagues(season)
        leagues = leagues_api.list_leagues(season.first_api_year, 'USIL').leagues

        leagues.each do |league_data|
          league = League.find_or_create_by(season: season, slug: league_data.code)
          league.name = league_data.name
          if league_data.parent_code
            league.league = League.find_or_create_by(season: season, slug: league_data.parent_code)
          else
            league.league = nil
          end
          Rails.logger.error "Could not save league #{league.slug}" unless league.save

          league.teams = Team.find(leagues_api.list_league_teams(season.first_api_year, 'USIL', league.slug).teams.map { |t| t.number })
          Rails.logger.error "Could not save league #{league.slug}" unless league.save

          Ranking.where(context: league).where.not(team: league.teams).delete_all
          rankings = Ranking.includes(:team).where(context: league, team: league.teams).to_a
          api_rankings = leagues_api.get_league_rankings(season.first_api_year, 'USIL', league.slug).rankings
          api_rankings.each do |api_ranking|
            ranking = rankings.detect { |r| r.team.number.to_s == api_ranking.team.number} ||
              Ranking.new(context: league, team_id: api_ranking.team.number)
            ranking.ranking = api_ranking.rank
            ranking.sort_order1 = api_ranking.sort_orders[0]
            ranking.sort_order2 = api_ranking.sort_orders[1]
            ranking.sort_order3 = api_ranking.sort_orders[2]
            ranking.sort_order4 = api_ranking.sort_orders[3]
            ranking.sort_order5 = api_ranking.sort_orders[4]
            ranking.sort_order6 = api_ranking.sort_orders[5]
            ranking.wins = api_ranking.wins
            ranking.losses = api_ranking.losses
            ranking.ties = api_ranking.ties
            ranking.matches_played = api_ranking.matches_played
            ranking.matches_counted = api_ranking.matches_counted
            ranking.save!
          end
        end
      end

      # TODO handle divisions
      def update_events(season, full: false)
        res = regions_api.list_region_events(season.first_api_year, 'USIL')
        events = res.events.select { |e| [FtcApiV3Client::ApiV3EventType::LEAGUE_MEET, FtcApiV3Client::ApiV3EventType::QUALIFIER, FtcApiV3Client::ApiV3EventType::LEAGUE_TOURNAMENT, FtcApiV3Client::ApiV3EventType::CHAMPIONSHIP].include?(e.type) && !e.code.start_with?('off ') }

        events.each do |event_data|
          event = Event.find_or_create_by(season: season, slug: event_data.code)
          next unless full || event.aasm_state != 'finalized'
          event.name = event_data.name
          event.location = event_data.venue
          event.address = event_data.street_address
          event.city = event_data.city
          event.state = event_data.state
          event.country = event_data.country
          event.start_date = event_data.start_date
          event.end_date = event_data.end_date
          event.aasm_state = 'finalized' if event_data.published
          event.timezone = event_data.timezone
          event.type = {
            FtcApiV3Client::ApiV3EventType::SCRIMMAGE => 0,
            FtcApiV3Client::ApiV3EventType::LEAGUE_MEET => 1,
            FtcApiV3Client::ApiV3EventType::QUALIFIER => 2,
            FtcApiV3Client::ApiV3EventType::LEAGUE_TOURNAMENT => 3,
            FtcApiV3Client::ApiV3EventType::CHAMPIONSHIP => 4,
            FtcApiV3Client::ApiV3EventType::PREMIER => 5,
          }[event_data.type]
          event.remote = event_data.format == FtcApiV3Client::ApiV3EventFormat::REMOTE
          event.context = League.find_by(season: season, slug: event_data.league_code) if event_data.league_code

          event_data.divisions.each do |div|
            event.event_divisions.find_or_create_by(slug: div.event_code.delete_prefix(event_data.code)).update(name: div.name)
          end

          Rails.logger.error "Could not save event #{event.slug}" unless event.save
          teams = events_api.list_event_teams(season.first_api_year, event_data.code).participants
          event.teams = Team.find(teams.map { |t| t.team.number })
          teams.filter(&:division_event_code).group_by(&:division_event_code).each do |div, teams|
            div = event.event_divisions.find_by(slug: div.delete_prefix(event_data.code))
            event.events_teams.joins(:team).where(team: { number: teams.map { |t| t.team.number } }).update_all(event_division_id: div.id)
          end
          unless event.remote && !event.finalized?
            import_matches(event, nil)
            import_match_results(event, nil)
            unless event.league_meet?
              import_rankings(event, nil) unless event.divisions?
              import_awards(event)
            end
            event.event_divisions.each do |division|
              import_matches(event, division)
              import_match_results(event, division)
              import_rankings(event, division)
            end
          end
          Rails.logger.error "Could not save event #{league.slug}" unless event.save
        end
      end

      def update(season, full: false)
        update_teams(season)
        update_leagues(season)
        update_events(season, full: full)
      end

      private
      
      def import_matches(event, division = nil)
        event_matches = Match.includes(red_score: :season_score, blue_score: :season_score, red_alliance: { alliance: :teams }, blue_alliance: { alliance: :teams }, event: []).where(event: event, event_division: division).to_a
        event_alliances = Alliance.includes(:teams, :event).where(event: event, event_division: division).to_a
        event_teams = event.teams.to_a
        practice = events_api.list_event_matches(event.season.first_api_year, event.slug + (division ? division.slug : ''), { phase: FtcApiV3Client::ApiV3TournamentLevel::PRACTICE }).matches
        quals = events_api.list_event_matches(event.season.first_api_year, event.slug + (division ? division.slug : ''), { phase: FtcApiV3Client::ApiV3TournamentLevel::QUALIFICATION }).matches
        if (practice.length.positive? || quals.length.positive?) && !event.in_progress? && !event.finalized?
          event.start!
        end

        (practice + quals).each do |q|
          if !event.remote
            match = event_matches.detect { |m| m.phase == LEVEL_TO_PHASE[q.tournament_level] && m.number == q.number } ||
                      Match.new(event: event, event_division: division, phase: LEVEL_TO_PHASE[q.tournament_level], number: q.number)
            red1 = q.teams.red_alliance.teams[0]
            red2 = q.teams.red_alliance.teams[1]
            blue1 = q.teams.blue_alliance.teams[0]
            blue2 = q.teams.blue_alliance.teams[1]
            red_teams = [event_teams.detect { |t| t.number.to_s == red1.team.number }, event_teams.detect { |t| t.number.to_s == red2.team.number }]
            blue_teams = [event_teams.detect { |t| t.number.to_s == blue1.team.number }, event_teams.detect { |t| t.number.to_s == blue2.team.number }]
            red_alliance = event_alliances.detect { |ea| !ea.is_elims && ea.teams == red_teams } ||
              Alliance.new(event: event, event_division: division, is_elims: false, teams: red_teams)
            blue_alliance = event_alliances.detect { |ea| !ea.is_elims && ea.teams == blue_teams } ||
              Alliance.new(event: event, event_division: division, is_elims: false, teams: blue_teams)
            match.red_alliance ||= MatchAlliance.new(alliance: red_alliance)
            match.blue_alliance ||= MatchAlliance.new(alliance: blue_alliance)
            match.red_alliance.surrogate[0] = red1.surrogate
            match.red_alliance.surrogate[1] = red2.surrogate
            match.blue_alliance.surrogate[0] = blue1.surrogate
            match.blue_alliance.surrogate[1] = blue2.surrogate
            match.red_alliance.teams_present[0] = !red1.disqualified
            match.red_alliance.teams_present[1] = !red2.disqualified
            match.blue_alliance.teams_present[0] = !blue1.disqualified
            match.blue_alliance.teams_present[1] = !blue2.disqualified
            event_alliances << red_alliance if red_alliance.new_record?
            event_alliances << blue_alliance if blue_alliance.new_record?
          else
            remote_team = q.teams.team
            match = event_matches.detect { |m| m.phase == LEVEL_TO_PHASE[q.tournament_level] && m.number == q.team.number && m.red_alliance.alliance.teams.first.number == remote_team.team.number } ||
              Match.new(event: event, phase: LEVEL_TO_PHASE[q.tournament_level], number: q.team.number)
            alliance = event_alliances.detect { |ea| !ea.is_elims && ea.teams == [event_teams.detect { |t| t.number == q.team.number }] } ||
              Alliance.new(event: event, is_elims: false, teams: [event_teams.detect { |t| t.number == q.team.number }])
            match.red_alliance ||= MatchAlliance.new alliance: alliance
            match.blue_alliance ||= MatchAlliance.new alliance: alliance
            match.red_alliance.surrogate[0] = remote_team.surrogate
            match.blue_alliance.surrogate[0] = remote_team.surrogate
            match.red_alliance.teams_present[0] = !remote_team.disqualified
            match.blue_alliance.teams_present[0] = !remote_team.disqualified
            event_alliances << alliance if alliance.new_record?
          end
          event_matches << match if match.new_record?
          match.red_score ||= Score.new
          match.blue_score ||= Score.new
          match.scheduled_start = q.scheduled_start_time
          match.start = q.start_time
          match.save!
        end

        return if event.league_meet?
        alliance_list = []
        events_api.get_event_alliances(event.season.first_api_year, event.slug + (division ? division.slug : '')).alliances.each do |alliance|
          teams = alliance.teams.map { |t| event_teams.detect { |et| et.number.to_s == t.number } }
          db_alliance = event_alliances.detect { |ea| ea.is_elims && ea.seed == alliance.seed } ||
            Alliance.new(event: event, event_division: division, is_elims: true, seed: alliance.seed)
          db_alliance.teams = teams
          db_alliance.save!
          alliance_list << db_alliance
        end

        elims = events_api.list_event_matches(event.season.first_api_year, event.slug + (division ? division.slug : ''), { phase: FtcApiV3Client::ApiV3TournamentLevel::PLAYOFF }).matches
        elims.each do |e|
          match = event_matches.detect { |m| LEVEL_TO_PHASE[e.tournament_level] && m.number == e.number && m.series == e.series } ||
                    Match.new(event: event, event_division: division, phase: LEVEL_TO_PHASE[e.tournament_level], number: e.number, series: e.series)

          red_seed = e.teams.red_alliance.seed
          blue_seed = e.teams.blue_alliance.seed
          match.red_alliance ||= MatchAlliance.new alliance: alliance_list.detect { |a| a.seed == red_seed }
          match.blue_alliance ||= MatchAlliance.new alliance: alliance_list.detect { |a| a.seed == blue_seed }
          match.red_alliance.alliance.teams.each_with_index do |t, i|
            match.red_alliance.teams_present[i] = e.teams.red_alliance.teams[i].on_field
          end
          match.blue_alliance.alliance.teams.each_with_index do |t, i|
            match.blue_alliance.teams_present[i] = e.teams.blue_alliance.teams[i].on_field
          end
          match.red_score ||= Score.new
          match.blue_score ||= Score.new
          match.scheduled_start = e.scheduled_start_time
          match.start = e.start_time

          event_matches << match if match.new_record?
          match.save!
        end
      end

      def import_rankings(event, division = nil)
        Ranking.where(context: event).where.not(team: event.teams).delete_all
        rankings = Ranking.includes(:team).where(context: event, team: event.teams).to_a
        api_rankings = events_api.get_event_rankings(event.season.first_api_year, event.slug + (division ? division.slug : '')).rankings
        api_rankings.each do |api_ranking|
          ranking = rankings.detect { |r| r.team.number.to_s == api_ranking.team.number } ||
            Ranking.new(context: event, event_division: division, team_id: api_ranking.team.number)
          ranking.ranking = api_ranking.rank
          ranking.sort_order1 = api_ranking.sort_orders[0]
          ranking.sort_order2 = api_ranking.sort_orders[1]
          ranking.sort_order3 = api_ranking.sort_orders[2]
          ranking.sort_order4 = api_ranking.sort_orders[3]
          ranking.sort_order5 = api_ranking.sort_orders[4]
          ranking.sort_order6 = api_ranking.sort_orders[5]
          ranking.wins = api_ranking.wins
          ranking.losses = api_ranking.losses
          ranking.ties = api_ranking.ties
          ranking.matches_played = api_ranking.matches_played
          ranking.matches_counted = api_ranking.matches_counted
          ranking.save!
        end
      end

      def import_awards(event)
        events_api.get_event_awards(event.season.first_api_year, event.slug).awards.each do |award|
          db_award = Award.find_or_create_by(name: award.name, event: event) do |new_award|
            new_award.description = award.description
          end
          next unless db_award
          award.recipients.each_with_index do |rec, idx|
            AwardFinalist.find_or_create_by(
              place: rec.place || idx,
              award: db_award
            ) do |new_finalist|
              new_finalist.team_id = rec.team&.number
              new_finalist.recipient = rec.name
              new_finalist.description = rec.comment
            end
          end
        end
      end

      def import_match_results(event, division = null)
        event.matches.where(event_division: division).each do |match|
          api_score = events_api.get_event_match(event.season.first_api_year, event.slug + (division ? division.slug : ''), LEVEL_TO_PHASE.invert[match.phase], match.series || 0, match.number)
          match.random = api_score.random
          next unless api_score.match_results
          if event.remote?
            score = match.red_score
            score.season_score ||= event.season.score_model(remote: true).new
            send("import_#{score.season_score.class.table_name}", score.season_score, api_score.match_results_details.details)
            score.save!
            match.played = true
            match.save!
          else
            [:red, :blue].each do |alliance|
              score = match.send("#{alliance}_score")
              score.season_score ||= event.season.score_model(remote: false).new
              score.season_score.score = score
              score.save!
              send("import_#{score.season_score.class.table_name}", score.season_score, api_score.match_results_details.send("#{alliance}_details"))
              score.save!
              match.played = true
              match.save!
            end
          end
        end
      end

      def import_decode_scores(score, api_score)
        score.auto_classified_artifacts = api_score.achievements.auto_classified_artifacts
        score.auto_overflow_artifacts = api_score.achievements.auto_overflow_artifacts
        score.auto_classifier_state = api_score.achievements.auto_classifier_state
        score.auto_robot1 = api_score.achievements.robot1_auto
        score.auto_robot2 = api_score.achievements.robot2_auto
        score.teleop_classified_artifacts = api_score.achievements.teleop_classified_artifacts
        score.teleop_overflow_artifacts = api_score.achievements.teleop_overflow_artifacts
        score.teleop_depot_artifacts = api_score.achievements.teleop_depot_artifacts
        score.teleop_classifier_state = api_score.achievements.teleop_classifier_state
        score.teleop_robot1 = api_score.achievements.robot1_teleop
        score.teleop_robot2 = api_score.achievements.robot2_teleop
        score.major_penalties = api_score.achievements.major_fouls
        score.minor_penalties = api_score.achievements.minor_fouls

        score.movement_rp = api_score.points.movement_rp
        score.goal_rp = api_score.points.goal_rp
        score.pattern_rp = api_score.points.pattern_rp

        score.save!
      end

      def import_into_the_deep_scores(score, api_score)
        score.auto_robot1 = api_score[:robot1Auto]
        score.auto_robot2 = api_score[:robot2Auto]
        score.auto_sample_net = api_score[:autoSampleNet]
        score.auto_sample_low = api_score[:autoSampleLow]
        score.auto_sample_high = api_score[:autoSampleHigh]
        score.auto_specimen_low = api_score[:autoSpecimenLow]
        score.auto_specimen_high = api_score[:autoSpecimenHigh]

        score.teleop_sample_net = api_score[:teleopSampleNet]
        score.teleop_sample_low = api_score[:teleopSampleLow]
        score.teleop_sample_high = api_score[:teleopSampleHigh]
        score.teleop_specimen_low = api_score[:teleopSpecimenLow]
        score.teleop_specimen_high = api_score[:teleopSpecimenHigh]

        score.teleop_robot1 = api_score[:robot1Teleop]
        score.teleop_robot2 = api_score[:robot2Teleop]

        score.minor_penalties = api_score[:minorFouls]
        score.major_penalties = api_score[:majorFouls]

        score.save!
      end

      def teams_api
        @teams_api ||= FtcApiV3Client::TeamsApi.new
      end

      def leagues_api
        @leagues_api ||= FtcApiV3Client::LeaguesApi.new
      end

      def regions_api
        @regions_api ||= FtcApiV3Client::RegionsApi.new
      end

      def events_api
        @events_api ||= FtcApiV3Client::EventsApi.new
      end
    end
  end
end
