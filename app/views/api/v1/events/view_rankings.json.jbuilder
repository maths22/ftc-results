json.array! @rankings do |ranking|
  json.id ranking.id
  json.team_id ranking.team_id
  json.event_id ranking.event_id
  json.ranking ranking.ranking
  json.ranking_points ranking.ranking_points
  json.tie_breaker_points ranking.tie_breaker_points
  json.matches_played ranking.matches_played
  json.division ranking.event_division&.number

  json.record ranking.team.record(@matches)
end