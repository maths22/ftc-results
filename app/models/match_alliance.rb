class MatchAlliance < ApplicationRecord
  belongs_to :alliance
  has_one :match, ->(ma) do
    unscope(where: :match_alliance_id)
      .where('matches.red_alliance_id = :id OR matches.blue_alliance_id = :id', id: ma.id)
  end

  after_initialize :add_arrays, if: :new_record?

  def add_arrays
    # raise "MatchAlliance must be initialized with an alliance" if ma.alliance.nil?
    return if alliance.nil?

    self.surrogate = Array.new(alliance.teams.size, false)
    self.red_card = Array.new(alliance.teams.size, false)
    self.yellow_card = Array.new(alliance.teams.size, false)
    self.present = Array.new(alliance.teams.size, true)

    # Note that these are only used for imported qualification matches
    self.rp = Array.new(alliance.teams.size, 0)
    self.tbp = Array.new(alliance.teams.size, 0)
    self.score = Array.new(alliance.teams.size, 0)
  end

  %i[rp tbp score surrogate red_card yellow_card present].each do |attribute|
    define_method :"#{attribute}_for_team" do |team|
      idx = alliance.teams.index(team)
      raise "Team #{team.number} not found for alliance" if idx.nil?

      send(attribute)[idx]
    end

    define_method :"set_#{attribute}_for_team" do |team, val|
      idx = alliance.teams.index(team)
      raise "Team #{team.number} not found for alliance" if idx.nil?

      send(attribute)[idx] = val
    end
  end

  def counts_for_ranking?(team)
    raw_counts_for_ranking?(alliance.teams.index(team))
  end

  def raw_counts_for_ranking?(pos)
    !surrogate[pos] && present[pos] && !red_card[pos]
  end

  def is_degenerate?(pos)
    present.zip(red_card).all? { |arr| !arr[0] || arr[1] }
  end
end
