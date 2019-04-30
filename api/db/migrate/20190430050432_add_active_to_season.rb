class AddActiveToSeason < ActiveRecord::Migration[5.2]
  def change
    add_column :seasons, :active, :boolean
  end
end
