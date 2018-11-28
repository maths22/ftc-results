class AddRankingComponentsToMatchAlliance < ActiveRecord::Migration[5.2]
  def change
    change_table :match_alliances, bulk: true do |t|
      t.json :rp
      t.json :tbp
      t.json :score
    end
  end
end
