module Rankings
  class LeagueRankingsService
    attr_writer :alliances
    TOP_TO_TAKE = 10

    def compute
      initial_rankings.merge(active_rankings)
    end

    def initial_rankings
      Division.includes(teams: :divisions).all.map(&:teams).flatten.map do |team|
        ranking = TeamRanking.new
        ranking.team = team
        ranking.rp = 0
        ranking.tbp = 0
        ranking.high_score = 0
        ranking.matches_played = 0
        # TODO: make sure this scopes the season right
        ranking.division = team.divisions.first
        [team.number, ranking]
      end.to_h
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
          ranking.division = at.team.divisions.first
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
                     .includes(alliance: { alliance_teams: { team: :divisions } } )
                     .where(alliance: { events: { season: ::CurrentScope.season_or_default } })
    end
  end
end
