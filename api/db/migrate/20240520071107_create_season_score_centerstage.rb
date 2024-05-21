class CreateSeasonScoreCenterstage < ActiveRecord::Migration[7.0]
  def change
    reversible do |dir|
      dir.up do
        execute <<~SQL
          CREATE TYPE cs_teleop_robot_status AS ENUM ('NONE', 'BACKSTAGE', 'RIGGING');
        SQL
      end
      dir.down do
        execute <<~SQL
          DROP TYPE cs_teleop_robot_status;
        SQL
      end
    end

    create_table :centerstage_scores do |t|
      t.boolean :init_team_prop1, default: false
      t.boolean :init_team_prop2, default: false
      t.boolean :robot1_auto, default: false
      t.boolean :robot2_auto, default: false
      t.boolean :spike_mark_pixel1, default: false
      t.boolean :spike_mark_pixel2, default: false
      t.boolean :target_backdrop_pixel1, default: false
      t.boolean :target_backdrop_pixel2, default: false
      t.integer :auto_backdrop, default: 0
      t.integer :auto_backstage, default: 0

      t.integer :teleop_backdrop, default: 0
      t.integer :teleop_backstage, default: 0
      t.integer :mosaics, default: 0
      t.integer :max_set_line, default: 0

      t.column :teleop_robot1, :cs_teleop_robot_status, default: 'NONE'
      t.column :teleop_robot2, :cs_teleop_robot_status, default: 'NONE'
      t.integer :drone1, default: 0
      t.integer :drone2, default: 0

      t.integer :minor_penalties, default: 0
      t.integer :major_penalties, default: 0

      t.timestamps
    end
  end
end
