class League < ApplicationRecord
  has_many :divisions, dependent: :destroy
  belongs_to :season
  has_many :events, as: :context, dependent: :destroy
end
