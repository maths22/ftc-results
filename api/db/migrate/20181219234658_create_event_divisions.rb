class CreateEventDivisions < ActiveRecord::Migration[5.2]
  def change
    create_table :event_divisions do |t|
      t.references :event, foreign_key: true
      t.integer :number
      t.string :name

      t.timestamps
    end
  end
end
