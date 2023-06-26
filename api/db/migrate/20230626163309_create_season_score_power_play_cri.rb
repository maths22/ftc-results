class CreateSeasonScorePowerPlayCri < ActiveRecord::Migration[7.0]
  def change
    create_table :power_play_cri_scores do |t|
      t.boolean :init_signal_sleeve1, default: false
      t.boolean :init_signal_sleeve2, default: false
      t.boolean :init_signal_sleeve3, default: false
      t.column :auto_navigated1, :pp_auto_navigated_status, default: 'NONE'
      t.column :auto_navigated2, :pp_auto_navigated_status, default: 'NONE'
      t.column :auto_navigated3, :pp_auto_navigated_status, default: 'NONE'
      t.integer :auto_terminal, default: 0
      t.json :auto_junctions, default: []

      t.json :teleop_junctions, default: []
      t.integer :teleop_terminal_near, default: 0
      t.integer :teleop_terminal_far, default: 0

      t.boolean :teleop_navigated1, default: false
      t.boolean :teleop_navigated2, default: false
      t.boolean :teleop_navigated3, default: false

      t.integer :minor_penalties, default: 0
      t.integer :major_penalties, default: 0

      t.timestamps
    end
  end
end
