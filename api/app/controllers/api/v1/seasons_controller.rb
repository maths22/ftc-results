module Api
  module V1
    class SeasonsController < ::ApiController
      load_and_authorize_resource

      # GET /seasons
      def index
        expires_in(1.hour, public: true)

        render json: @seasons.order(year: 'desc'),
               only: %w[id name year active offseason]
      end

      # GET /seasons/1
      def show
        expires_in(1.hour, public: true)

        render json: @season,
               only: %w[id name year active offseason]
      end
    end
  end
end

