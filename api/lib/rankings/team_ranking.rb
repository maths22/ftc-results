module Rankings
  class TeamRanking
    attr_accessor :team, :league, :rp, :tbp, :high_score, :matches_played, :ranking_breaker, :can_drop

    include Comparable
    def <=>(other)
      [rp, tbp, high_score, ranking_breaker] <=> [other.rp, other.tbp, other.high_score, other.ranking_breaker]
    end
  end
end
