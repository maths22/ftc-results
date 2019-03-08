class AddConsentMissingToTeams < ActiveRecord::Migration[5.2]
  def change
    add_column :teams, :consent_missing, :boolean
  end
end
