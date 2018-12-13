namespace :twitch do
  desc 'Twitch integration tasks'
  task update: :environment do
    EventChannelAssignment.to_teardown.each(&:teardown!)
    EventChannelAssignment.to_prepare.each(&:prepare!)
    TwitchChannel.inactive.each do |ch|
      Twitch::Api.from_channel(ch).set_channel_status(ch.id, 'No Event In Progress')
    end
    TwitchChannel.active.each do |ch|
      Twitch::Api.from_channel(ch).set_channel_status(ch.id, ch.current_assignment.event.name + ' #omgrobots #morethanrobots #ftc #omgftc')
    end
  end
end
