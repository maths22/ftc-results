class ChangeRankingValuesToFloat < ActiveRecord::Migration[6.0]
  def change
    change_column :rankings, :ranking_points, :float
    change_column :rankings, :tie_breaker_points, :float
  end
end
