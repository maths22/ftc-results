json.id match.id
json.event_id match.event_id
json.division match.event_division.slug if match.event_division
json.phase match.phase
json.series match.series if match.series
json.number match.number
json.name match.name
json.played !!match.played
if match.event.remote
  json.team match.red_alliance.alliance.teams.map(&:id)
  json.score match.red_score_total if match.played
  json.no_show !match.red_alliance.teams_present[0]
else
  json.red_alliance match.red_alliance.alliance.teams.map(&:id)
  json.red_surrogate match.red_alliance.surrogate
  json.blue_alliance match.blue_alliance.alliance.teams.map(&:id)
  json.blue_surrogate match.blue_alliance.surrogate
  json.red_score match.red_score_total if match.played
  json.blue_score match.blue_score_total if match.played
end
