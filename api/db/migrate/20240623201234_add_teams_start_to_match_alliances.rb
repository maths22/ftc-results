class AddTeamsStartToMatchAlliances < ActiveRecord::Migration[7.0]
  def change
    add_column :match_alliances, :teams_start, :json
  end
end
