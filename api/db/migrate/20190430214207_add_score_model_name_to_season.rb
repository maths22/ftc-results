class AddScoreModelNameToSeason < ActiveRecord::Migration[5.2]
  def change
    add_column :seasons, :score_model_name, :string
  end
end
