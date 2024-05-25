# This file should contain all the record creation needed to seed the database with its default values.
# The data can then be loaded with the rails db:seed command (or created alongside the database with db:setup).
#
# Examples:
#
#   movies = Movie.create([{ name: 'Star Wars' }, { name: 'Lord of the Rings' }])
#   Character.create(name: 'Luke', movie: movies.first)

unknown_pass = SecureRandom.hex(64)
User.create! id: OauthController::ANON_USER_ID,
             uid: 'anon_user@example.com',
             name: 'Anonymous',
             email: 'anon_user@example.com',
             password: unknown_pass,
             password_confirmation: unknown_pass,
             role: 'anon'

# TODO: maybe do this
# Doorkeeper::Application.create! :name => "FTC Results Webapp",
#                                       :redirect_uri => '/oauth'

if Rails.env.development?
  User.create! id: OauthController::ADMIN_USER_ID,
               uid: 'test+admin@example.com',
               name: 'Anonymous - Admin',
               email: 'test+admin@example.com',
               password: unknown_pass,
               password_confirmation: unknown_pass,
               role: 'admin'
end

if Rails.env.test?
  Team.create!(number: 3216,
               name: "Robophins",
               organization: "Whitney Young Magnet High Sch",
               city: "Chicago",
               state: "IL",
               country: "USA",
               rookie_year: "2008")
  Team.create!(number: 5037,
               name: "got robot?",
               organization: "Klapperich Tool, Inc./Angularis Technologies, Inc.&4-H Robotics Special Interest Club",
               city: "Elgin",
               state: "IL",
               country: "USA",
               rookie_year: "2011")
  s = Season.create!(id: 1, year: '2023-2024', name: 'CENTERSTAGE', active: true, score_model_name: 'CenterstageScore')
  event = Event.create!(season: s, id: 1, type: :scrimmage,
                slug: 'USILCHS1',
                name: 'Illinois Test Scrimmage',
                start_date: '2024-01-18',
                end_date: '2024-01-18',
                location: 'Tall Building',
                address: '123 S Wacker Drive',
                city: 'Chicago',
                state: 'IL',
                country: 'USA')
  event.import.attach(io: File.open(Rails.root.join('db/seed/usilchs1.db')), filename: 'usilchs1.db')
  ::ScoringSystem::SqlitedbImportService.new(event).process
  League.create!(season_id: s.id, name: 'Chicago', slug: 'CHI')
end