class CreateEventChannelAssignments < ActiveRecord::Migration[5.2]
  def change
    create_table :event_channel_assignments do |t|
      t.belongs_to :event, index: true
      t.belongs_to :twitch_channel, index: true
      t.date :start_date
      t.date :end_date

      t.timestamps
    end
  end
end
