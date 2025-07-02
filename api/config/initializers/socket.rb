class SyncSocketMiddleware
  WS_RESPONSE = [0, {}, []]
  def initialize(app)
    @app = app
  end

  def call(env)
    return @app.call(env) if env['PATH_INFO'] != '/api/v1/scoring/sync/socket'

    if env['rack.upgrade?'] == :websocket
      env['rack.upgrade'] = LiveSync
      WS_RESPONSE
    else
      [405, {'Content-Type' => 'text/plain'}, [ 'Only websockets are supported' ]]
    end
  end
end

Rails.application.config.middleware.use SyncSocketMiddleware
