json.id ranking.id
if ranking.team_id
  json.team ranking.team_id
elsif ranking.alliance_id
  json.alliance ranking.alliance.seed
end
json.context_type ranking.context_type
json.context_id ranking.context_id
json.league ranking.context.slug if ranking.context_type == 'League'
json.ranking ranking.ranking
json.sort_order1 ranking.sort_order1
json.sort_order2 ranking.sort_order2
json.sort_order3 ranking.sort_order3
json.sort_order4 ranking.sort_order4
json.sort_order5 ranking.sort_order5
json.sort_order6 ranking.sort_order6
json.matches_played ranking.matches_played
json.matches_counted ranking.matches_counted
json.division ranking.event_division.slug if ranking.event_division

json.record do
  json.win ranking.wins
  json.loss ranking.losses
  json.tie ranking.ties
end