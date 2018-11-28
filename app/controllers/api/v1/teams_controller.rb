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
    end
  end
end
