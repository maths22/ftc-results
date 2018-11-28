class Match < ApplicationRecord
  belongs_to :event
  belongs_to :red_alliance, class_name: 'MatchAlliance', autosave: true
  belongs_to :blue_alliance, class_name: 'MatchAlliance', autosave: true
  belongs_to :red_score, class_name: 'Score', dependent: :destroy
  belongs_to :blue_score, class_name: 'Score', dependent: :destroy

  scope :in_season_meet, ->(season) { where(event: where(season: season, context_type: 'Division')) }

  %i[rp tbp score].each do |attribute|
    define_method :"#{attribute}_for_team" do |team|
      return red_alliance.send("#{attribute}_for_team", team) if red_alliance.alliance.teams.include? team
      return blue_alliance.send("#{attribute}_for_team", team) if blue_alliance.alliance.teams.include? team

      raise "Team #{team.number} not found for match"
    end
    define_method :"set_#{attribute}_for_team" do |team, val|
      return red_alliance.send("set_#{attribute}_for_team", team, val) if red_alliance.alliance.teams.include? team
      return blue_alliance.send("set_#{attribute}_for_team", team, val) if blue_alliance.alliance.teams.include? team

      raise "Team #{team.number} not found for match"
    end
  end

  enum phase: %i[qual semi final]
end
