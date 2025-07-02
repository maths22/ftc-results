class Division < ApplicationRecord
  scope :current_season, -> { joins(:league).where(leagues: { season: Season.active.first }) }

  belongs_to :league
  has_many :divisions_teams, dependent: :destroy
  has_many :teams, through: :divisions_teams
  has_many :events, as: :context, dependent: :destroy

  def team_count
    divisions_teams.size
  end

  rails_admin do
    list do
      scopes [:current_season, nil]
    end
  end
end
