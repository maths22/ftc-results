module Api
  module V1
    class SeasonsController < ::ApiController
      load_and_authorize_resource

      # GET /seasons
      def index
        expires_in(1.hour, public: true) if request_cacheable?
        @seasons = @seasons.order(year: 'desc', id: 'desc')
      end

      # GET /seasons/1
      def show
        expires_in(1.hour, public: true) if request_cacheable?
      end
    end
  end
end
