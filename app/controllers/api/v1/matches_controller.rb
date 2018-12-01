module Api
  module V1
    class MatchesController < ::ApiController
      authorize_resource

      def details
        @match = Match.includes([red_score: :season_score, blue_score: :season_score])
                     .find(params[:id])
      end
    end
  end
end
