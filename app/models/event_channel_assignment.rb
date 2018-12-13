class EventChannelAssignment < ApplicationRecord
  include AASM
  scope :to_teardown, -> { ready.where('end_date < ?', Time.zone.today) }
  scope :to_prepare, -> { init.where('start_date <= :today and end_date >= :today', today: Time.zone.today) }

  belongs_to :event
  belongs_to :twitch_channel
  belongs_to :user

  aasm do
    state :init, initial: true
    state :ready,
          :complete

    event :prepare do
      transitions from: :init, to: :ready
      after %i[reset_token send_token]
    end

    event :teardown do
      transitions from: :ready, to: :complete
      after :reset_token
    end
  end

  def reset_token
    Twitch::Api.from_channel(twitch_channel).reset_stream_key(twitch_channel.id)
  end

  def send_token
    stream_key = Twitch::Api.from_channel(twitch_channel).channel['stream_key']
    StreamMailer.with(assignment: self, stream_key: stream_key).token_email.deliver_now
  end
end
