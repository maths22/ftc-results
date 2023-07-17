class Award < ApplicationRecord
  belongs_to :event
  has_many :award_finalists, -> { order(:place) }, dependent: :destroy
end
