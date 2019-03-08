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
