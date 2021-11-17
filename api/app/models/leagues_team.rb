class LeaguesTeam < ApplicationRecord
  belongs_to :league, counter_cache: true
  belongs_to :team
end
