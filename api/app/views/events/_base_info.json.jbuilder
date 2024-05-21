json.id event.id

json.aasm_state event.aasm_state
json.context_id event.context_id
json.context_type event.context_type
json.season_id event.season_id
json.season event.season.year
json.type event.type
json.remote event.remote

json.slug event.slug
json.name event.name
json.start_date event.start_date
json.end_date event.end_date

json.location event.location
json.address event.address
json.city event.city
json.state event.state
json.country event.country

json.channel event.channel_name

json.import rails_blob_path(event.import, disposition: 'attachment') if event.import.attached?

json.can_import can? :import_results, event
json.owners event.owners.map(&:uid)

json.divisions do
  json.array! event.event_divisions do |division|
    json.id division.id
    json.event_id division.event_id
    json.name division.name
    json.slug division.slug
    json.import rails_blob_path(division.import, disposition: 'attachment') if division.import.attached?
  end
end
