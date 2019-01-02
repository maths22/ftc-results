class AddIdToEventsTeams < ActiveRecord::Migration[5.2]
  def change
    add_column :events_teams, :id, :primary_key
  end
end
