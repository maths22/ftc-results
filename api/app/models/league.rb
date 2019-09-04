class League < ApplicationRecord
  scope :current_season, -> { where(season: Season.active.first) }

  has_many :divisions, dependent: :destroy
  belongs_to :season
  has_many :events, as: :context, dependent: :destroy

  rails_admin do
    list do
      scopes [:current_season, nil]
    end
  end
end
