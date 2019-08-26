class Division < ApplicationRecord
  belongs_to :league
  has_and_belongs_to_many :teams
  has_many :events, as: :context, dependent: :destroy

  def team_count
    teams.size
  end
end
