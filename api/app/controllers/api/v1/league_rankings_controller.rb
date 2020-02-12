module Api
  module V1
    class LeagueRankingsController < ::ApiController
      # GET /teams
      def index
        authorize! :show, :rankings
        render json: rankings_for_season(request_season)
      end

      def league_data
        authorize! :show, :rankings
        render json: rankings_for_season(League.find(params[:id]).season)
      end

      def division_data
        authorize! :show, :rankings
        render json: rankings_for_season(Division.find(params[:id]).league.season)
      end

      private

      def rankings_for_season(season)
        rankings = Rankings::LeagueRankingsService.new(season, include_tournament: true).compute
        ret = rankings.values.sort.reverse.map do |tr|
          {
            team: tr.team.number,
            rp: tr.rp,
            tbp: tr.tbp,
            high_score: tr.high_score,
            matches_played: tr.matches_played,
            division_id: tr.division.id,
            league_id: tr.division.league_id
          }
        end

        {
          rankings: ret,
          divisions: Division.joins(:league).where(leagues: { season: season }).all,
          leagues: League.where(season: season).all
        }
      end
    end
  end
end
