class League < ApplicationRecord
  default_scope { where season: CurrentScope.season_or_default }

  has_many :divisions
  belongs_to :season
  has_many :events, as: :context
end
