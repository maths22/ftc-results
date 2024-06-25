module ScoringSystem
  TYPE_SCRIMMAGE = 0
  TYPE_LEAGUE_MEET = 1
  TYPE_QUALIFIER = 2
  TYPE_LEAGUE_TOURNAMENT = 3
  TYPE_CHAMPIONSHIP = 4
  TYPE_OTHER = 5

  # rubocop:disable Naming/AccessorMethodName
  class SqlitedbTransformerService
    include Rails.application.routes.url_helpers
    attr_reader :event, :token, :root_url

    def initialize(event, token:, root_url:)
      @event = event
      @token = token
      @root_url = root_url
    end

    def transform_event_db(db_file)

      db = SQLite3::Database.new db_file

      event_uuid = SecureRandom.uuid
      set_uuid db, event_uuid
      set_field_count db

      set_config db, "code", event.slug.downcase
      set_config db, "onlineResultsUrl", "#{root_url}#{event.season.year}/events/#{event.slug}"
      set_config db, "name", event.name
      set_config db, "start", event.start_date.in_time_zone.change(hour: 8).to_i.to_s + '000'
      set_config db, "end", event.end_date.in_time_zone.change(hour: 17).to_i.to_s + '000'
      set_config db, "division", 0
      set_config db, "status", 1
      set_config db, "finals", "false"

      type = if event.league_meet?
                     ScoringSystem::TYPE_LEAGUE_MEET
                   elsif event.league_tournament?
                     ScoringSystem::TYPE_LEAGUE_TOURNAMENT
                   elsif event.season.offseason?
                     ScoringSystem::TYPE_OTHER
                   else
                     ScoringSystem::TYPE_CHAMPIONSHIP
                   end
      set_config db, "type", type
      set_config db, "region", "USIL"
      set_config db, "address", event.address
      set_config db, "venue", event.location
      # here would be league/leagueId/leagueName if it was a league meet
      set_config db, "city", event.city
      set_config db, "state", event.state
      set_config db, "country", event.country
      set_config db, "ek", token
      set_config db, "cloudBaseUrl", "#{root_url}api/v1/scoring"
      set_config db, "advancement.enabled", "false"
    end

    def set_field_count(db)
      set_config(db, 'fieldCount', event.league_meet? ? 1 : 2)
    end

    def set_uuid(db, uuid)
      set_config(db, 'FMSEventId', uuid)
    end

    def set_config(db, key, value)
      db.execute 'INSERT OR REPLACE INTO config (key, value) VALUES (:key, :value)',
                 key: key,
                 value: value
    end
  end
  # rubocop:enable Naming/AccessorMethodName
end
