module Api
  module V1
    class LeaguesController < ::ApiController
      before_action :load_leagues, only: %i[index]
      before_action :load_league, only: %i[show]
      authorize_resource find_by: :slug
      skip_load_resource only: :details

      def index
        expires_in(15.minutes, public: true) if request_cacheable?

        render json: @leagues,
               only: %w[id name slug season_id league_id],
               methods: :team_count
      end

      def show
        render json: @league,
               only: %w[id name slug season_id league_id],
               methods: :team_count
      end

      def details
        @league = League.includes([:teams, :events, { leagues: %i[teams events] }]).find_by(slug: params[:id], season: request_season)
        render json: @league,
               include: [:teams, :events, { leagues: { include: %i[teams events] } }]
      end

      def load_leagues
        @leagues ||= params[:season] ? League.where(season: request_season) : League.all
      end

      def load_league
        @league ||= League.find_by!(slug: params[:id], season: request_season)
      end
    end
  end
end
