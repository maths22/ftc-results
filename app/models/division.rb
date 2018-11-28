class Division < ApplicationRecord
  default_scope { joins(:league).where(leagues: { season: CurrentScope.season_or_default }) }

  belongs_to :league
  has_and_belongs_to_many :teams
  has_many :events, as: :context

  def team_count
    teams.size
  end
end
