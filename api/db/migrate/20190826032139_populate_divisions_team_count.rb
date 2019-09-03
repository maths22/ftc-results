class PopulateDivisionsTeamCount < ActiveRecord::Migration[6.0]
  def change
    Division.find_each do |article|
      Division.reset_counters(article.id, :divisions_teams)
    end
  end
end
