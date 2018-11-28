class CreateMatchAlliance < ActiveRecord::Migration[5.2]
  def change
    create_table :match_alliances do |t|
      t.references :alliance
      t.json :surrogate
      t.json :present
      t.json :red_card
      t.json :yellow_card

      t.timestamps
    end
  end
end
