class Division < ApplicationRecord
  belongs_to :league
  has_many :divisions_teams, dependent: :destroy
  has_many :teams, through: :divisions_teams
  has_many :events, as: :context, dependent: :destroy

  def team_count
    divisions_teams.size
  end
end
