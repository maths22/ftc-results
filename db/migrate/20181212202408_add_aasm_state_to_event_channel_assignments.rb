class AddAasmStateToEventChannelAssignments < ActiveRecord::Migration[5.2]
  def change
    add_column :event_channel_assignments, :aasm_state, :string
  end
end
