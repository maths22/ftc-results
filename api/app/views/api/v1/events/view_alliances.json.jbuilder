json.alliances @alliances do |alliance|
  json.id alliance.id
  json.event_id alliance.event_id
  json.seed alliance.seed

  json.teams do
    json.array! alliance.teams.pluck(:number)
  end

  json.division alliance.event_division.slug if alliance.event_division
end

json.rankings @rankings, partial: 'rankings/base_info', as: :ranking
