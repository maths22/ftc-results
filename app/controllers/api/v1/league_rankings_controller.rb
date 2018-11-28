module Api
  module V1
    class LeagueRankingsController < ::ApiController
      # GET /teams
      def index
        authorize! :show, :rankings
        rankings = Rankings::LeagueRankingsService.new.compute
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

        render json: ret
      end
    end
  end
end
