module Rankings
  class TeamRanking
    attr_accessor :team, :division, :rp, :tbp, :high_score, :matches_played

    include Comparable
    def <=>(other)
      [rp, tbp, high_score] <=> [other.rp, other.tbp, other.high_score]
    end
  end
end