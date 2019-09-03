class AddDivisionsTeamCountToDivisions < ActiveRecord::Migration[6.0]
  def change
    add_column :divisions, :divisions_teams_count, :integer
  end
end
