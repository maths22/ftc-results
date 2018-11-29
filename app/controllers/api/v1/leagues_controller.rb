module Api
  module V1
    class LeaguesController < ::ApiController
      load_and_authorize_resource
      skip_load_resource only: :details

      # GET /teams
      def index
        render json: @leagues,
               only: %w[id name slug]
      end

      # GET /teams/1
      def show
        render json: @league,
               only: %w[id name slug]
      end

      def details
        @league = League.includes([{ divisions: %i[teams events] }, :events]).find_by(slug: params[:slug])
        render json: @league,
               include: [{ divisions: {include: %i[teams events]} }, :events]

      end
    end
  end
end
