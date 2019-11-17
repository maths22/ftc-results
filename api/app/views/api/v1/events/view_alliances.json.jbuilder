json.array! @alliances do |alliance|
  json.id alliance.id
  json.event_id alliance.event_id
  json.seed alliance.seed

  json.teams do
    json.array! alliance.teams.pluck(:number)
  end

  json.division alliance.event_division&.number
end
