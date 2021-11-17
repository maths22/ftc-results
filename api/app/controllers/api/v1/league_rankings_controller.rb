module Api
  module V1
    class LeagueRankingsController < ::ApiController
      def index
        authorize! :show, :rankings
        @leagues = League.where(season: request_season).all
        @rankings = Ranking.where(context: @leagues)
      end

      def league_data
        authorize! :show, :rankings
        league = League.find_by!(slug: params[:id], season: request_season)
        @leagues = League.where(season: league.season).all
        @rankings = Ranking.where(context: @leagues)
      end
    end
  end
end
