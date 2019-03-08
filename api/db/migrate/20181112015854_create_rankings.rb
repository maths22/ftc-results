class CreateRankings < ActiveRecord::Migration[5.2]
  def change
    create_table :rankings do |t|
      t.references :team, index: true
      t.references :event, index: true
      t.integer :ranking
      t.integer :ranking_points
      t.integer :tie_breaker_points
      t.integer :matches_played

      t.timestamps
    end
  end
end
