class CreateMatches < ActiveRecord::Migration[5.2]
  def change
    create_table :matches do |t|
      t.integer :phase
      t.integer :series
      t.integer :number
      t.references :red_alliance
      t.references :blue_alliance
      t.references :red_score
      t.references :blue_score

      t.timestamps
    end
  end
end
