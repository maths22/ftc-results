class CreateSeasonScoreUltimateGoalScoresRemote < ActiveRecord::Migration[6.1]
  def change
    create_table :ultimate_goal_scores_remote do |t|
      t.boolean :wobble_1_delivered, default: false
      t.boolean :wobble_2_delivered, default: false
      t.integer :auto_tower_high, default: 0
      t.integer :auto_tower_mid, default: 0
      t.integer :auto_tower_low, default: 0
      t.boolean :auto_power_shot_left, default: false
      t.boolean :auto_power_shot_center, default: false
      t.boolean :auto_power_shot_right, default: false
      t.boolean :navigated, default: false

      t.integer :teleop_tower_high, default: 0
      t.integer :teleop_tower_mid, default: 0
      t.integer :teleop_tower_low, default: 0

      t.boolean :teleop_power_shot_left, default: false
      t.boolean :teleop_power_shot_center, default: false
      t.boolean :teleop_power_shot_right, default: false
      t.integer :wobble_1_rings, default: 0
      t.integer :wobble_2_rings, default: 0
      t.integer :wobble_1_end, default: 0
      t.integer :wobble_2_end, default: 0

      t.integer :minor_penalties, default: 0
      t.integer :major_penalties, default: 0

      t.timestamps
    end
  end
end
