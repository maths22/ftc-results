class Ranking < ApplicationRecord
  belongs_to :context, polymorphic: true, optional: true
  belongs_to :team, optional: true
  belongs_to :alliance, optional: true
  belongs_to :event_division, optional: true
end
