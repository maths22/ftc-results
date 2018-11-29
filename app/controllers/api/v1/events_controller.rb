module Api
  module V1
    class EventsController < ::ApiController
      load_and_authorize_resource
      skip_load_resource only: :index

      # skip_before_action :doorkeeper_authorize!, only: %i[download_scoring_system]

      # GET /events
      def index
        authorize!(:index, Event)
        @events = Event.with_attached_import

        render json: (@events.map do |e|
          evt = e.attributes
          evt[:can_import] = can? :import, e
          evt[:import] = rails_blob_path(e.import, disposition: 'attachment') if e.import.attached?
          evt
        end)
      end

      # GET /events/1
      def show
        render json: @event
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
          File.open(f, 'r') do |data|
            headers['Content-Length'] = data.length if data.respond_to?(:length)
            send_data(data.read, filename: "ftc-scoring-il-#{@event.slug}-#{@event.season.year}.zip")
          end
        end
      end

      def import_results
        @event.import.attach(params[:import])
        begin
          ::ScoringSystem::SqlitedbImportService.new.import_to_event @event
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
