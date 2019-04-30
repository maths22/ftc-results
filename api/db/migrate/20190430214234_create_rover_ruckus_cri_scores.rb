class CreateRoverRuckusCriScores < ActiveRecord::Migration[5.2]
  def change
    create_table :rover_ruckus_cri_scores do |t|
      t.integer :robots_landed, default: 0
      t.integer :depots_claimed, default: 0
      t.integer :robots_parked_auto, default: 0
      t.integer :fields_sampled, default: 0
      t.integer :depot_minerals, default: 0
      t.integer :depot_platinum_minerals, default: 0
      t.integer :gold_cargo, default: 0
      t.integer :silver_cargo, default: 0
      t.integer :any_cargo, default: 0
      t.integer :platinum_cargo, default: 0
      t.integer :latched_robots, default: 0
      t.integer :any_latched_robots, default: 0
      t.integer :robots_in_crater, default: 0
      t.integer :robots_completely_in_crater, default: 0
      t.integer :minor_penalties, default: 0
      t.integer :major_penalties, default: 0

      t.timestamps
    end
  end
end
