class SyncSocketMiddleware
  WS_RESPONSE = [0, {}, []]
  def initialize(app)
    @app = app
  end

  def call(env)
    return @app.call(env) if env['PATH_INFO'] != '/api/v1/scoring/sync/socket'

    if env['rack.upgrade?'] == :websocket
      sync = LiveSync.new
      res = sync.pre_connect(Rack::Request.new(env))
      if res
        env['rack.upgrade'] = sync
        WS_RESPONSE
      else
        [500, {'Content-Type' => 'text/plain'}, [ 'Connection error' ]]
      end
    else
      [405, {'Content-Type' => 'text/plain'}, [ 'Only websockets are supported' ]]
    end
  end
end

Rails.application.config.middleware.use SyncSocketMiddleware
