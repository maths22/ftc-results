module Rankings
  class LeagueRankingsService
    attr_writer :alliances
    TOP_TO_TAKE = 10

    def initialize(season)
      @season = season
    end

    def compute
      initial_rankings.merge(active_rankings)
    end

    def merge_with_event_rankings(evt, evt_rankings)
      self.alliances = MatchAlliance
                       .joins(alliance: :event)
                       .includes(alliance: { alliance_teams: { team: :divisions } })
                       .where(alliance: { events: { context: evt.context.divisions } })
      league_rankings = compute
      evt_rankings.map! do |rk|
        lst = [rk]
        lst << league_rankings[rk.team.number] if league_rankings.key? rk.team.number
        lst[0].matches_played += league_rankings[rk.team.number].matches_played if league_rankings.key? rk.team.number
        lst
      end
      evt_rankings.map! do |lst|
        ranking = TeamRanking.new
        ranking.team = lst[0].team
        ranking.division = lst[0].division
        ranking.rp = lst.map(&:rp).reduce(0, :+)
        ranking.tbp = lst.map(&:tbp).reduce(0, :+)
        ranking.high_score = lst.map(&:high_score).max
        ranking.matches_played = lst[0].matches_played
        ranking
      end
    end

    def initial_rankings
      divisions = Division.joins(:league).where(leagues: { season: @season }).includes(teams: :divisions)
      divisions.all.map do |div|
        div.teams.map do |team|
          ranking = TeamRanking.new
          ranking.team = team
          ranking.rp = 0
          ranking.tbp = 0
          ranking.high_score = 0
          ranking.matches_played = 0
          ranking.division = div
          [team.number, ranking]
        end
      end.flatten(1).to_h
    end

    def active_rankings
      processed_team_rankings.transform_values! do |lst|
        top_lst = lst.first TOP_TO_TAKE
        ranking = TeamRanking.new
        ranking.team = lst[0].team
        ranking.division = lst[0].division
        ranking.rp = top_lst.map(&:rp).reduce(0, :+)
        ranking.tbp = top_lst.map(&:tbp).reduce(0, :+)
        ranking.high_score = top_lst.map(&:high_score).max
        # Note that teams are only on this list if they played a match
        ranking.matches_played = lst[0].matches_played
        ranking
      end
    end

    def processed_team_rankings
      raw_team_rankings.transform_values! do |lst|
        lst.each { |it| it.matches_played = lst.size }
        lst.sort.reverse
      end
    end

    def raw_team_rankings
      alliances.each_with_object(Hash.new { |h, k| h[k] = [] }) do |alliance, rankings|
        alliance.alliance.alliance_teams.each do |at|
          next unless alliance.raw_counts_for_ranking?(at.position - 1)

          ranking = TeamRanking.new
          ranking.team = at.team
          ranking.division = at.team.divisions.select { |div| div.league.season_id == alliance.alliance.event.season_id }.first
          ranking.rp = alliance.rp[at.position - 1]
          ranking.tbp = alliance.tbp[at.position - 1]
          ranking.high_score = alliance.score[at.position - 1]
          rankings[at.team.number] << ranking
        end
      end
    end

    def alliances
      @alliances ||= MatchAlliance
                     .includes(alliance: { alliance_teams: { team: { divisions: :league } }, event: {} })
                     .where(alliance: { events: { season: @season, context_type: 'Division' } })
    end
  end
end
