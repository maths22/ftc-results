class Ranking < ApplicationRecord
  belongs_to :context, polymorphic: true, optional: true
  belongs_to :team
  belongs_to :event_division, optional: true
end
