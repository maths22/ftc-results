class Match < ApplicationRecord
  belongs_to :event
  belongs_to :red_alliance, class_name: 'MatchAlliance', autosave: true
  belongs_to :blue_alliance, class_name: 'MatchAlliance', autosave: true
  belongs_to :red_score, class_name: 'Score', dependent: :destroy, optional: true
  belongs_to :blue_score, class_name: 'Score', dependent: :destroy, optional: true
  belongs_to :event_division, optional: true

  scope :in_season_meet, ->(season) { where(event: where(season: season, context_type: 'Division')) }

  %i[rp tbp score surrogate].each do |attribute|
    define_method :"#{attribute}_for_team" do |team|
      team = team.number unless team.is_a? Integer
      return red_alliance.send("#{attribute}_for_team", team) if red_alliance.alliance.team_ids.include? team
      return blue_alliance.send("#{attribute}_for_team", team) if blue_alliance.alliance.team_ids.include? team

      raise "Team #{team} not found for match"
    end
    define_method :"set_#{attribute}_for_team" do |team, val|
      team = team.number unless team.is_a? Integer
      return red_alliance.send("set_#{attribute}_for_team", team, val) if red_alliance.alliance.team_ids.include? team
      return blue_alliance.send("set_#{attribute}_for_team", team, val) if blue_alliance.alliance.team_ids.include? team

      raise "Team #{team} not found for match"
    end
  end

  def record_for_team(team)
    team = team.number unless team.is_a? Integer
    return red_rp if red_alliance.alliance.team_ids.include? team
    return blue_rp if blue_alliance.alliance.team_ids.include? team

    raise "Team #{team} not found for match"
  end

  %i[red blue].each do |color|
    other_color = color == :red ? :blue : :red

    define_method :"#{color}_score_total" do
      send(:"#{color}_score").earned + send(:"#{other_color}_score").penalty
    end

    define_method :"#{color}_wins?" do
      send(:"#{color}_score_total") > send(:"#{other_color}_score_total")
    end

    define_method :"#{color}_rp" do
      return 2 if send(:"#{color}_wins?")
      return 1 if tie?

      0
    end
  end

  def match_for_team?(team)
    team = team.number unless team.is_a? Integer
    red_alliance.alliance.team_ids.include?(team) || blue_alliance.alliance.team_ids.include?(team)
  end

  def normal_tbp
    return red_score.earned if blue_wins?
    return blue_score.earned if red_wins?

    [red_score.earned, blue_score.earned].min
  end

  def is_degenerate?
    red_wins? && blue_alliance.is_degenerate? ||
      blue_wins? && red_alliance.is_degenerate?
  end

  def tie?
    blue_score_total == red_score_total
  end

  def update_ranking_data
    red_alliance.rp[0] = red_rp if red_alliance.raw_counts_for_ranking? 0
    red_alliance.rp[1] = red_rp if red_alliance.raw_counts_for_ranking? 1
    blue_alliance.rp[0] = blue_rp if blue_alliance.raw_counts_for_ranking? 0
    blue_alliance.rp[1] = blue_rp if blue_alliance.raw_counts_for_ranking? 1

    red_alliance.rp[0] = red_score if is_degenerate? && red_wins? && red_alliance.raw_counts_for_ranking?(0)
    red_alliance.rp[1] = red_score if is_degenerate? && red_wins? && red_alliance.raw_counts_for_ranking?(1)
    blue_alliance.rp[0] = blue_score if is_degenerate? && blue_wins? && blue_alliance.raw_counts_for_ranking?(0)
    blue_alliance.rp[1] = blue_score if is_degenerate? && blue_wins? && blue_alliance.raw_counts_for_ranking?(1)

    red_alliance.tbp[0] = normal_tbp if red_alliance.raw_counts_for_ranking? 0
    red_alliance.tbp[1] = normal_tbp if red_alliance.raw_counts_for_ranking? 1
    blue_alliance.tbp[0] = normal_tbp if blue_alliance.raw_counts_for_ranking? 0
    blue_alliance.tbp[1] = normal_tbp if blue_alliance.raw_counts_for_ranking? 1

    red_alliance.score[0] = red_score_total unless red_alliance.surrogate[0]
    red_alliance.score[1] = red_score_total unless red_alliance.surrogate[1]
    blue_alliance.score[0] = blue_score_total unless blue_alliance.surrogate[0]
    blue_alliance.score[1] = blue_score_total unless blue_alliance.surrogate[1]
  end

  enum phase: %i[qual semi final]
end
