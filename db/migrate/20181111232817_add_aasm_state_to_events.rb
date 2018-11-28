class AddAasmStateToEvents < ActiveRecord::Migration[5.2]
  def change
    add_column :events, :aasm_state, :string
  end
end
