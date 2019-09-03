class RenameMatchAlliancePresent < ActiveRecord::Migration[6.0]
  def change
    rename_column :match_alliances, :present, :teams_present
  end
end
