module Api
  module V1
    class LeaguesController < ::ApiController
      load_and_authorize_resource

      # GET /teams
      def index
        render json: @leagues,
               only: %w[id name]
      end

      # GET /teams/1
      def show
        render json: @league,
               only: %w[id name]
      end
    end
  end
end
