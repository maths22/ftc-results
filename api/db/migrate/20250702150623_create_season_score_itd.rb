class CreateSeasonScoreItd < ActiveRecord::Migration[8.0]
  def change
    reversible do |dir|
      dir.up do
        execute <<~SQL
          CREATE TYPE itd_auto_robot_status AS ENUM ('NONE', 'OBSERVATION_ZONE', 'ASCENT');
          CREATE TYPE itd_teleop_robot_status AS ENUM ('NONE', 'OBSERVATION_ZONE', 'ASCENT_1', 'ASCENT_2', 'ASCENT_3');
        SQL
      end
      dir.down do
        execute <<~SQL
          DROP TYPE itd_auto_robot_status;
          DROP TYPE itd_teleop_robot_status;
        SQL
      end
    end
    create_table :into_the_deep_scores do |t|
      t.column :auto_robot1, :itd_auto_robot_status, default: 'NONE'
      t.column :auto_robot2, :itd_auto_robot_status, default: 'NONE'
      t.integer :auto_sample_net, default: 0
      t.integer :auto_sample_low, default: 0
      t.integer :auto_sample_high, default: 0
      t.integer :auto_specimen_low, default: 0
      t.integer :auto_specimen_high, default: 0

      t.integer :teleop_sample_net, default: 0
      t.integer :teleop_sample_low, default: 0
      t.integer :teleop_sample_high, default: 0
      t.integer :teleop_specimen_low, default: 0
      t.integer :teleop_specimen_high, default: 0

      t.column :teleop_robot1, :itd_teleop_robot_status, default: 'NONE'
      t.column :teleop_robot2, :itd_teleop_robot_status, default: 'NONE'

      t.integer :minor_penalties, default: 0
      t.integer :major_penalties, default: 0

      t.timestamps
    end
  end
end
