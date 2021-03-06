class EventDivision < ApplicationRecord
  belongs_to :event

  has_one_attached :import

  def team_numbers
    @team_numbers ||= event.events_teams.where(event_division: self).pluck(:team_id)
  end
end
