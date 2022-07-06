class CreateSeasonScoreFreightFrenzyCri < ActiveRecord::Migration[6.1]
  def change
    reversible do |dir|
      dir.up do
        execute <<~SQL
          CREATE TYPE ff_cri_auto_navigated_status AS ENUM ('NONE', 'IN_WAREHOUSE', 'COMPLETELY_IN_WAREHOUSE');
        SQL
      end
      dir.down do
        execute <<~SQL
          DROP TYPE ff_cri_auto_navigated_status;
        SQL
      end
    end

    create_table :freight_frenzy_cri_scores do |t|
      t.column :barcode_element1, :ff_barcode_element, default: 'DUCK'
      t.column :barcode_element2, :ff_barcode_element, default: 'DUCK'
      t.column :barcode_element3, :ff_barcode_element, default: 'DUCK'
      t.boolean :carousel, default: false
      t.column :auto_navigated1, :ff_cri_auto_navigated_status, default: 'NONE'
      t.column :auto_navigated2, :ff_cri_auto_navigated_status, default: 'NONE'
      t.column :auto_navigated3, :ff_cri_auto_navigated_status, default: 'NONE'
      t.boolean :auto_bonus1, default: false
      t.boolean :auto_bonus2, default: false
      t.boolean :auto_bonus3, default: false
      t.integer :auto_freight1, default: 0
      t.integer :auto_freight2, default: 0
      t.integer :auto_freight3, default: 0
      t.integer :auto_coop_freight, default: 0

      t.integer :teleop_freight1, default: 0
      t.integer :teleop_freight2, default: 0
      t.integer :teleop_freight3, default: 0
      t.integer :shared_freight, default: 0
      t.integer :teleop_coop_freight, default: 0
      t.integer :teleop_other_coop_freight, default: 0

      t.integer :end_delivered, default: 0
      t.boolean :alliance_balanced, default: false
      t.boolean :shared_unbalanced, default: false
      t.boolean :coop_balanced, default: false
      t.column :end_parked1, :ff_endgame_parked_status, default: 'NONE'
      t.column :end_parked2, :ff_endgame_parked_status, default: 'NONE'
      t.column :end_parked3, :ff_endgame_parked_status, default: 'NONE'
      t.integer :capped, default: 0

      t.integer :minor_penalties, default: 0
      t.integer :major_penalties, default: 0

      t.timestamps
    end
  end
end
