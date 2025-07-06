class Match < ApplicationRecord
  belongs_to :event
  belongs_to :red_alliance, class_name: 'MatchAlliance', autosave: true
  belongs_to :blue_alliance, class_name: 'MatchAlliance', autosave: true
  belongs_to :red_score, class_name: 'Score', dependent: :destroy, optional: true
  belongs_to :blue_score, class_name: 'Score', dependent: :destroy, optional: true
  belongs_to :event_division, optional: true

  scope :in_season_meet, ->(season) { where(event: where(season: season, type: :league_meet)) }

  %i[rp tbp score surrogate red_card].each do |attribute|
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
    return nil unless played?

    team = team.number unless team.is_a? Integer
    return red_rp if red_alliance.alliance.team_ids.include? team
    return blue_rp if blue_alliance.alliance.team_ids.include? team

    raise "Team #{team} not found for match"
  end

  %i[red blue].each do |color|
    other_color = color == :red ? :blue : :red

    define_method :"#{color}_score_total" do
      if send("#{color}_score").penalty_direction == :add
        [0, send(:"#{color}_score").earned + send(:"#{other_color}_score").penalty].max
      else
        [0, send(:"#{color}_score").earned - send(:"#{color}_score").penalty].max
      end
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

  def degenerate?
    red_wins? && blue_alliance.degenerate? ||
      blue_wins? && red_alliance.degenerate?
  end

  def tie?
    blue_score_total == red_score_total
  end

  def update_ranking_data
    update_rp
    update_degenerate_rp
    update_tbp
    update_score
  end

  def update_rp
    red_alliance.rp[0] = red_rp if red_alliance.raw_counts_for_ranking? 0
    red_alliance.rp[1] = red_rp if red_alliance.raw_counts_for_ranking? 1
    blue_alliance.rp[0] = blue_rp if blue_alliance.raw_counts_for_ranking? 0
    blue_alliance.rp[1] = blue_rp if blue_alliance.raw_counts_for_ranking? 1
  end

  def update_degenerate_rp
    return unless degenerate?

    update_red_degenerate_rp if red_wins?
    update_blue_degenerate_rp if blue_wins?
  end

  def update_red_degenerate_rp
    red_alliance.rp[0] = red_score if red_alliance.raw_counts_for_ranking?(0)
    red_alliance.rp[1] = red_score if red_alliance.raw_counts_for_ranking?(1)
  end

  def update_blue_degenerate_rp
    blue_alliance.rp[0] = blue_score if blue_alliance.raw_counts_for_ranking?(0)
    blue_alliance.rp[1] = blue_score if blue_alliance.raw_counts_for_ranking?(1)
  end

  def update_tbp
    red_alliance.tbp[0] = normal_tbp if red_alliance.raw_counts_for_ranking? 0
    red_alliance.tbp[1] = normal_tbp if red_alliance.raw_counts_for_ranking? 1
    blue_alliance.tbp[0] = normal_tbp if blue_alliance.raw_counts_for_ranking? 0
    blue_alliance.tbp[1] = normal_tbp if blue_alliance.raw_counts_for_ranking? 1
  end

  def update_score
    red_alliance.score[0] = red_score_total unless red_alliance.surrogate[0]
    red_alliance.score[1] = red_score_total unless red_alliance.surrogate[1]
    blue_alliance.score[0] = blue_score_total unless blue_alliance.surrogate[0]
    blue_alliance.score[1] = blue_score_total unless blue_alliance.surrogate[1]
  end

  NAME_PREFIXES = { qual: 'Q', semi: 'SF', final: 'F', interfinal: 'IF', playoff: 'P' }
  def name
    [series == 0 && phase == 'semi' ? 'P' : NAME_PREFIXES[phase.to_sym], series == 0 ? nil : series, phase == 'playoff' && number == 1 ? nil : number].compact.join('-')
  end

  def self.parse_name(name)
    parts = name.split('-')
    ret = { phase: parts.first == 'P' ? [:semi, :playoff] : NAME_PREFIXES.invert[parts.first], number: parts.last.to_i }
    if parts.length == 3
      ret[:series] = parts[1].to_i
    elsif parts.length == 2 && parts.first == 'P'
      ret[:series] = parts[1].to_i
      ret[:number] = 1
    end
    ret
  end

  enum :phase, {
    qual: 0,
    semi: 1,
    final: 2,
    interfinal: 3,
    playoff: 4,
    practice: 5,
  }
end
