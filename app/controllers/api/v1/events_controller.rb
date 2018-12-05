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
        authorize!(:index, Event)
        @events = Event.with_attached_import

        render json: (@events.map do |e|
          evt = e.attributes
          evt[:can_import] = can? :import_results, e
          evt[:import] = rails_blob_path(e.import, disposition: 'attachment') if e.import.attached?
          evt
        end)
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
        render json: @event
      end

      def view_matches
        @matches = Match.includes([:red_score, :blue_score, red_alliance: {alliance: :teams}, blue_alliance: {alliance: :teams}]).where(event: @event)
      end

      def view_rankings
        render json: @event.rankings
      end

      def download_scoring_system
        zip = ::ScoringSystem::ZipService.new
        db_service = ::ScoringSystem::SqlitedbExportService
                     .new(Rails.root.join('data', 'generated_scoring_dbs'))
        zip.with_copy do |f|
          db_service.server_db_for_event @event do |sdb|
            zip.add_db(f, 'server', sdb)
          end
          zip.add_db(f, @event.slug, db_service.event_db(@event))
          zip.add_lib(f, Rails.root.join('vendor', 'scoring', 'FTCLiveExtras.jar'))
          File.open(f, 'r') do |data|
            headers['Content-Length'] = data.size if data.respond_to?(:size)
            send_data(data.read, filename: "ftc-scoring-il-#{@event.slug}-#{@event.season.year}.zip")
          end
        end
      end

      def import_results
        @event.import.attach(params[:import])
        begin
          ActiveRecord::Base.transaction do
            @event.reset!
            ::ScoringSystem::SqlitedbImportService.new.import_to_event @event
          end
        rescue StandardError => exception
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

          ActiveRecord::Base.transaction do
            @event.start! if @event.not_started?
            @event.rankings.destroy_all
            params[:rankings].each do |rk|
              ranking = Ranking.new(rk.permit(:team_id,
                                              :ranking,
                                              :ranking_points,
                                              :tie_breaker_points,
                                              :matches_played))
              ranking.event = @event
              ranking.save!
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
            @event.start! if @event.not_started?
            teams = params[:teams].map { |t| Team.find_or_create_by(number: t) }
            @event.teams = teams
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

          ActiveRecord::Base.transaction do
            @event.start! if @event.not_started?
            params[:alliances].each do |a|
              alliance = Alliance.find_or_create_by event: @event, is_elims: true, seed: a[:seed]
              alliance.teams = Team.find(a[:teams])
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
                     .find_or_create_by(event: @event, phase: 'qual', number: m[:number])
        unless match.red_alliance
          red_alliance = Alliance.new event: @event, is_elims: false, teams: Team.find(m[:red_alliance])
          red_alliance.save!
          red_match_alliance = MatchAlliance.new alliance: red_alliance
          red_match_alliance.surrogate = m[:red_surrogate]
          match.red_alliance = red_match_alliance
        end
        unless match.blue_alliance
          blue_alliance = Alliance.new event: @event, is_elims: false, teams: Team.find(m[:blue_alliance])
          blue_alliance.save!
          blue_match_alliance = MatchAlliance.new alliance: blue_alliance
          blue_match_alliance.surrogate = m[:blue_surrogate]
          match.blue_alliance = blue_match_alliance
        end
        match.save!
      end

      def generate_elim_match(m)
        match = Match.create_with(played: false)
                    .find_or_create_by(event: @event, phase: m[:phase], series: m[:series], number: m[:number])
        red_alliance = Alliance.find_by(event: @event, is_elims: true, seed: m[:red_alliance])
        red_match_alliance = MatchAlliance.new alliance: red_alliance
        red_match_alliance.present = m[:red_present]
        blue_alliance = Alliance.find_by(event: @event, is_elims: true, seed: m[:blue_alliance])
        blue_match_alliance = MatchAlliance.new alliance: blue_alliance
        blue_match_alliance.present = m[:blue_present]

        match.red_alliance = red_match_alliance
        match.blue_alliance = blue_match_alliance
        match.save!
      end

      def post_matches
        begin
          raise 'Event already finalized' if @event.finalized?

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
          m = Match.where(event: @event, phase: phase, series: series, number: number).first

          ActiveRecord::Base.transaction do
            params[:red_score].permit!
            params[:blue_score].permit!
            m.red_score.destroy! if m.red_score
            m.blue_score.destroy! if m.blue_score
            rr_red_score = RoverRuckusScore.new params[:red_score]
            red_score = Score.new season_score: rr_red_score
            rr_blue_score = RoverRuckusScore.new params[:blue_score]
            blue_score = Score.new season_score: rr_blue_score
            m.red_score = red_score
            m.blue_score = blue_score
            m.played = true
            m.save!
          end
        rescue StandardError => exception
          render json: { error: exception.message }, status: :internal_server_error
          return
        end
        render json: { success: true }
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

      # Only allow a trusted parameter "white list" through.
      def event_params
        params.fetch(:event, {})
      end
    end
  end
end
