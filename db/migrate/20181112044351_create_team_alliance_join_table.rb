class CreateTeamAllianceJoinTable < ActiveRecord::Migration[5.2]
  def change
    create_join_table :teams, :alliances, table_name: :alliance_teams do |t|
      t.primary_key :id
      t.index %i[team_id alliance_id]
      t.index %i[alliance_id team_id]
      t.integer :position
    end
  end
end
