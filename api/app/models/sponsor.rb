class Sponsor < ApplicationRecord
  has_one_attached :logo

  has_many :events_sponsors, dependent: :destroy
  has_many :events, through: :events_sponsors

  scope :global, -> { where(global: true) }
end
