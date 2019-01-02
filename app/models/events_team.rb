class EventsTeam < ApplicationRecord
  belongs_to :event
  belongs_to :team
  belongs_to :event_division, optional: true
end
