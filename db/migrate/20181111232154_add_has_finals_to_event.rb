class AddHasFinalsToEvent < ActiveRecord::Migration[5.2]
  def change
    add_column :events, :has_finals, :boolean
  end
end
