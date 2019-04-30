json.team do
  json.number @team.number
  json.name @team.name
  json.organization @team.organization
  json.city @team.city
  json.state @team.state
  json.country @team.country
  json.rookie_year @team.rookie_year
  json.consent_missing @team.consent_missing

  json.events @team.events.pluck(:id)
  json.division_id @team.divisions.pluck(:id).first

  json.record @team.record(@matches)
  json.records @matches.group_by(&:event_id).map { |k, v| [k, @team.record(v)] }.to_h
  json.rankings @team.rankings.map { |rk| [rk.event_id, rk.ranking] }.to_h
end

json.events do
  json.array! @team.events, partial: 'events/base_info', as: :event
end

json.matches do
  json.array! @matches, partial: 'matches/base_info', as: :match
end