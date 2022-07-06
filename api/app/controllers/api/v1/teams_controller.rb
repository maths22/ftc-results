module Api
  module V1
    class TeamsController < ::ApiController
      load_and_authorize_resource
      skip_load_resource only: %i[details]

      # GET /teams
      def index
        render json: @teams.where(number: params[:ids].split(',')), except: %i[created_at]
      end

      # GET /teams/1
      def show
        render json: @team, except: %i[created_at]
      end

      # GET /teams/1
      def details
        @team = Team.includes(:rankings, :leagues, events: [{ event_divisions: [:import_attachment] }, :import_attachment, :season, { event_channel_assignment: [:twitch_channel] }]).find(params[:id])

        match_ids = @team.match_alliances.map(&:match).compact.map(&:id)

        @matches = Match.includes([:event_division, red_score: [:season_score], blue_score: [:season_score], red_alliance: { alliance: :teams }, blue_alliance: { alliance: :teams }]).find(match_ids)
      end
    end
  end
end
