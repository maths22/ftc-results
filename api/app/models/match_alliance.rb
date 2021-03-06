class MatchAlliance < ApplicationRecord
  belongs_to :alliance
  has_one :match, lambda { |ma|
    unscope(where: :match_alliance_id)
      .where('matches.red_alliance_id = :id OR matches.blue_alliance_id = :id', id: ma.id)
  }, inverse_of: false

  after_initialize :add_arrays, if: :new_record?

  def add_arrays
    # raise "MatchAlliance must be initialized with an alliance" if ma.alliance.nil?
    return if alliance.nil?

    self.surrogate = Array.new(alliance.teams.size, false)
    self.red_card = Array.new(alliance.teams.size, false)
    self.yellow_card = Array.new(alliance.teams.size, false)
    self.teams_present = Array.new(alliance.teams.size, true)

    # Note that these are only used for imported qualification matches
    self.rp = Array.new(alliance.teams.size, 0)
    self.tbp = Array.new(alliance.teams.size, 0)
    self.score = Array.new(alliance.teams.size, 0)
  end

  %i[rp tbp score surrogate red_card yellow_card teams_present].each do |attribute|
    define_method :"#{attribute}_for_team" do |team|
      team = team.number unless team.is_a? Integer
      idx = alliance.team_ids.index(team)
      raise "Team #{team} not found for alliance" if idx.nil?

      send(attribute)[idx]
    end

    define_method :"set_#{attribute}_for_team" do |team, val|
      team = team.number unless team.is_a? Integer
      idx = alliance.team_ids.index(team)
      raise "Team #{team} not found for alliance" if idx.nil?

      send(attribute)[idx] = val
    end
  end

  def counts_for_ranking?(team)
    team = team.number unless team.is_a? Integer
    raw_counts_for_ranking?(alliance.team_ids.index(team))
  end

  def raw_counts_for_ranking?(pos)
    return false if alliance.is_elims?

    !surrogate[pos] && teams_present[pos] && !red_card[pos]
  end

  def degenerate?
    teams_present.zip(red_card).all? { |arr| !arr[0] || arr[1] }
  end
end
