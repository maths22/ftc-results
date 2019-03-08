module Api
  module V1
    class DivisionsController < ::ApiController
      load_and_authorize_resource

      # GET /teams
      def index
        render json: @divisions,
               only: %w[id name league_id],
               methods: :team_count
      end

      # GET /teams/1
      def show
        render json: @division,
               only: %w[id name league_id],
               methods: :team_count
      end
    end
  end
end
