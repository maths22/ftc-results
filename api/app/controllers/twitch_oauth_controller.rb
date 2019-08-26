class TwitchOauthController < ApplicationController
  def authorize
    redirect_to Twitch::Api.authorize_url(twitch_oauth_callback_url)
  end

  def callback
    token = Twitch::Api.generate_token(params[:code], twitch_oauth_callback_url)
    api = Twitch::Api.new(token)
    channel = api.channel
    unless allowed_channels.include? channel['name']
      render json: { error: 'user_not_permitted' }, status: :forbidden
      return
    end
    db_channel = TwitchChannel.find_or_create_by(id: channel['_id'])
    db_channel.name = channel['name']
    db_channel.access_token = token.token
    db_channel.refresh_token = token.refresh_token
    db_channel.expires_at = Time.at(token.expires_at).utc
    db_channel.save!
    render json: { success: true }
  end

  private

  def allowed_channels
    @allowed_channels ||= ENV.fetch('TWITCH_ALLOWED_CHANNELS', '').split(',')
  end
end
