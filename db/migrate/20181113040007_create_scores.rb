class CreateScores < ActiveRecord::Migration[5.2]
  def change
    create_table :scores do |t|
      t.references :season_score, polymorphic: true, index: true
      t.integer :auto
      t.integer :teleop
      t.integer :endgame
      t.integer :penalty

      t.timestamps
    end
  end
end
