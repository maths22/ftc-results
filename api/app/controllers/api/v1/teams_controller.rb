module Api
  module V1
    class TeamsController < ::ApiController
      load_and_authorize_resource

      # GET /teams
      def index
        render json: @teams, except: %i[created_at]
      end

      # GET /teams/1
      def show
        render json: @team, except: %i[created_at]
      end

      # GET /teams/1
      def details
        match_ids = @team.match_alliances.map(&:match).compact.map(&:id)

        @matches = Match.includes([:red_score, :blue_score, red_alliance: { alliance: :teams }, blue_alliance: { alliance: :teams }]).find(match_ids)
      end
    end
  end
end
