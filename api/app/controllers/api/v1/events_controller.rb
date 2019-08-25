module Api
  module V1
    class EventsController < ::ApiController
      load_and_authorize_resource
      skip_load_resource only: %i[index approve_access]
      skip_authorize_resource only: %i[approve_access]
      skip_authorization_check only: %i[approve_access]

      # skip_before_action :doorkeeper_authorize!, only: %i[download_scoring_system]

      # GET /events
      def index
        expires_in(3.minutes, public: true) unless request_has_auth?

        authorize!(:index, Event)
        @events = Event.where(season: request_season).includes(:event_divisions, :owners).with_attached_import.with_channel
      end

      def request_access
        begin
          request = AccessRequest.new(
            user: current_user,
            event: @event,
            message: params[:message],
            access_token: SecureRandom.hex(64)
          )
          request.save!
          AccessMailer.with(request: request).request_email.deliver_now
        rescue StandardError => exception
          render json: { error: exception.message }, status: :internal_server_error
          return
        end
        render json: { success: true }
      end

      def approve_access
        begin
          request = AccessRequest.find_by(access_token: params[:token])
          request.event.owners << request.user
          request.event.save!
          AccessMailer.with(request: request).approved_email.deliver_now
          request.destroy!
        rescue StandardError => exception
          render json: { error: exception.message }, status: :internal_server_error
          return
        end
        render json: { success: true }
      end

      # GET /events/1
      def show
        expires_in(3.minutes, public: true) unless request_has_auth?
      end

      def view_matches
        expires_in(30.seconds, public: true) unless request_has_auth?

        @matches = Match.includes([red_score: :season_score, blue_score: :season_score, red_alliance: { alliance: :teams }, blue_alliance: { alliance: :teams }]).where(event: @event)
      end

      def view_rankings
        expires_in(30.seconds, public: true) unless request_has_auth?

        @matches = Match.includes([red_score: :season_score, blue_score: :season_score, red_alliance: { alliance: :teams }, blue_alliance: { alliance: :teams }]).where(event: @event)
        @rankings = @event.rankings.includes(:team)
      end

      def view_awards
        expires_in(30.seconds, public: true) unless request_has_auth?

        @awards = @event.awards.includes(:award_finalists)
      end

      def view_teams
        expires_in(3.minutes, public: true) unless request_has_auth?

        div_teams = @event.events_teams.includes(:team).map do |et|
          {
            division: et.event_division&.number,
            team: et.team.number
          }
        end
        render json: { id: @event.id, teams: div_teams }
      end

      def download_scoring_system
        zip = ::ScoringSystem::ZipService.new
        db_service = ::ScoringSystem::SqlitedbExportService.new
        zip.with_copy do |f|
          db_service.create_server_db @event do |sdb|
            zip.add_db(f, 'server', sdb)
          end
          db_service.create_event_dbs @event do |edbs|
            edbs.each do |number, db|
              filename = @event.slug + (@event.divisions? ? "_#{number}" : '')
              zip.add_db(f, filename , db)
            end
          end
          Sponsor.global.each { |s| zip.add_sponsor_logo(f, s) }
          @event.sponsors.each { |s| zip.add_sponsor_logo(f, s) }
          zip.add_lib(f, Rails.root.join('vendor', 'scoring', 'FTCLiveExtras.jar'))
          File.open(f, 'r') do |data|
            headers['Content-Length'] = data.size if data.respond_to?(:size)
            send_data(data.read, filename: "ftc-scoring-il-#{@event.slug}-#{@event.season.year}.zip")
          end
        end
      end

      def import_results
        if req_division.nil?
          @event.import.attach(params[:import])
        else
          req_division.import.attach(params[:import])
        end
        begin
          ActiveRecord::Base.transaction do
            if req_division.nil?
              @event.reset!
              ::ScoringSystem::SqlitedbImportService.new.import_to_event @event
            else
              ::ScoringSystem::SqlitedbImportService.new.import_to_event @event, req_division
            end
          end
        rescue StandardError => exception
          puts exception.backtrace
          render json: { error: exception.message }, status: :internal_server_error
          return
        end
        render json: { success: true }
      end

      def reset
        begin
          @event.reset!
        rescue StandardError => exception
          render json: { error: exception.message }, status: :internal_server_error
          return
        end
        render json: { success: true }
      end

      def post_rankings
        begin
          raise 'Event already finalized' if @event.finalized?
          return if [:rankings].length.zero?

          ActiveRecord::Base.transaction do
            @event.start! if @event.not_started?
            @event.rankings.where(event_division: req_division).destroy_all
            team_rankings = params[:rankings].map do |rk|
              Rankings::TeamRanking.new.tap do |nr|
                nr.team = Team.find(rk['team_id'])
                nr.rp = rk['ranking_points']
                nr.tbp = rk['tie_breaker_points']
                nr.matches_played = rk['matches_played']
                nr.high_score = 0
                nr.ranking_breaker = rk['ranking']
              end
            end
            if @event.context_type == 'League'
              Rankings::LeagueRankingsService.new.merge_with_event_rankings(@event, team_rankings)
            end
            team_rankings.sort.reverse.each_with_index do |rk, idx|
              ranking = Ranking.new(team: rk.team,
                                    ranking: idx + 1,
                                    ranking_points: rk.rp,
                                    tie_breaker_points: rk.tbp,
                                    matches_played: rk.matches_played)
              ranking.event = @event
              ranking.event_division = req_division
              ranking.save!
            end
          end
        rescue StandardError => exception
          render json: { error: exception.message }, status: :internal_server_error
          logger.error ([exception.message]+exception.backtrace).join($INPUT_RECORD_SEPARATOR)
          return
        end
        render json: { success: true }
      end

      def post_awards
        begin
          raise 'Event already finalized' if @event.finalized?
          return if params[:awards].length.zero?

          ActiveRecord::Base.transaction do
            @event.start! if @event.not_started?
            @event.awards.destroy_all
            params[:awards].each do |awd|
              award = Award.new(awd.permit(:name))
              award.event = @event
              award.save!
              awd[:finalists].each do |fin|
                puts params
                finalist = AwardFinalist.new(fin.permit(:team_id,
                                                        :recipient,
                                                        :place))
                finalist.award = award
                finalist.save!
              end
            end
          end
        rescue StandardError => exception
          render json: { error: exception.message }, status: :internal_server_error
          return
        end
        render json: { success: true }
      end

      def post_teams
        begin
          raise 'Event already finalized' if @event.finalized?

          ActiveRecord::Base.transaction do
            new_team_nums = params[:teams] - @event.teams.pluck(:number)
            teams = new_team_nums.map { |t| Team.find_or_create_by(number: t) }

            @event.teams = @event.teams + teams
            @event.teams = @event.teams.select { |t| params[:teams].include? t.number } if req_division.nil?
            unless req_division.nil?
              @event.events_teams.select { |et| params[:teams].include?(et.team_id) }.each do |et|
                et.event_division = req_division
                et.save!
              end
            end
            @event.save!
          end
        rescue StandardError => exception
          render json: { error: exception.message }, status: :internal_server_error
          return
        end
        render json: { success: true }
      end

      def post_alliances
        begin
          raise 'Event already finalized' if @event.finalized?
          return if params[:alliances].length.zero?

          ActiveRecord::Base.transaction do
            @event.start! if @event.not_started?
            params[:alliances].each do |a|
              next unless a[:teams][0].positive?

              alliance = Alliance.find_or_create_by event: @event, event_division: req_division, is_elims: true, seed: a[:seed]
              alliance.teams = Team.find(a[:teams])
              alliance.event_division = req_division
              alliance.save!
            end
          end
        rescue StandardError => exception
          render json: { error: exception.message }, status: :internal_server_error
          return
        end
        render json: { success: true }
      end

      def generate_qual_match(m)
        match = Match.create_with(played: false)
                     .find_or_create_by(event: @event, event_division: req_division, phase: 'qual', number: m[:number])
        unless match.red_alliance
          red_alliance = Alliance.new event: @event, event_division: req_division, is_elims: false, teams: Team.find(m[:red_alliance])
          red_alliance.save!
          red_match_alliance = MatchAlliance.new alliance: red_alliance
          red_match_alliance.surrogate = m[:red_surrogate]
          match.red_alliance = red_match_alliance
        end
        unless match.blue_alliance
          blue_alliance = Alliance.new event: @event, event_division: req_division, is_elims: false, teams: Team.find(m[:blue_alliance])
          blue_alliance.save!
          blue_match_alliance = MatchAlliance.new alliance: blue_alliance
          blue_match_alliance.surrogate = m[:blue_surrogate]
          match.blue_alliance = blue_match_alliance
        end
        match.save!
      end

      def generate_elim_match(m)
        match = Match.create_with(played: false)
                     .find_or_create_by(event: @event, event_division: req_division, phase: m[:phase], series: m[:series], number: m[:number])
        red_alliance = Alliance.find_by(event: @event, event_division: req_division, is_elims: true, seed: m[:red_alliance])
        red_match_alliance = MatchAlliance.new alliance: red_alliance
        red_match_alliance.present = m[:red_present]
        blue_alliance = Alliance.find_by(event: @event, event_division: req_division,  is_elims: true, seed: m[:blue_alliance])
        blue_match_alliance = MatchAlliance.new alliance: blue_alliance
        blue_match_alliance.present = m[:blue_present]

        match.red_alliance = red_match_alliance
        match.blue_alliance = blue_match_alliance
        match.save!
      end

      def post_matches
        begin
          raise 'Event already finalized' if @event.finalized?
          return if params[:matches].length.zero?

          ActiveRecord::Base.transaction do
            @event.start! if @event.not_started?
            params[:matches].each do |m|
              generate_qual_match(m) if m[:phase] == 'qual'
              generate_elim_match(m) unless m[:phase] == 'qual'
            end
          end
        rescue StandardError => exception
          render json: { error: exception.message }, status: :internal_server_error
          return
        end
        render json: { success: true }
      end

      def post_match
        begin
          raise 'Event already finalized' if @event.finalized?

          split_id = params[:mid].split('-')
          phase = split_id[0]
          series = split_id.length > 2 ? split_id[1] : nil
          number = split_id.length > 2 ? split_id[2] : split_id[1]
          m = Match.where(event: @event, event_division: req_division, phase: phase, series: series, number: number).first

          ActiveRecord::Base.transaction do
            params[:red_score].permit!
            params[:blue_score].permit!
            m.red_score&.destroy!
            m.blue_score&.destroy!
            season_red_score = @event.season.score_model.new params[:red_score]
            red_score = Score.new season_score: season_red_score
            season_blue_score = @event.season.score_model.new params[:blue_score]
            blue_score = Score.new season_score: season_blue_score
            m.red_score = red_score
            m.blue_score = blue_score
            m.played = true
            m.update_ranking_data
            m.save!
          end
        rescue StandardError => exception
          render json: { error: exception.message }, status: :internal_server_error
          return
        end
        render json: { success: true }
      end

      def twitch
        assignment = Twitch::AssignmentService.new.find_or_create_assignment(@event, current_user)
        StreamMailer.with(assignment: assignment).created_email.deliver_now
        render json: { channel_name: true }
      rescue StandardError => exception
        render json: { error: exception.message }, status: :internal_server_error
      end

      def remove_twitch
        @event.event_channel_assignment.destroy!
        render json: { channel_name: true }
      rescue StandardError => exception
        render json: { error: exception.message }, status: :internal_server_error
      end

      # POST /events
      def create
        if @event.save
          render json: @event, status: :created, location: @event
        else
          render json: @event.errors, status: :unprocessable_entity
        end
      end

      # PATCH/PUT /events/1
      def update
        if @event.update(event_params)
          render json: @event
        else
          render json: @event.errors, status: :unprocessable_entity
        end
      end

      # DELETE /events/1
      def destroy
        @event.destroy
      end

      private

      def req_division
        div = params[:division].to_i
        return nil if div.zero?

        EventDivision.find_by number: div, event: @event
      end

      # Only allow a trusted parameter "white list" through.
      def event_params
        params.fetch(:event, {})
      end
    end
  end
end
