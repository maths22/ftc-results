json.team do
  json.number @team.number
  json.name @team.name
  json.organization @team.organization
  json.city @team.city
  json.state @team.state
  json.country @team.country
  json.rookie_year @team.rookie_year
  json.consent_missing @team.consent_missing
  json.updated_at @team.updated_at
end

json.seasons do
  json.array! @team.seasons do |season|
    json.season season.year
    json.record @team.record(@team.events.where(season: season)
                  .flat_map { |val| @matches.group_by(&:event_id)[val.id] }.compact)
    json.league @team.leagues.where(season: season).leaf.first&.slug if @team.leagues.leaf.present?
    json.events do
      json.array! @team.events.where(season: season) do |event|
        json.data event, partial: 'events/base_info', as: :event
        json.ranking @team.rankings.find_by(context: event), partial: 'rankings/base_info', as: :ranking unless event.league_meet?
        json.matches do
          json.array! @matches.select { |m| m.event_id == event.id }, partial: 'matches/base_info', as: :match
        end
      end
    end
  end
end
