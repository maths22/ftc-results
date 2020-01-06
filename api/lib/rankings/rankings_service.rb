module Rankings
  class RankingsService
    attr_reader :season

    def initialize(season)
      @season = season
    end

    def compute
      initial_rankings.merge(active_rankings)
    end

    def active_rankings
      processed_team_rankings.transform_values! do |lst|
        generate_ranking(lst)
      end
    end

    private

    def generate_ranking(list)
      algorithm = season.ranking_algorithm.to_sym || :traditional
      case algorithm
      when :traditional
        traditional_generate_ranking(list)
      when :skystone
        skystone_generate_ranking(list)
      else
        raise 'unknown ranking type'
      end
    end

    def traditional_generate_ranking(lst)
      ranking = TeamRanking.new
      ranking.team = lst[0].team
      ranking.division = lst[0].division
      ranking.rp = lst.map(&:rp).reduce(0, :+)
      ranking.tbp = lst.map(&:tbp).reduce(0, :+)
      ranking.high_score = lst.map(&:high_score).max
      # Note that teams are only on this list if they played a match
      ranking.matches_played = lst[0].matches_played
      ranking
    end

    def skystone_generate_ranking(lst)
      matches_played = lst.size
      tbp_matches_played = if matches_played > 5
                             matches_played - 2
                           elsif matches_played > 1
                             matches_played - 1
                           else
                             1
                           end

      ranking = TeamRanking.new
      ranking.team = lst[0].team
      ranking.division = lst[0].division
      ranking.rp = lst.map(&:rp).reduce(0, :+) / matches_played.to_f
      ranking.tbp = lst.map(&:tbp).sort.reverse[0, tbp_matches_played].reduce(0, :+) / tbp_matches_played.to_f
      ranking.high_score = lst.map(&:high_score).max
      # Note that teams are only on this list if they played a match
      ranking.matches_played = lst[0].matches_played
      ranking
    end
  end
end
