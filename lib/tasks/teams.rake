namespace :teams do
  desc 'TODO'
  task refresh: :environment do
    # TODO: generalize season

    batch_size = 10

    Team.all.pluck(:number).each_slice(batch_size) do |teams|
      first_data = process_es_data(get_first_data(teams))

      Rails.logger.debug "Refreshing info for #{teams}"
      teams.each do |team_id|
        unless first_data.key?(team_id)
          Rails.logger.info "Team #{team_id} not found in FIRST data"
          next
        end

        team_data = first_data[team_id]
        team = Team.find(team_id)
        team.name = team_data[:team_nickname]
        team.organization = team_data[:team_name_calc]
        team.city = team_data[:team_city]
        team.state = team_data[:team_stateprov]
        team.country = team_data[:team_country]
        team.rookie_year = team_data[:team_rookieyear]
        Rails.logger.error "Could not save team #{team_id}" unless team.save
      end
    end
  end

  def get_first_data(teams)
    url = 'http://es01.usfirst.org/teams_v1/_search?'
    search_args = {
      team_type: 'FTC',
      profile_year: '2018',
      team_number_yearly: teams
    }
    query_str = search_args.map do |k, v|
      if v.is_a?(Array)
        '(' + v.map { |v2| k.to_s + ':' + v2.to_s }
               .join(' OR ') + ')'
      else
        k.to_s + ':' + v.to_s
      end
    end
                           .join(' AND ')
    query_args = { q: query_str }
    Net::HTTP.get(URI.parse(url + query_args.to_query))
  end

  def process_es_data(data)
    json = JSON.parse data, symbolize_names: true
    json[:hits][:hits].pluck(:_source).index_by { |t| t[:team_number_yearly] }
  end
end
