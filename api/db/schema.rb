# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2019_07_16_130116) do

  # These are extensions that must be enabled in order to support this database
  enable_extension "plpgsql"

  create_table "access_requests", force: :cascade do |t|
    t.bigint "user_id"
    t.bigint "event_id"
    t.string "message"
    t.string "access_token"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_access_requests_on_event_id"
    t.index ["user_id"], name: "index_access_requests_on_user_id"
  end

  create_table "active_storage_attachments", force: :cascade do |t|
    t.string "name", null: false
    t.string "record_type", null: false
    t.bigint "record_id", null: false
    t.bigint "blob_id", null: false
    t.datetime "created_at", null: false
    t.index ["blob_id"], name: "index_active_storage_attachments_on_blob_id"
    t.index ["record_type", "record_id", "name", "blob_id"], name: "index_active_storage_attachments_uniqueness", unique: true
  end

  create_table "active_storage_blobs", force: :cascade do |t|
    t.string "key", null: false
    t.string "filename", null: false
    t.string "content_type"
    t.text "metadata"
    t.bigint "byte_size", null: false
    t.string "checksum", null: false
    t.datetime "created_at", null: false
    t.index ["key"], name: "index_active_storage_blobs_on_key", unique: true
  end

  create_table "alliance_teams", force: :cascade do |t|
    t.bigint "team_id", null: false
    t.bigint "alliance_id", null: false
    t.integer "position"
    t.index ["alliance_id", "team_id"], name: "index_alliance_teams_on_alliance_id_and_team_id"
    t.index ["team_id", "alliance_id"], name: "index_alliance_teams_on_team_id_and_alliance_id"
  end

  create_table "alliances", force: :cascade do |t|
    t.bigint "event_id"
    t.boolean "is_elims"
    t.integer "seed"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "event_division_id"
    t.index ["event_division_id"], name: "index_alliances_on_event_division_id"
    t.index ["event_id"], name: "index_alliances_on_event_id"
  end

  create_table "award_finalists", force: :cascade do |t|
    t.bigint "award_id"
    t.bigint "team_id"
    t.string "recipient"
    t.integer "place"
    t.text "description"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["award_id"], name: "index_award_finalists_on_award_id"
    t.index ["team_id"], name: "index_award_finalists_on_team_id"
  end

  create_table "awards", force: :cascade do |t|
    t.string "name"
    t.text "description"
    t.bigint "event_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_awards_on_event_id"
  end

  create_table "delayed_jobs", id: :serial, force: :cascade do |t|
    t.integer "priority", default: 0
    t.integer "attempts", default: 0
    t.text "handler"
    t.text "last_error"
    t.string "queue", limit: 255
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string "locked_by", limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "tag", limit: 255
    t.integer "max_attempts"
    t.string "strand", limit: 255
    t.boolean "next_in_strand", default: true, null: false
    t.string "source", limit: 255
    t.integer "max_concurrent", default: 1, null: false
    t.datetime "expires_at"
    t.index ["locked_by"], name: "index_delayed_jobs_on_locked_by", where: "(locked_by IS NOT NULL)"
    t.index ["priority", "run_at", "queue"], name: "get_delayed_jobs_index", where: "((locked_at IS NULL) AND (next_in_strand = true))"
    t.index ["run_at", "tag"], name: "index_delayed_jobs_on_run_at_and_tag"
    t.index ["strand", "id"], name: "index_delayed_jobs_on_strand"
    t.index ["tag"], name: "index_delayed_jobs_on_tag"
  end

  create_table "divisions", force: :cascade do |t|
    t.string "name"
    t.bigint "league_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "slug"
    t.index ["league_id"], name: "index_divisions_on_league_id"
  end

  create_table "divisions_teams", id: false, force: :cascade do |t|
    t.bigint "team_id", null: false
    t.bigint "division_id", null: false
    t.index ["division_id", "team_id"], name: "index_divisions_teams_on_division_id_and_team_id"
    t.index ["team_id", "division_id"], name: "index_divisions_teams_on_team_id_and_division_id"
  end

  create_table "event_channel_assignments", force: :cascade do |t|
    t.bigint "event_id"
    t.bigint "twitch_channel_id"
    t.date "start_date"
    t.date "end_date"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.string "aasm_state"
    t.bigint "user_id"
    t.index ["event_id"], name: "index_event_channel_assignments_on_event_id"
    t.index ["twitch_channel_id"], name: "index_event_channel_assignments_on_twitch_channel_id"
    t.index ["user_id"], name: "index_event_channel_assignments_on_user_id"
  end

  create_table "event_divisions", force: :cascade do |t|
    t.bigint "event_id"
    t.integer "number"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["event_id"], name: "index_event_divisions_on_event_id"
  end

  create_table "events", force: :cascade do |t|
    t.string "name"
    t.date "start_date"
    t.date "end_date"
    t.string "location"
    t.string "city"
    t.string "state"
    t.string "country"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "season_id"
    t.string "context_type"
    t.bigint "context_id"
    t.string "aasm_state"
    t.string "slug"
    t.string "address"
    t.index ["context_type", "context_id"], name: "index_events_on_context_type_and_context_id"
    t.index ["season_id"], name: "index_events_on_season_id"
  end

  create_table "events_sponsors", force: :cascade do |t|
    t.bigint "sponsor_id", null: false
    t.bigint "event_id", null: false
    t.index ["event_id", "sponsor_id"], name: "index_events_sponsors_on_event_id_and_sponsor_id"
    t.index ["sponsor_id", "event_id"], name: "index_events_sponsors_on_sponsor_id_and_event_id"
  end

  create_table "events_teams", force: :cascade do |t|
    t.bigint "team_id", null: false
    t.bigint "event_id", null: false
    t.bigint "event_division_id"
    t.index ["event_division_id"], name: "index_events_teams_on_event_division_id"
    t.index ["event_id", "team_id"], name: "index_events_teams_on_event_id_and_team_id"
    t.index ["team_id", "event_id"], name: "index_events_teams_on_team_id_and_event_id"
  end

  create_table "events_users", id: false, force: :cascade do |t|
    t.bigint "event_id", null: false
    t.bigint "user_id", null: false
    t.index ["event_id", "user_id"], name: "index_events_users_on_event_id_and_user_id"
    t.index ["user_id", "event_id"], name: "index_events_users_on_user_id_and_event_id"
  end

  create_table "failed_jobs", id: :serial, force: :cascade do |t|
    t.integer "priority", default: 0
    t.integer "attempts", default: 0
    t.string "handler", limit: 512000
    t.text "last_error"
    t.string "queue", limit: 255
    t.datetime "run_at"
    t.datetime "locked_at"
    t.datetime "failed_at"
    t.string "locked_by", limit: 255
    t.datetime "created_at"
    t.datetime "updated_at"
    t.string "tag", limit: 255
    t.integer "max_attempts"
    t.string "strand", limit: 255
    t.bigint "original_job_id"
    t.string "source", limit: 255
    t.datetime "expires_at"
  end

  create_table "leagues", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "season_id"
    t.string "slug"
    t.index ["season_id"], name: "index_leagues_on_season_id"
  end

  create_table "match_alliances", force: :cascade do |t|
    t.bigint "alliance_id"
    t.json "surrogate"
    t.json "present"
    t.json "red_card"
    t.json "yellow_card"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.json "rp"
    t.json "tbp"
    t.json "score"
    t.index ["alliance_id"], name: "index_match_alliances_on_alliance_id"
  end

  create_table "matches", force: :cascade do |t|
    t.integer "phase"
    t.integer "series"
    t.integer "number"
    t.bigint "red_alliance_id"
    t.bigint "blue_alliance_id"
    t.bigint "red_score_id"
    t.bigint "blue_score_id"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "event_id"
    t.boolean "played"
    t.bigint "event_division_id"
    t.index ["blue_alliance_id"], name: "index_matches_on_blue_alliance_id"
    t.index ["blue_score_id"], name: "index_matches_on_blue_score_id"
    t.index ["event_division_id"], name: "index_matches_on_event_division_id"
    t.index ["event_id"], name: "index_matches_on_event_id"
    t.index ["red_alliance_id"], name: "index_matches_on_red_alliance_id"
    t.index ["red_score_id"], name: "index_matches_on_red_score_id"
  end

  create_table "rankings", force: :cascade do |t|
    t.bigint "team_id"
    t.bigint "event_id"
    t.integer "ranking"
    t.integer "ranking_points"
    t.integer "tie_breaker_points"
    t.integer "matches_played"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.bigint "event_division_id"
    t.index ["event_division_id"], name: "index_rankings_on_event_division_id"
    t.index ["event_id"], name: "index_rankings_on_event_id"
    t.index ["team_id"], name: "index_rankings_on_team_id"
  end

  create_table "rover_ruckus_cri_scores", force: :cascade do |t|
    t.integer "robots_landed", default: 0
    t.integer "depots_claimed", default: 0
    t.integer "robots_parked_auto", default: 0
    t.integer "fields_sampled", default: 0
    t.integer "depot_minerals", default: 0
    t.integer "depot_platinum_minerals", default: 0
    t.integer "gold_cargo", default: 0
    t.integer "silver_cargo", default: 0
    t.integer "any_cargo", default: 0
    t.integer "platinum_cargo", default: 0
    t.integer "latched_robots", default: 0
    t.integer "any_latched_robots", default: 0
    t.integer "robots_in_crater", default: 0
    t.integer "robots_completely_in_crater", default: 0
    t.integer "minor_penalties", default: 0
    t.integer "major_penalties", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "rover_ruckus_scores", force: :cascade do |t|
    t.integer "robots_landed", default: 0
    t.integer "depots_claimed", default: 0
    t.integer "robots_parked_auto", default: 0
    t.integer "fields_sampled", default: 0
    t.integer "depot_minerals", default: 0
    t.integer "gold_cargo", default: 0
    t.integer "silver_cargo", default: 0
    t.integer "latched_robots", default: 0
    t.integer "robots_in_crater", default: 0
    t.integer "robots_completely_in_crater", default: 0
    t.integer "minor_penalties", default: 0
    t.integer "major_penalties", default: 0
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
  end

  create_table "scores", force: :cascade do |t|
    t.string "season_score_type"
    t.bigint "season_score_id"
    t.integer "auto"
    t.integer "teleop"
    t.integer "endgame"
    t.integer "penalty"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["season_score_type", "season_score_id"], name: "index_scores_on_season_score_type_and_season_score_id"
  end

  create_table "seasons", force: :cascade do |t|
    t.string "year"
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "active"
    t.boolean "offseason"
    t.string "score_model_name"
  end

  create_table "sponsors", force: :cascade do |t|
    t.string "name"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "global"
  end

  create_table "teams", primary_key: "number", force: :cascade do |t|
    t.string "name"
    t.string "organization"
    t.string "city"
    t.string "state"
    t.string "country"
    t.string "rookie_year"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "consent_missing"
  end

  create_table "twitch_channels", force: :cascade do |t|
    t.string "name"
    t.string "access_token"
    t.string "refresh_token"
    t.datetime "expires_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.boolean "unmanaged", default: false, null: false
  end

  create_table "users", force: :cascade do |t|
    t.string "provider", default: "email", null: false
    t.string "uid", default: "", null: false
    t.string "encrypted_password", default: "", null: false
    t.string "reset_password_token"
    t.datetime "reset_password_sent_at"
    t.boolean "allow_password_change", default: false
    t.datetime "remember_created_at"
    t.integer "sign_in_count", default: 0, null: false
    t.datetime "current_sign_in_at"
    t.datetime "last_sign_in_at"
    t.string "current_sign_in_ip"
    t.string "last_sign_in_ip"
    t.string "confirmation_token"
    t.datetime "confirmed_at"
    t.datetime "confirmation_sent_at"
    t.string "unconfirmed_email"
    t.string "name"
    t.string "nickname"
    t.string "image"
    t.string "email"
    t.text "tokens"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.integer "role"
    t.index ["confirmation_token"], name: "index_users_on_confirmation_token", unique: true
    t.index ["email"], name: "index_users_on_email", unique: true
    t.index ["reset_password_token"], name: "index_users_on_reset_password_token", unique: true
    t.index ["uid", "provider"], name: "index_users_on_uid_and_provider", unique: true
  end

  add_foreign_key "award_finalists", "awards"
  add_foreign_key "award_finalists", "teams", primary_key: "number"
  add_foreign_key "awards", "events"
  add_foreign_key "divisions", "leagues"
  add_foreign_key "event_channel_assignments", "users"
  add_foreign_key "event_divisions", "events"
end
