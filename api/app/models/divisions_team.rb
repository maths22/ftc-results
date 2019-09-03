class DivisionsTeam < ApplicationRecord
  belongs_to :division, counter_cache: true
  belongs_to :team
end
