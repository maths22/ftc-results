json.id @match.id
json.phase @match.phase
json.series @match.series if @match.series
json.number @match.number
json.event_id @match.event_id

json.season_score_type @match.red_score.season_score_type.sub('SeasonScore::', '')

if @match.event.remote
  json.score_total @match.red_score_total
  json.score @match.red_score, partial: 'scores/base_info', as: :score
  json.score_details @match.red_score.season_score,
                        partial: "season_score/#{@match.red_score.season_score.class.table_name}/base_info",
                        as: :score
else
  json.red_score_total @match.red_score_total
  json.red_score @match.red_score, partial: 'scores/base_info', as: :score
  json.red_score_details @match.red_score.season_score,
                        partial: "season_score/#{@match.red_score.season_score.class.table_name}/base_info",
                        as: :score
  json.blue_score_total @match.blue_score_total
  json.blue_score @match.blue_score, partial: 'scores/base_info', as: :score
  json.blue_score_details @match.blue_score.season_score,
                          partial: "season_score/#{@match.blue_score.season_score.class.table_name}/base_info",
                          as: :score
end
