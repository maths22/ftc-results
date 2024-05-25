module Api
  module V1
    class LeagueRankingsController < ::ApiController
      def index
        authorize! :show, :rankings
        @rankings = Ranking.where(context: League.where(season: request_season).leaf).order(
          sort_order1: :desc, sort_order2: :desc, sort_order3: :desc, sort_order4: :desc, sort_order5: :desc, sort_order6: :desc)
      end

      def league_data
        authorize! :show, :rankings
        league = League.find_by!(slug: params[:id], season: request_season)
        # Use child leagues if they exist
        @rankings = Ranking.where(context: league.leagues.count > 0 ? league.leagues : [league]).order(
          sort_order1: :desc, sort_order2: :desc, sort_order3: :desc, sort_order4: :desc, sort_order5: :desc, sort_order6: :desc)
      end
    end
  end
end
