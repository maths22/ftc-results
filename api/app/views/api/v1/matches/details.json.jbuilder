json.id @match.id
json.phase @match.phase
json.series @match.series if @match.series
json.number @match.number
json.event_id @match.event_id
json.random @match.random

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
  json.red_seed @match.red_alliance.alliance.seed
  json.red_teams @match.red_alliance.alliance.teams.map(&:id)
  json.red_surrogate @match.red_alliance.surrogate
  json.red_starts @match.red_alliance.teams_start if @match.red_alliance.teams_start
  json.blue_score_total @match.blue_score_total
  json.blue_score @match.blue_score, partial: 'scores/base_info', as: :score
  json.blue_score_details @match.blue_score.season_score,
                          partial: "season_score/#{@match.blue_score.season_score.class.table_name}/base_info",
                          as: :score
  json.blue_seed @match.blue_alliance.alliance.seed
  json.blue_teams @match.blue_alliance.alliance.teams.map(&:id)
  json.blue_surrogate @match.blue_alliance.surrogate
  json.blue_starts @match.blue_alliance.teams_start if @match.blue_alliance.teams_start
end
