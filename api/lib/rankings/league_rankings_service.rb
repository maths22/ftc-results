module Rankings
  class LeagueRankingsService < RankingsService
    attr_writer :alliances
    TOP_TO_TAKE = 10

    def initial_rankings
      divisions = Division.joins(:league).where(leagues: { season: season }).includes(teams: :divisions)
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

    def processed_team_rankings
      raw_team_rankings.transform_values! do |lst|
        lst.each { |it| it.matches_played = lst.size }
        lst.sort.reverse.first(TOP_TO_TAKE)
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
                     .where(alliance: { events: { season: season, context_type: 'Division' } })
    end
  end
end
