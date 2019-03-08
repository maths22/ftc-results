json.array! @awards do |award|
  json.id award.id
  json.event_id award.event_id
  json.name award.name
  json.description award.description

  json.finalists do
    json.array! award.award_finalists do |finalist|
      json.place finalist.place
      json.recipient finalist.recipient
      json.team_id finalist.team_id
      json.description finalist.description
    end
  end
end