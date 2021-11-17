module FtcApi
  class Updater
    LEVEL_TO_PHASE = {
      'QUALIFICATION' => :qual,
      'FINAL' => :final,
      'SEMIFINAL' => :semi
    }
    class << self
      def update_teams(season)
        teams = []
        res = season_data_api.v20_season_teams_get(season.first_api_year, { state: 'IL' })
        teams += res.teams
        while res.page_current < res.page_total
          res = season_data_api.v20_season_teams_get(season.first_api_year, { state: 'IL', page: res.page_current + 1 })
          teams += res.teams
        end

        teams.each do |team_data|
          team = Team.find_or_create_by(number: team_data[:teamNumber])
          team.name = team_data[:nameShort]
          team.organization = team_data[:nameFull]
          team.city = team_data[:city]
          team.state = team_data[:stateProv]
          team.country = team_data[:country]
          team.rookie_year = team_data[:rookieYear]
          Rails.logger.error "Could not save team #{team_id}" unless team.save
        end
      end

      def update_leagues(season)
        res = leagues_api.v20_season_leagues_get(season.first_api_year, { region_code: 'USIL' })
        leagues = res.leagues

        leagues.each do |league_data|
          league = League.find_or_create_by(season: season, slug: league_data[:code])
          league.name = league_data[:name]
          if league_data[:parentLeagueCode]
            league.league = League.find_or_create_by(season: season, slug: league_data[:parentLeagueCode])
          else
            league.league = nil
          end
          Rails.logger.error "Could not save league #{league.slug}" unless league.save

          league.teams = Team.find(leagues_api.v20_season_leagues_members_region_code_league_code_get(season.first_api_year, 'USIL', league.slug).members)
          Rails.logger.error "Could not save league #{league.slug}" unless league.save

          Ranking.where(context: league).where.not(team: league.teams).delete_all
          rankings = Ranking.includes(:team).where(context: league, team: league.teams).to_a
          api_rankings = leagues_api.v20_season_leagues_rankings_region_code_league_code_get(season.first_api_year, 'USIL', league.slug).rankings
          api_rankings.each do |api_ranking|
            ranking = rankings.detect { |r| r.team.number == api_ranking[:teamNumber]} ||
              Ranking.new(context: league, team_id: api_ranking[:teamNumber])
            ranking.ranking = api_ranking[:rank]
            ranking.sort_order1 = api_ranking[:sortOrder1]
            ranking.sort_order2 = api_ranking[:sortOrder2]
            ranking.sort_order3 = api_ranking[:sortOrder3]
            ranking.sort_order4 = api_ranking[:sortOrder4]
            ranking.sort_order5 = api_ranking[:sortOrder5]
            ranking.sort_order6 = api_ranking[:sortOrder6]
            ranking.wins = api_ranking[:wins]
            ranking.losses = api_ranking[:losses]
            ranking.ties = api_ranking[:ties]
            ranking.matches_played = api_ranking[:matchesPlayed]
            ranking.matches_counted = api_ranking[:matchesCounted]
            ranking.save!
          end
        end
      end

      # TODO handle divisions
      def update_events(season, full: false)
        res = season_data_api.v20_season_events_get(season.first_api_year)
        events = res.events.select { |e| e[:regionCode] == 'USIL' && %w[1 2 3 4].include?(e[:type]) && !e[:code].start_with?('off ') }

        events.each do |event_data|
          event = Event.find_or_create_by(season: season, slug: event_data[:code])
          next unless full || event.aasm_state != 'finalized'
          event.name = event_data[:name]
          event.location = event_data[:venue]
          event.city = event_data[:city]
          event.state = event_data[:stateprov]
          event.country = event_data[:country]
          event.start_date = event_data[:dateStart]
          event.end_date = event_data[:dateEnd]
          event.aasm_state = 'finalized' if event_data[:published]
          event.type = event_data[:type].to_i
          event.remote = event_data[:remote]
          event.context = League.find_by(season: season, slug: event_data[:leagueCode]) if event_data[:leagueCode]

          Rails.logger.error "Could not save event #{event.slug}" unless event.save
          teams = []
          res = season_data_api.v20_season_teams_get(season.first_api_year, { event_code: event.slug })
          teams += res.teams
          while res.page_current < res.page_total
            res = season_data_api.v20_season_teams_get(season.first_api_year, { event_code: event.slug, page: res.page_current + 1 })
            teams += res.teams
          end

          event.teams = Team.find(teams.map { |t| t[:teamNumber] })
          unless event.remote && !event.finalized?
            import_matches(event)
            import_rankings(event) unless event.league_meet?
            import_awards(event)
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
      
      def import_matches(event)
        event_matches = Match.includes(red_score: :season_score, blue_score: :season_score, red_alliance: { alliance: :teams }, blue_alliance: { alliance: :teams }, event: []).where(event: event).to_a
        event_alliances = Alliance.includes(:teams, :event).where(event: event).to_a
        event_teams = event.teams.to_a
        quals = schedule_api.v20_season_schedule_event_code_get(event.season.first_api_year, event.slug, { tournament_level: 'qual' }).schedule
        if quals.length.positive? && !event.in_progress? && !event.finalized?
          event.start!
        end

        quals.each do |q|
          if !event.remote
            match = event_matches.detect { |m| m.phase == 'qual' && m.number == q[:matchNumber] } ||
                      Match.new(event: event, phase: 'qual', number: q[:matchNumber])
            red1 = q[:teams].detect { |t| t[:station] == 'Red1' }
            red2 = q[:teams].detect { |t| t[:station] == 'Red2' }
            blue1 = q[:teams].detect { |t| t[:station] == 'Blue1' }
            blue2 = q[:teams].detect { |t| t[:station] == 'Blue2' }
            red_teams = [event_teams.detect { |t| t.number == red1[:teamNumber] }, event_teams.detect { |t| t.number == red2[:teamNumber] }]
            blue_teams = [event_teams.detect { |t| t.number == blue1[:teamNumber] }, event_teams.detect { |t| t.number == blue2[:teamNumber] }]
            red_alliance = event_alliances.detect { |ea| !ea.is_elims && ea.teams == red_teams } ||
              Alliance.new(event: event, is_elims: false, teams: red_teams)
            blue_alliance = event_alliances.detect { |ea| !ea.is_elims && ea.teams == blue_teams } ||
              Alliance.new(event: event, is_elims: false, teams: blue_teams)
            match.red_alliance ||= MatchAlliance.new alliance: red_alliance
            match.blue_alliance ||= MatchAlliance.new alliance: blue_alliance
            match.red_alliance.surrogate[0] = red1[:surrogate]
            match.red_alliance.surrogate[1] = red1[:surrogate]
            match.blue_alliance.surrogate[0] = blue1[:surrogate]
            match.blue_alliance.surrogate[1] = blue2[:surrogate]
            match.red_alliance.teams_present[0] = !red1[:noShow]
            match.red_alliance.teams_present[1] = !red1[:noShow]
            match.blue_alliance.teams_present[0] = !blue1[:noShow]
            match.blue_alliance.teams_present[1] = !blue2[:noShow]
            event_alliances << red_alliance if red_alliance.new_record?
            event_alliances << blue_alliance if blue_alliance.new_record?
          else
            remote_team = q[:teams].detect { |t| t[:station] == '1' }
            match = event_matches.detect { |m| m.phase == 'qual' && m.number == q[:matchNumber] && m.red_alliance.alliance.teams.first.number == remote_team[:teamNumber] } ||
              Match.new(event: event, phase: 'qual', number: q[:matchNumber])
            alliance = event_alliances.detect { |ea| !ea.is_elims && ea.teams == [event_teams.detect { |t| t.number == remote_team[:teamNumber] }] } ||
              Alliance.new(event: event, is_elims: false, teams: [event_teams.detect { |t| t.number == remote_team[:teamNumber] }])
            match.red_alliance ||= MatchAlliance.new alliance: alliance
            match.blue_alliance ||= MatchAlliance.new alliance: alliance
            match.red_alliance.surrogate[0] = remote_team[:surrogate]
            match.blue_alliance.surrogate[0] = remote_team[:surrogate]
            match.red_alliance.teams_present[0] = !remote_team[:noShow]
            match.blue_alliance.teams_present[0] = !remote_team[:noShow]
            event_alliances << alliance if alliance.new_record?
          end
          event_matches << match if match.new_record?
          match.red_score ||= Score.new
          match.blue_score ||= Score.new
          match.save!
        end
        import_match_results(event, :qual, event_matches)

        alliance_list = []
        alliance_selection_api.v20_season_alliances_event_code_get(event.season.first_api_year, event.slug).alliances.each do |alliance|
          teams = []
          teams << event_teams.detect { |t| t.number == alliance[:captain] } if alliance[:captain]
          teams << event_teams.detect { |t| t.number == alliance[:round1] } if alliance[:round1]
          teams << event_teams.detect { |t| t.number == alliance[:round2] } if alliance[:round2]
          teams << event_teams.detect { |t| t.number == alliance[:round3] } if alliance[:round3]
          db_alliance = event_alliances.detect { |ea| ea.is_elims && ea.seed == alliance[:number] } ||
            Alliance.new(event: event, is_elims: true, seed: alliance[:number])
          db_alliance.teams = teams
          db_alliance.save!
          alliance_list << db_alliance
        end

        elims = schedule_api.v20_season_schedule_event_code_get(event.season.first_api_year, event.slug, { tournament_level: 'playoff' }).schedule
        elims.each do |e|
          match = event_matches.detect { |m| m.phase == (e[:tournamentLevel] == 'SEMIFINAL' ? 'semi' : 'final') && m.number == e[:matchNumber] && (e[:tournamentLevel] != 'SEMIFINAL' || m.series == e[:series])} ||
                    Match.new(event: event, phase: e[:tournamentLevel] == 'SEMIFINAL' ? 'semi' : 'final', number: e[:matchNumber], series: e[:series])

          red_teams = e[:teams].select { |t| t[:station].start_with?('Red') }.map { |t| t[:teamNumber] }
          blue_teams = e[:teams].select { |t| t[:station].start_with?('Blue') }.map { |t| t[:teamNumber] }
          match.red_alliance ||= MatchAlliance.new alliance: alliance_list.detect { |a| red_teams.each { |t| a.teams.map(&:number).include?(t) } }
          match.blue_alliance ||= MatchAlliance.new alliance: alliance_list.detect { |a| blue_teams.each { |t| a.teams.map(&:number).include?(t) } }
          match.red_alliance.alliance.teams.each_with_index do |t, i|
            match.red_alliance.teams_present[i] = red_teams.include?(t.number) && !e[:teams].detect { |tt| tt[:teamNumber] == t.number }[:noShow]
          end
          match.blue_alliance.alliance.teams.each_with_index do |t, i|
            match.blue_alliance.teams_present[i] = blue_teams.include?(t.number) && !e[:teams].detect { |tt| tt[:teamNumber] == t.number }[:noShow]
          end
          match.red_score ||= Score.new
          match.blue_score ||= Score.new

          event_matches << match if match.new_record?
          match.save!
        end
        import_match_results(event, :playoff, event_matches)
      end

      def import_rankings(event)
        Ranking.where(context: event).where.not(team: event.teams).delete_all
        rankings = Ranking.includes(:team).where(context: event, team: event.teams).to_a
        api_rankings = rankings_api.v20_season_rankings_event_code_get(event.season.first_api_year, event.slug).rankings
        api_rankings.each do |api_ranking|
          ranking = rankings.detect { |r| r.team.number == api_ranking[:teamNumber]} ||
            Ranking.new(context: event, team_id: api_ranking[:teamNumber])
          ranking.ranking = api_ranking[:rank]
          ranking.sort_order1 = api_ranking[:sortOrder1]
          ranking.sort_order2 = api_ranking[:sortOrder2]
          ranking.sort_order3 = api_ranking[:sortOrder3]
          ranking.sort_order4 = api_ranking[:sortOrder4]
          ranking.sort_order5 = api_ranking[:sortOrder5]
          ranking.sort_order6 = api_ranking[:sortOrder6]
          ranking.wins = api_ranking[:wins]
          ranking.losses = api_ranking[:losses]
          ranking.ties = api_ranking[:ties]
          ranking.matches_played = api_ranking[:matchesPlayed]
          ranking.matches_counted = api_ranking[:matchesCounted]
          ranking.save!
        end
      end

      def import_awards(event)
        awards = {}
        season_awards(event.season).each do |award|
          a = Award.find_or_create_by(name: award[:name], event: event) do |new_award|
            new_award.description = award[:description]
          end
          awards[award[:award_id]] = a
        end

        awards_api.v20_season_awards_event_code_get(event.season.first_api_year, event.slug).awards.each do |award|
          AwardFinalist.find_or_create_by(
            place: award[:series],
            award: awards[award[:award_id]]
          ) do |new_finalist|
            new_finalist.team_id = award[:team_number]
            new_finalist.recipient = award[:person]
          end
        end
      end

      def import_match_results(event, phase, matches)
        match_results_api.v20_season_scores_event_code_tournament_level_get(event.season.first_api_year, event.slug, phase.to_s).match_scores.each do |api_score|
          if event.remote?
            match = matches.detect { |m| m.number == api_score[:matchNumber] && m.red_alliance.alliance.teams.first.number == api_score[:teamNumber] }
            score = match.red_score
            score.season_score ||= event.season.score_model(remote: true).new
            score.season_score.minor_penalties = api_score[:scores][:minorPenalties]
            score.season_score.major_penalties = api_score[:scores][:majorPenalties]
            send("import_#{score.season_score.class.table_name}", score.season_score, api_score[:scores])
            score.save!
            match.played = true
            match.save!
          else
            find_by_hash = { number: api_score[:matchNumber], phase: LEVEL_TO_PHASE[api_score[:matchLevel]].to_s }
            find_by_hash[:series] = api_score[:matchSeries] if api_score[:matchSeries].positive?
            match = matches.detect { |m| find_by_hash.all? { |k, v| m.send(k) == v } }
            api_score[:alliances].each do |alliance|
              score = match.send("#{alliance[:alliance].downcase}_score")
              score.season_score ||= event.season.score_model(remote: false).new
              score.season_score.minor_penalties = alliance[:minorPenalties]
              score.season_score.major_penalties = alliance[:majorPenalties]
              send("import_#{score.season_score.class.table_name}", score.season_score, alliance)
              score.save!
              match.played = true
              match.save!
            end
          end
        end
      end

      def import_skystone_scores(score, api_score)
        score.auto_skystones = api_score[:autoStones].count { |s| s == 'SKYSTONE' } - (api_score[:firstReturnedIsSkystone] ? 1 : 0)
        score.auto_delivered = api_score[:autoStones].count { |s| s != 'NONE' }
        score.auto_placed = api_score[:autoPlaced]
        score.robots_navigated = (api_score[:robot1Navigated] ? 1 : 0) + (api_score[:robot2Navigated] ? 1 : 0)
        score.foundation_repositioned = api_score[:foundationRepositioned] ? 1 : 0
        score.teleop_placed = api_score[:driverControlledPlaced]
        score.teleop_delivered = api_score[:driverControlledDelivered] - api_score[:driverControlledReturned]
        score.tallest_height = api_score[:tallestSkyscraper]
        score.foundation_moved = api_score[:foundationMoved] ? 1 : 0
        score.robots_parked = (api_score[:robot1Parked] ? 1 : 0) + (api_score[:robot2Parked] ? 1 : 0)
        score.capstone_1_level = api_score[:robot1CapstoneLevel]
        score.capstone_2_level = api_score[:robot2CapstoneLevel]
        score.save!
      end

      def import_ultimate_goal_scores_remote(score, api_score)
        score.wobble_1_delivered = api_score[:wobbleDelivered1]
        score.wobble_2_delivered = api_score[:wobbleDelivered2]
        score.auto_tower_high = api_score[:autoTowerHigh]
        score.auto_tower_mid = api_score[:autoTowerMid]
        score.auto_tower_low = api_score[:autoTowerLow]
        score.auto_power_shot_left = api_score[:autoPowerShotLeft]
        score.auto_power_shot_center = api_score[:autoPowerShotCenter]
        score.auto_power_shot_right = api_score[:autoPowerShotRight]
        score.navigated = api_score[:navigated1]
        score.teleop_tower_high = api_score[:dcTowerHigh]
        score.teleop_tower_mid = api_score[:dcTowerMid]
        score.teleop_tower_low = api_score[:dcTowerLow]
        score.teleop_power_shot_left = api_score[:endPowerShotLeft]
        score.teleop_power_shot_center = api_score[:endPowerShotCenter]
        score.teleop_power_shot_right = api_score[:endPowerShotRight]
        score.wobble_1_rings = api_score[:wobbleRings1]
        score.wobble_2_rings = api_score[:wobbleRings2]
        score.wobble_1_end = api_score[:wobbleEnd1]
        score.wobble_2_end = api_score[:wobbleEnd2]
        score.save!
      end

      def import_freight_frenzy_scores(score, api_score)
        score.barcode_element1 = api_score[:barcodeElement1]
        score.barcode_element2 = api_score[:barcodeElement2]
        score.carousel = api_score[:carousel]
        score.auto_navigated1 = api_score[:autoNavigated1]
        score.auto_navigated2 = api_score[:autoNavigated2]
        score.auto_bonus1 = api_score[:autoBonus1]
        score.auto_bonus2 = api_score[:autoBonus2]
        score.auto_storage_freight = api_score[:autoStorageFreight]
        score.auto_freight1 = api_score[:autoFreight1]
        score.auto_freight2 = api_score[:autoFreight2]
        score.auto_freight3 = api_score[:autoFreight3]

        score.teleop_storage_freight = api_score[:driverControlledStorageFreight]
        score.teleop_freight1 = api_score[:driverControlledFreight1]
        score.teleop_freight2 = api_score[:driverControlledFreight2]
        score.teleop_freight3 = api_score[:driverControlledFreight3]
        score.shared_freight = api_score[:sharedFreight]

        score.end_delivered = api_score[:endgameDelivered]
        score.alliance_balanced = api_score[:allianceBalanced]
        score.shared_unbalanced = api_score[:sharedUnbalanced]
        score.end_parked1 = api_score[:endgameParked1]
        score.end_parked2 = api_score[:endgameParked2]
        score.capped = api_score[:capped]

        score.save!
      end

      def import_freight_frenzy_scores_remote(score, api_score)
        score.barcode_element = api_score[:barcodeElement]
        score.carousel = api_score[:carousel]
        score.auto_navigated = api_score[:autoNavigated]
        score.auto_bonus = api_score[:autoBonus]
        score.auto_storage_freight = api_score[:autoStorageFreight]
        score.auto_freight1 = api_score[:autoFreight1]
        score.auto_freight2 = api_score[:autoFreight2]
        score.auto_freight3 = api_score[:autoFreight3]

        score.teleop_storage_freight = api_score[:driverControlledStorageFreight]
        score.teleop_freight1 = api_score[:driverControlledFreight1]
        score.teleop_freight2 = api_score[:driverControlledFreight2]
        score.teleop_freight3 = api_score[:driverControlledFreight3]

        score.end_delivered = api_score[:endgameDelivered]
        score.alliance_balanced = api_score[:allianceBalanced]
        score.end_parked = api_score[:endgameParked]
        score.capped = api_score[:capped]
        
        score.save!
      end

      def season_awards(season)
        @season_awards ||= {}
        @season_awards[season.id] ||= awards_api.v20_season_awards_list_get(season.first_api_year).awards
      end

      def awards_api
        @awards_api ||= FtcEventsClient::AwardsApi.new
      end

      def match_results_api
        @match_results_api ||= FtcEventsClient::MatchResultsApi.new
      end

      def alliance_selection_api
        @alliance_selection_api ||= FtcEventsClient::AllianceSelectionApi.new
      end

      def rankings_api
        @rankings_api ||= FtcEventsClient::RankingsApi.new
      end

      def schedule_api
        @schedule_api ||= FtcEventsClient::ScheduleApi.new
      end

      def leagues_api
        @leagues_api ||= FtcEventsClient::LeaguesApi.new
      end

      def season_data_api
        @season_data_api ||= FtcEventsClient::SeasonDataApi.new
      end
    end
  end
end
