class AddDivisionToMultipleModels < ActiveRecord::Migration[5.2]
  def change
    add_reference :events_teams, :event_division, index: true
    add_reference :alliances, :event_division, index: true
    add_reference :matches, :event_division, index: true
    add_reference :rankings, :event_division, index: true
  end
end
