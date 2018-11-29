json.number @team.number
json.name @team.name
json.organization @team.organization
json.city @team.city
json.state @team.state
json.country @team.country
json.rookie_year @team.rookie_year

json.events @team.events.pluck(:id)
json.division_id @team.divisions.pluck(:id).first

json.matches do
  json.array! @matches,partial:'matches/base_info', as: :match
end
