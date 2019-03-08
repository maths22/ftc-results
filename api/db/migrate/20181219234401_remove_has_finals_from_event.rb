class RemoveHasFinalsFromEvent < ActiveRecord::Migration[5.2]
  def change
    remove_column :events, :has_finals, :boolean
  end
end
