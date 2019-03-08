json.id match.id
json.event_id match.event_id
json.division match.event_division&.number
json.phase match.phase
json.series match.series
json.number match.number
json.played match.played
json.red_alliance match.red_alliance.alliance.teams.map(&:id)
json.red_surrogate match.red_alliance.surrogate
json.blue_alliance match.blue_alliance.alliance.teams.map(&:id)
json.blue_surrogate match.blue_alliance.surrogate
json.red_score match.red_score_total if match.played
json.blue_score match.blue_score_total if match.played