class CreateSeasonScoreItdCri < ActiveRecord::Migration[8.0]
  def change
    create_table :into_the_deep_cri_scores do |t|
      t.column :auto_robot1, :itd_auto_robot_status, default: 'NONE'
      t.column :auto_robot2, :itd_auto_robot_status, default: 'NONE'
      t.column :auto_robot3, :itd_auto_robot_status, default: 'NONE'
      t.integer :auto_sample_net_near, default: 0
      t.integer :auto_sample_low_near, default: 0
      t.integer :auto_sample_high_near, default: 0
      t.integer :auto_sample_net_far, default: 0
      t.integer :auto_sample_low_far, default: 0
      t.integer :auto_sample_high_far, default: 0
      t.integer :auto_specimen_low_1, default: 0
      t.integer :auto_specimen_high_1, default: 0
      t.integer :auto_specimen_low_2, default: 0
      t.integer :auto_specimen_high_2, default: 0
      t.integer :auto_specimen_low_3, default: 0
      t.integer :auto_specimen_high_3, default: 0
      t.integer :auto_specimen_low_4, default: 0
      t.integer :auto_specimen_high_4, default: 0
      t.integer :auto_owned_chambers, default: 0

      t.integer :teleop_sample_net_near, default: 0
      t.integer :teleop_sample_low_near, default: 0
      t.integer :teleop_sample_high_near, default: 0
      t.integer :teleop_sample_net_far, default: 0
      t.integer :teleop_sample_low_far, default: 0
      t.integer :teleop_sample_high_far, default: 0
      t.integer :teleop_specimen_low_1, default: 0
      t.integer :teleop_specimen_high_1, default: 0
      t.integer :teleop_specimen_low_2, default: 0
      t.integer :teleop_specimen_high_2, default: 0
      t.integer :teleop_specimen_low_3, default: 0
      t.integer :teleop_specimen_high_3, default: 0
      t.integer :teleop_specimen_low_4, default: 0
      t.integer :teleop_specimen_high_4, default: 0
      t.integer :teleop_owned_chambers, default: 0

      t.column :teleop_robot1, :itd_teleop_robot_status, default: 'NONE'
      t.column :teleop_robot2, :itd_teleop_robot_status, default: 'NONE'
      t.column :teleop_robot3, :itd_teleop_robot_status, default: 'NONE'

      t.boolean :coop_achieved, default: false

      t.integer :minor_penalties, default: 0
      t.integer :major_penalties, default: 0

      t.timestamps
    end
  end
end
