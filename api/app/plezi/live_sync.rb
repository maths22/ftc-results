module Executable
  module ClassMethods
    def rails_executor_wrap(name)
      alias_method "unwrapped_#{name}", name

      class_eval <<~RUBY, __FILE__, __LINE__ + 1
        def #{name}(...)
          Rails.application.executor.wrap do
            unwrapped_#{name}(...)
          end
        end
      RUBY
    end
  end

  def self.included(base)
    base.extend ClassMethods
  end
end

class LiveSync
  include Executable
  LEVEL_TO_PHASE = {
    'FINAL' => :final,
    'SEMIFINAL' => :semi
  }

  def self.hmac_secret
    @hmac_secret ||= ENV.fetch('JWT_SIGNING_KEY', 'garbage')
  end

  def self.load_event(request)
    authorization = request.env['HTTP_AUTHORIZATION']
    if authorization.nil? || authorization.split(':')[0] != 'Bearer local'
      return nil
    end
    jwt = authorization.split(':')[1]
    begin
      decoded_token = JWT.decode jwt, hmac_secret, false, algorithm: 'HS512'
    rescue JWT::ExpiredSignature
      return nil
    rescue JWT::VerificationError
      return nil
    end

    if decoded_token[0]['act'] != 'manage_results'
      return nil
    end

    subj = decoded_token[0]['sub'].split(':')
    if subj[0] != 'Event'
      return nil
    end
    @event = Event.find(subj[1])
  end

  def pre_connect
    @event = LiveSync.load_event(request)
    !@event.nil?
  end
  rails_executor_wrap :pre_connect

  def on_message(data)
    msg = JSON.parse(data)
    res = { id: msg['id'], status: 500, description: "An unknown error occurred"}
    begin
      case msg['type']
      when "PRESENCE"
        # We don't show presence anywhere, so just don't track it, at least for now
        res[:status] = 200
        res[:description] = "OK"
      when "CHAT_MESSAGE"
        # We don't process chat, so just swallow it (also we don't advertise it as enabled...)
        res[:status] = 200
        res[:description] = "OK"
      when "SYNC"
        ActiveRecord::Base.transaction do
          _process_sync(msg['body'], res)
        end
      end
    rescue => e
      Rails.logger.error "Error occurred processing message: #{data} #{e.full_message}"
    end

    write JSON.dump({ id: SecureRandom.uuid, type: 'MESSAGE_RESPONSE', body: JSON.dump(res) } )
  end
  rails_executor_wrap :on_message

  def _process_sync(body, res)
    msg = JSON.parse(body)

    if @event.finalized?
      res[:status] = 429
      res[:description] = "DISABLED"
      return
    end

    # @event.start! if !@event.in_progress?
    case msg['type']
    when 'TEAM_LIST'
      _sync_teams(msg['payload'])
    when 'QUALS_LIST'
      _sync_quals_matches(msg['payload'], full: true)
    when 'QUALS_MATCH'
      _sync_quals_matches(msg['payload'], full: false)
    when 'SELECTION'
      _sync_alliances(msg['payload'])
    when 'ELIMS_LIST'
      _sync_elims_matches(msg['payload'])
    when 'FULL'
       _sync_teams(msg['payload']['teamSync'])
       _sync_quals_matches(msg['payload']['qualsSync'], full: true)
       _sync_alliances(msg['payload']['allianceSelectionSync'])
       _sync_elims_matches(msg['payload']['elimsSync'])
    # NOOP
    when "TEST"
    #  Do nothing with these because we don't care
    when 'TRACKING'
    when 'TEAM_STATUS'
    when 'CONFIG'
    else
      Rails.logger.warn "Unknown sync type #{msg['type']}"
      puts msg['payload']
      return
    end

    begin
    rescue => e
      Rails.logger.error "Error occurred processing sync: #{body} #{e.full_message}"
      res[:status] = 400
      res[:description] = "ERROR"
      return
    end
    res[:status] = 200
    res[:description] = "OK"
  end

  def _sync_teams(team_list)
    team_numbers = team_list.filter { |t| t['competing'] == 'FULL' }.pluck('number')
    new_team_nums = team_numbers - @event.teams.pluck(:number)
    teams = new_team_nums.map { |t| Team.find_or_create_by(number: t) }

    @event.teams = @event.teams + teams
    @event.teams = @event.teams.select { |t| team_numbers.include? t.number }
    @event.save!
  end

  def _sync_quals_matches(match_list, full:)
    unless match_list['qualsActive']
      @event.matches.qual.destroy_all
      return
    end

    @event.start! unless @event.in_progress?
    alliance_scope = Alliance.joins(:alliance_teams).group('alliances.id').where(event: Event.last, is_elims: false)
    having_clause = 'ARRAY[?]::bigint[] = ARRAY_AGG(alliance_teams.team_id ORDER BY alliance_teams.position)'
    match_list['matches'].each do |data|
      match = @event.matches.qual.find_or_initialize_by(number: data['number'])
      # TODO need to update the alliance if it already exists...
      team_count = data['red3'] > 0 ? 3 : 2
      red_teams = (1..team_count).map { |t| data["red#{t}"] }
      red_alliance = alliance_scope.having(having_clause, red_teams).create_with(team_ids: red_teams).first_or_create!
      match.red_alliance ||= MatchAlliance.new(alliance: red_alliance)
      match.red_alliance.alliance = red_alliance
      match.red_alliance.surrogate = (1..team_count).map { |t| data["red#{t}S"] }
      match.red_alliance.teams_present = (1..team_count).map { |t| !data["red#{t}NS"] }
      match.red_alliance.teams_start = (1..team_count).map { |t| data["red#{t}Start"] }
      match.red_alliance.red_card = (1..team_count).map { |t| (data["red#{t}C"] & 2).positive? }
      match.red_alliance.yellow_card = (1..team_count).map { |t| (data["red#{t}C"] & 1).positive? }
      match.red_alliance.save!

      blue_teams = (1..team_count).map { |t| data["blue#{t}"] }
      blue_alliance = alliance_scope.having(having_clause, blue_teams).create_with(team_ids: blue_teams).first_or_create!
      match.blue_alliance ||= MatchAlliance.new(alliance: blue_alliance)
      match.blue_alliance.alliance = blue_alliance
      match.blue_alliance.surrogate = (1..team_count).map { |t| data["blue#{t}S"] }
      match.blue_alliance.teams_present = (1..team_count).map { |t| !data["blue#{t}NS"] }
      match.blue_alliance.teams_start = (1..team_count).map { |t| data["blue#{t}Start"] }
      match.blue_alliance.red_card = (1..team_count).map { |t| (data["blue#{t}C"] & 2).positive? }
      match.blue_alliance.yellow_card = (1..team_count).map { |t| (data["blue#{t}C"] & 1).positive? }
      match.blue_alliance.save!

      match.played = !!data['scorekeeperCommitTime']

      if match.played
        fms_scores = JSON.parse(Zlib.gunzip(Base64.decode64(data['fmsScores'])))
        match.red_score ||= Score.new
        match.red_score.season_score ||= @event.season.score_model.new
        match.red_score.save!
        match.red_score.season_score.update_from_fms_score!(fms_scores['RedAllianceScore'], fms_scores['BlueAllianceScore'])
        match.red_score.update(auto: fms_scores['RedAllianceScore']['AutoPoints'],
                               teleop: fms_scores['RedAllianceScore']['DcPoints'],
                               endgame: fms_scores['RedAllianceScore']['EndgamePoints'],
                               penalty: fms_scores['RedAllianceScore']['PenaltyPoints'])
        match.blue_score ||= Score.new
        match.blue_score.season_score ||= @event.season.score_model.new
        match.blue_score.save!
        match.blue_score.season_score.update_from_fms_score!(fms_scores['BlueAllianceScore'], fms_scores['RedAllianceScore'])
        match.blue_score.update(auto: fms_scores['BlueAllianceScore']['AutoPoints'],
                                teleop: fms_scores['BlueAllianceScore']['DcPoints'],
                                endgame: fms_scores['BlueAllianceScore']['EndgamePoints'],
                                penalty: fms_scores['BlueAllianceScore']['PenaltyPoints'])
      end

      match.save!
    end

    if full
      @event.matches.qual.where.not(number: match_list['matches'].pluck('number')).destroy_all
    end

    match_list['ranks'].each do |rk|
      @event.rankings.find_or_create_by(team: Team.find(rk['team'])).tap do |nr|
        nr.sort_order1 = rk['tuple'][0]
        nr.sort_order2 = rk['tuple'][1]
        nr.sort_order3 = rk['tuple'][2]
        nr.sort_order4 = rk['tuple'][3]
        nr.sort_order5 = rk['tuple'][4]
        nr.sort_order6 = rk['tuple'][5]

        nr.matches_played = rk['played']
        nr.matches_counted = rk['counted']
        nr.wins = rk['wins']
        nr.losses = rk['losses']
        nr.ties = rk['ties']

        nr.save!
      end
    end
    @event.rankings.reject { |r| match_list['ranks'].pluck('team').include?(r.team.number) }.each(&:destroy)
    @event.rankings.reload.sort_by { |rk| [rk.sort_order1, rk.sort_order2, rk.sort_order3, rk.matches_played.zero? ? -rk.team_id : rk.sort_order4, rk.sort_order5, rk.sort_order6] }.reverse.each_with_index do |rk, idx|
      rk.update(ranking: (idx + 1) * (rk.matches_played.zero? ? -1 : 1))
    end
  end

  def _sync_alliances(selection_data)
    selection_data['alliances'].each do |data|
      alliance = Alliance.find_or_create_by!(event: @event, is_elims: true, seed: data['seed'])
      alliance.teams = Team.find(data['members'])
      alliance.save!
    end
  end


  def _sync_elims_matches(match_list)
    @event.start! unless @event.in_progress?
    match_list['matches'].each do |data|
      match = @event.matches.find_or_initialize_by(phase: LEVEL_TO_PHASE[data['level']], series: data['series'], number: data['number'])
      red_alliance = Alliance.find_by!(event: @event, is_elims: true, seed: data['redSeed'])
      red_team_count = red_alliance.teams.count
      match.red_alliance ||= MatchAlliance.new(alliance: red_alliance)
      match.red_alliance.teams_present = (1..red_team_count).map { |t| !data["red#{t}NS"] }
      match.red_alliance.teams_start = (1..red_team_count).map { |t| data["red#{t}Start"] }
      match.red_alliance.red_card = Array.new(red_team_count, (data['red1C'] & 2).positive?)
      match.red_alliance.yellow_card = Array.new(red_team_count, (data['red1C'] & 1).positive?)
      match.red_alliance.save!

      blue_alliance = Alliance.find_by!(event: @event, is_elims: true, seed: data['blueSeed'])
      blue_team_count = blue_alliance.teams.count
      match.blue_alliance ||= MatchAlliance.new(alliance: blue_alliance)
      match.blue_alliance.teams_present = (1..blue_team_count).map { |t| !data["blue#{t}NS"] }
      match.blue_alliance.teams_start = (1..blue_team_count).map { |t| data["blue#{t}Start"] }
      match.blue_alliance.red_card = Array.new(blue_team_count, (data['blue1C'] & 2).positive?)
      match.blue_alliance.yellow_card = Array.new(blue_team_count, (data['blue1C'] & 1).positive?)
      match.blue_alliance.save!

      match.played = !!data['scorekeeperCommitTime']

      if match.played
        fms_scores = JSON.parse(Zlib.gunzip(Base64.decode64(data['fmsScores'])))
        match.red_score ||= Score.new
        match.red_score.season_score ||= @event.season.score_model.new
        match.red_score.save!
        match.red_score.season_score.update_from_fms_score!(fms_scores['RedAllianceScore'], fms_scores['BlueAllianceScore'])
        match.red_score.update(auto: fms_scores['RedAllianceScore']['AutoPoints'],
                               teleop: fms_scores['RedAllianceScore']['DcPoints'],
                               endgame: fms_scores['RedAllianceScore']['EndgamePoints'],
                               penalty: fms_scores['RedAllianceScore']['PenaltyPoints'])
        match.blue_score ||= Score.new
        match.blue_score.season_score ||= @event.season.score_model.new
        match.blue_score.save!
        match.blue_score.season_score.update_from_fms_score!(fms_scores['BlueAllianceScore'], fms_scores['RedAllianceScore'])
        match.blue_score.update(auto: fms_scores['BlueAllianceScore']['AutoPoints'],
                                teleop: fms_scores['BlueAllianceScore']['DcPoints'],
                                endgame: fms_scores['BlueAllianceScore']['EndgamePoints'],
                                penalty: fms_scores['BlueAllianceScore']['PenaltyPoints'])
      end

      match.save!
    end

    @event.matches.where.not(phase: 'qual').where.not(number: match_list['matches'].pluck('number')).destroy_all

    if(match_list['ranks'])
      match_list['ranks'].each do |rk|
        @event.elims_rankings.find_or_create_by(alliance: Alliance.find_by!(event: @event, is_elims: true, seed: rk['team'])).tap do |nr|
          nr.sort_order1 = rk['tuple'][0]
          nr.sort_order2 = rk['tuple'][1]
          nr.sort_order3 = rk['tuple'][2]
          nr.sort_order4 = rk['tuple'][3]
          nr.sort_order5 = rk['tuple'][4]
          nr.sort_order6 = rk['tuple'][5]

          nr.matches_played = rk['played']
          nr.matches_counted = rk['counted']
          nr.wins = rk['wins']
          nr.losses = rk['losses']
          nr.ties = rk['ties']

          nr.save!
        end
      end
      @event.elims_rankings.reject { |r| match_list['ranks'].pluck('team').include?(r.alliance.seed) }.each(&:destroy)
      @event.elims_rankings.reload.sort_by { |rk| [rk.sort_order1, rk.sort_order2, rk.sort_order3, rk.matches_played.zero? ? -rk.alliance.seed : rk.sort_order4, rk.sort_order5, rk.sort_order6] }.reverse.each_with_index do |rk, idx|
        rk.update(ranking: (idx + 1) * (rk.matches_played.zero? ? -1 : 1))
      end
    end
  end
end