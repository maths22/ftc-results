class Alliance < ApplicationRecord
  has_many :alliance_teams, dependent: :destroy
  has_many :teams, -> { order('alliance_teams.position ASC') }, through: :alliance_teams
  has_many :match_alliances, dependent: :destroy
  belongs_to :event
end
