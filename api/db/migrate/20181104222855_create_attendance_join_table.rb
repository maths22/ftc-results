class CreateAttendanceJoinTable < ActiveRecord::Migration[5.2]
  def change
    create_join_table :teams, :events do |t|
      t.index %i[team_id event_id]
      t.index %i[event_id team_id]
    end
  end
end
