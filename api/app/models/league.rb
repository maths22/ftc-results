class League < ApplicationRecord
  scope :current_season, -> { where(season: Season.active.first) }
  scope :leaf, -> { left_outer_joins(:leagues).where(leagues_leagues: { id: nil }) }

  has_many :leagues, dependent: :destroy
  belongs_to :season
  belongs_to :league, optional: true
  has_many :leagues_teams, dependent: :destroy
  has_many :teams, through: :leagues_teams
  has_many :events, as: :context, dependent: :destroy

  def to_param
    slug
  end

  def team_count
    leagues_teams.size
  end

  rails_admin do
    list do
      scopes [:current_season, nil]
    end
  end
end
