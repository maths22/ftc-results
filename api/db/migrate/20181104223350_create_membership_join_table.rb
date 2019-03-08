class CreateMembershipJoinTable < ActiveRecord::Migration[5.2]
  def change
    create_join_table :teams, :divisions do |t|
      t.index %i[team_id division_id]
      t.index %i[division_id team_id]
    end
  end
end
