class AddScoringVersionConstraintToSeason < ActiveRecord::Migration[6.0]
  def change
    add_column :seasons, :scoring_version_constraint, :string
  end
end
