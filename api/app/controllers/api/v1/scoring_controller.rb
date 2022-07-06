module Api
  module V1
    class ScoringController < ::ApiController
      skip_authorization_check

      def uploads
        id = SecureRandom.uuid
        jwt = generate_jwt(subject: nil, action: 'process_upload', filename: params['filename'], contentType: params['contentType'], byteCount: params['byteCount'], id: id )
        render json: { uploadId: id, target: api_v1_scoring_uploads_url(token: jwt) }
      end

      def process_upload
        validate_jwt
        jwt = @decoded_token[0]
        ActiveStorage::Blob.create_and_upload!(io: StringIO.new(request.body.read), filename: jwt['filename'], content_type: jwt['contentType'], key: jwt['id'], identify: false)
        head 200
      end

      def sync_upload
        @event = LiveSync.load_event(request)
        if @event.nil?
          render json: { error: 'Failed to process jwt' }, status: :unauthorized
          return
        end

        if @event.import.attached?
          render json: { error: 'Already imported' }, status: :conflict
          return
        end

        begin
          ActiveRecord::Base.transaction do
            @event.import.attach(ActiveStorage::Blob.find_by(key: params['uploadId']))
            unless @event.import.attached?
              throw 'attachment failed'
            end
            @event.reset!
            ::ScoringSystem::SqlitedbImportService.new(@event).process
          end
        rescue StandardError => e
          render json: { error: e.message }, status: :internal_server_error
          Raven.capture_exception(e)
          Rails.logger.error e.full_message
          return
        end
        render json: { success: true }
      end
    end
  end
end
