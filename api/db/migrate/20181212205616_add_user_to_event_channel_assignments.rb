class AddUserToEventChannelAssignments < ActiveRecord::Migration[5.2]
  def change
    add_reference :event_channel_assignments, :user, foreign_key: true
  end
end
