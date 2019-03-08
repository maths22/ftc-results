class CreateAlliance < ActiveRecord::Migration[5.2]
  def change
    create_table :alliances do |t|
      t.references :event, index: true
      t.boolean :is_elims
      t.integer :seed

      t.timestamps
    end
  end
end
