class League < ApplicationRecord
  has_many :divisions
  belongs_to :season
  has_many :events, as: :context
end
