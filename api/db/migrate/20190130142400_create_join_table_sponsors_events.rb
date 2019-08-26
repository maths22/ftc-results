class CreateJoinTableSponsorsEvents < ActiveRecord::Migration[5.2]
  def change
    create_join_table :sponsors, :events do |t|
      t.index %i[sponsor_id event_id]
      t.index %i[event_id sponsor_id]
    end
  end
end
