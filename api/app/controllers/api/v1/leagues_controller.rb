module Api
  module V1
    class LeaguesController < ::ApiController
      load_and_authorize_resource
      skip_load_resource only: :details

      # GET /teams
      def index
        expires_in(15.minutes, public: true) unless request_has_auth?

        render json: @leagues,
               only: %w[id name slug season_id]
      end

      # GET /teams/1
      def show
        render json: @league,
               only: %w[id name slug season_id]
      end

      def details
        @league = League.includes([{ divisions: %i[teams events] }, :events]).find_by(slug: params[:slug], season: request_season)
        render json: @league,
               include: [{ divisions: { include: %i[teams events] } }, :events]
      end
    end
  end
end
