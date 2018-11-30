class Alliance < ApplicationRecord
  has_many :alliance_teams, dependent: :destroy
  has_many :teams, through: :alliance_teams
  has_many :match_alliances, dependent: :destroy
  belongs_to :event
end
