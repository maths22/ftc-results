class UpdateSeasonScoreNames < ActiveRecord::Migration[6.0]
  def up
    ActiveRecord::Base.connection.execute("UPDATE #{Score.quoted_table_name} SET season_score_type = CONCAT('SeasonScore::', season_score_type)")
  end

  def down
    ActiveRecord::Base.connection.execute("UPDATE #{Score.quoted_table_name} SET season_score_type = REPLACE(season_score_type, 'SeasonScore::', '')")
  end
end
