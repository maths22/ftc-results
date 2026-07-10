class CreateSeasonScoreDecodeCri < ActiveRecord::Migration[8.0]
  def change
    reversible do |dir|
      dir.up do
        execute <<~SQL
        CREATE TYPE decode_cri_artifact AS ENUM ('NONE', 'PURPLE', 'GREEN', 'RED', 'ORANGE', 'YELLOW', 'BLUE', 'GEM');
      SQL
      end
      dir.down do
        execute <<~SQL
        DROP TYPE decode_cri_artifact;
      SQL
      end
    end
    create_table :decode_cri_scores do |t|
      t.integer :auto_classified_artifacts, default: 0
      t.integer :auto_overflow_artifacts, default: 0
      t.column :auto_classifier_state, :decode_cri_artifact, array: true, default: '{NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE}'
      t.boolean :auto_robot1, default: false
      t.boolean :auto_robot2, default: false
      t.boolean :auto_robot3, default: false

      t.integer :teleop_classified_artifacts, default: 0
      t.integer :teleop_overflow_artifacts, default: 0
      t.integer :teleop_depot_artifacts, default: 0
      t.column :teleop_classifier_state, :decode_cri_artifact, array: true, default: '{NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE,NONE}'
      t.column :prism_state, :decode_cri_artifact, array: true, default: '{NONE,NONE,NONE,NONE,NONE,NONE}'
      t.column :teleop_robot1, :decode_teleop_robot_status, default: 'NONE'
      t.column :teleop_robot2, :decode_teleop_robot_status, default: 'NONE'
      t.column :teleop_robot3, :decode_teleop_robot_status, default: 'NONE'

      t.boolean :movement_rp, default: false
      t.boolean :goal_rp, default: false
      t.boolean :pattern_rp, default: false

      t.integer :minor_penalties, default: 0
      t.integer :major_penalties, default: 0

      t.timestamps
    end
  end
end
