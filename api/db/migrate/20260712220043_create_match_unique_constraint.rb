class CreateMatchUniqueConstraint < ActiveRecord::Migration[8.0]
  def change
    add_index :matches, [:event_id, :event_division_id, :phase, :series, :number], unique: true
  end
end
