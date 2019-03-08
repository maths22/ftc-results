class CreateAwardFinalists < ActiveRecord::Migration[5.2]
  def change
    create_table :award_finalists do |t|
      t.references :award, foreign_key: true
      t.references :team, foreign_key: { primary_key: :number }
      t.string :recipient
      t.integer :place
      t.text :description

      t.timestamps
    end
  end
end
