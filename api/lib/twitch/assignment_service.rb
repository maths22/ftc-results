module Twitch
  class AssignmentService
    def find_or_create_assignment(evt, user = nil)
      return evt.event_channel_assignment unless evt.event_channel_assignment.nil?

      chan = TwitchChannel.managed.where.not(
        event_channel_assignments:
            EventChannelAssignment.where('start_date <= ? AND end_date >= ?', evt.end_date, evt.start_date - 1.day)
      ).first

      raise NoChannelAvailableError if chan.nil?

      ret = EventChannelAssignment.new event: evt,
                                       twitch_channel: chan,
                                       user: user,
                                       start_date: evt.start_date - 1.day,
                                       end_date: evt.end_date
      evt.event_channel_assignment = ret
      evt.save!
      ret
    end
  end

  class NoChannelAvailableError < StandardError
    def message
      'No channel available'
    end
  end
end