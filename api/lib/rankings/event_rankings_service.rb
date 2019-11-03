module Rankings
  class EventRankingsService < RankingsService
    def initialize(evt)
      @evt = evt
      super(evt.season)
    end

    def initial_rankings
      @evt.teams.map do |team|
        ranking = TeamRanking.new
        ranking.team = team
        ranking.rp = 0
        ranking.tbp = 0
        ranking.high_score = 0
        ranking.matches_played = 0
        [team.number, ranking]
      end.to_h
    end

    def processed_team_rankings
      evt_rankings = raw_team_rankings.transform_values! do |lst|
        lst.each { |it| it.matches_played = lst.size }
      end
      # League championships need their rankings combined with the league ones
      return evt_rankings unless @evt.context_type == 'League'

      lrs = LeagueRankingsService.new(season: event.season)
      lrs.alliances = MatchAlliance
                      .joins(alliance: :event)
                      .includes(alliance: { alliance_teams: { team: :divisions } })
                      .where(alliance: { events: { context: @evt.context.divisions } })
      league_rankings = lrs.processed_team_rankings
      evt_rankings.transform_values! do |lst|
        team_num = lst[0].team.number
        if league_rankings.key? team_num
          lst += league_rankings[team_num]
          lst[0].matches_played += league_rankings[team_num][0].matches_played
        end
        lst
      end
    end

    def raw_team_rankings
      alliances.each_with_object(Hash.new { |h, k| h[k] = [] }) do |alliance, rankings|
        alliance.alliance.alliance_teams.each do |at|
          next unless alliance.raw_counts_for_ranking?(at.position - 1)

          ranking = TeamRanking.new
          ranking.team = at.team
          ranking.rp = alliance.rp[at.position - 1]
          ranking.tbp = alliance.tbp[at.position - 1]
          ranking.high_score = alliance.score[at.position - 1]
          rankings[at.team.number] << ranking
        end
      end
    end

    def alliances
      @alliances ||= MatchAlliance
                     .joins(alliance: :event)
                     .includes(alliance: { alliance_teams: { team: :divisions } })
                     .where(alliances: { event: @evt })
    end
  end
end
