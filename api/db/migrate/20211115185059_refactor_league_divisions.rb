class RefactorLeagueDivisions < ActiveRecord::Migration[6.1]
  def change
    create_join_table :teams, :leagues do |t|
      t.column :id, :primary_key
      t.index %i[team_id league_id]
      t.index %i[league_id team_id]
    end
    add_column :leagues, :leagues_teams_count, :integer
    add_reference :leagues, :league, foreign_key: true, index: true

    Division.all.each do |div|
      l = League.create!(slug: div.slug, name: div.name, season: div.season, league: div.league)

      DivisionTeams.where(division: div).each do |dt|
        LeagueTeam.create!(league: l, team: dt.team)
      end
    end
  end
end
