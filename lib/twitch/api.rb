module Twitch
  # noinspection RubyClassVariableUsageInspection
  class Api

    class <<self
      def client
        @client ||= OAuth2::Client.new(ENV['TWITCH_ID'], ENV['TWITCH_SECRET'],
                                       site: 'https://api.twitch.tv',
                                       authorize_url: 'https://id.twitch.tv/oauth2/authorize',
                                       token_url: 'https://id.twitch.tv/oauth2/token',
                                       auth_scheme: :request_body)
      end

      def authorize_url(redirect_target)
        client.auth_code.authorize_url(scope: %w[
          channel_read
          channel_stream
          channel_editor
        ].join(' '), redirect_uri: redirect_target)
      end

      def generate_token(code, redirect_target)
        ret = client.auth_code.get_token(code, redirect_uri: redirect_target)
        ret.options[:header_format] = 'OAuth %s'
        ret
      end

      def from_channel(channel)
        tok = OAuth2::AccessToken.from_hash(client,
                                            access_token: channel.access_token,
                                            refresh_token: channel.refresh_token,
                                            expires_at: channel.expires_at.to_i)
        tok.options[:header_format] = 'OAuth %s'
        new(tok)
      end
    end

    def initialize(token)
      @token = token
    end

    def channel
      get '/kraken/channel'
    end

    def stream(id)
      get '/kraken/streams/' + id.to_s
    end

    def reset_stream_key(id)
      delete '/kraken/channels/' + id.to_s + '/stream_key'
    end

    def set_channel_status(id, status)
      put '/kraken/channels/' + id.to_s + '', body: { channel: { status: status, game: 'Creative' } }.to_json
    end

    private

    def get(path)
      request(:get, path)
    end

    def put(path, opts)
      request(:put, path, opts)
    end

    def delete(path)
      request(:delete, path)
    end

    def request(method, path, opts = {})
      @token.send(method, path, opts.merge(headers: headers)).parsed
    rescue OAuth2::Error => error
      raise unless error.response.status == 401

      chan = TwitchChannel.find_by(refresh_token: @token.refresh_token)
      @token = @token.refresh
      chan.access_token = @token.token
      chan.refresh_token = @token.refresh_token
      chan.expires_at = Time.at(@token.expires_at).utc
      chan.save!
      @token.send(method, path, opts.merge(headers: headers)).parsed
    end

    def headers
      {
        'Accept': 'application/vnd.twitchtv.v5+json',
        'Client-Id': @token.client.id,
        'Content-Type': 'application/json'
      }
    end
  end
end