module Twitch
  class Updater
    def self.update
      EventChannelAssignment.to_teardown.each(&:teardown!)
      EventChannelAssignment.to_prepare.each(&:prepare!)
      TwitchChannel.managed.inactive.each do |ch|
        Twitch::Api.from_channel(ch).set_channel_status(ch.id, 'No Event In Progress')
      end
      TwitchChannel.managed.active.each do |ch|
        Twitch::Api.from_channel(ch).set_channel_status(ch.id, ch.current_assignment.event.name + ' #omgrobots #morethanrobots #ftc #omgftc')
      end
    end
  end
end
