class AddIdToDivisionsTeams < ActiveRecord::Migration[6.0]
  def change
    add_column :divisions_teams, :id, :primary_key
  end
end
