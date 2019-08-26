class CreateJoinTableEventsUsers < ActiveRecord::Migration[5.2]
  def change
    create_join_table :events, :users do |t|
      t.index %i[event_id user_id]
      t.index %i[user_id event_id]
    end
  end
end
