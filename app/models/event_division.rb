class EventDivision < ApplicationRecord
  belongs_to :event

  has_one_attached :import
end
