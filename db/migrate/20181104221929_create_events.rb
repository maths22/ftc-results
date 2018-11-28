class CreateEvents < ActiveRecord::Migration[5.2]
  def change
    create_table :events do |t|
      t.string :name
      t.date :start_date
      t.date :end_date
      t.string :location
      t.string :city
      t.string :state
      t.string :country

      t.timestamps
    end
  end
end
