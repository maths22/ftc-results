class CreateSeasonScoreSkystoneScores < ActiveRecord::Migration[6.0]
  def change
    create_table :skystone_scores do |t|
      t.integer :auto_skystones, default: 0
      t.integer :auto_delivered, default: 0
      t.integer :auto_placed, default: 0
      t.integer :robots_navigated, default: 0
      t.integer :foundation_repositioned, default: 0

      t.integer :teleop_placed, default: 0
      t.integer :teleop_delivered, default: 0
      t.integer :tallest_height, default: 0

      t.integer :foundation_moved, default: 0
      t.integer :robots_parked, default: 0
      t.integer :capstone_1_level, default: -1
      t.integer :capstone_2_level, default: -1

      t.integer :minor_penalties, default: 0
      t.integer :major_penalties, default: 0

      t.timestamps
    end
  end
end
