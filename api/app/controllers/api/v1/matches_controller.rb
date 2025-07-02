module Api
  module V1
    class MatchesController < ::ApiController
      authorize_resource

      def details
        @match = Match.includes([red_score: :season_score, blue_score: :season_score])
                      .find_by!(event: Event.find_by!(slug: params[:id], season: request_season), **Match.parse_name(params[:name]))
      end
    end
  end
end
