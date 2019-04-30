class AddLeagueToSeason < ActiveRecord::Migration[5.2]
  def change
    add_column :seasons, :offseason, :boolean
  end
end
