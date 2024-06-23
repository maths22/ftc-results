class CreateCenterstageCriScores < ActiveRecord::Migration[7.0]
  def change
    create_table :centerstage_cri_scores do |t|
      t.boolean :init_team_prop1, default: false
      t.boolean :init_team_prop2, default: false
      t.boolean :init_team_prop3, default: false
      t.boolean :robot1_auto, default: false
      t.boolean :robot2_auto, default: false
      t.boolean :robot3_auto, default: false
      t.boolean :spike_mark_pixel1, default: false
      t.boolean :spike_mark_pixel2, default: false
      t.boolean :spike_mark_pixel3, default: false
      t.boolean :target_backdrop_pixel1, default: false
      t.boolean :target_backdrop_pixel2, default: false
      t.boolean :target_backdrop_pixel3, default: false
      t.integer :auto_backstage, default: 0
      t.integer :auto_own_backdrop, default: 0
      t.integer :auto_own_mosaics, default: 0
      t.integer :auto_own_max_set_line, default: 0
      t.integer :auto_shared_backdrop, default: 0
      t.integer :auto_shared_mosaics, default: 0
      t.integer :auto_shared_max_set_line, default: 0

      t.integer :teleop_backstage, default: 0
      t.integer :teleop_own_backdrop, default: 0
      t.integer :teleop_own_mosaics, default: 0
      t.integer :teleop_own_max_set_line, default: 0
      t.integer :teleop_shared_backdrop, default: 0
      t.integer :teleop_shared_mosaics, default: 0
      t.integer :teleop_shared_max_set_line, default: 0
      t.integer :alliance_pixels, default: 0
      t.integer :other_alliance_pixels, default: 0

      t.column :teleop_robot1, :cs_teleop_robot_status, default: 'NONE'
      t.column :teleop_robot2, :cs_teleop_robot_status, default: 'NONE'
      t.column :teleop_robot3, :cs_teleop_robot_status, default: 'NONE'
      t.integer :drone1, default: 0
      t.integer :drone2, default: 0
      t.integer :drone3, default: 0

      t.integer :minor_penalties, default: 0
      t.integer :major_penalties, default: 0

      t.timestamps
    end
  end
end
