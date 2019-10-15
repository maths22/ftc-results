require 'delayed/server'

Rails.application.routes.draw do
  # api
  # service
  # rails/active_storage
  # assets
  root 'application#index'

  get 'oauth/admin', to: 'oauth#admin_token' if Rails.env.development?

  scope '/rails' do
    devise_for :users
    mount RailsAdmin::Engine => '/admin', as: 'rails_admin'
    mount Delayed::Server.new => '/jobs'

    # mount Logster::Web => "/logs", constraints: Constraints::CanCan.new(:manage, :logs)
    #
    get 'twitch/authorize', to: 'twitch_oauth#authorize'
    get 'twitch/callback', to: 'twitch_oauth#callback', as: 'twitch_oauth_callback'
  end

  namespace :api do
    namespace :v1 do
      resources :seasons
      resources :teams
      get 'teams/details/:id', to: 'teams#details'
      resources :users do
        collection do
          get 'search'
        end
      end
      resources :events
      get 'events/matches/:id', to: 'events#view_matches'
      get 'events/rankings/:id', to: 'events#view_rankings'
      get 'events/awards/:id', to: 'events#view_awards'
      get 'events/teams/:id', to: 'events#view_teams'
      get 'events/download_scoring_system_url/:id', to: 'events#download_scoring_system_url'
      get 'events/download_scoring_system/:id', to: 'events#download_scoring_system', as: 'download_scoring_system'
      resources :leagues
      get 'leagues/details/:slug', to: 'leagues#details'
      resources :divisions
      post 'events/import_results/:id', to: 'events#import_results'
      get 'rankings/league', to: 'league_rankings#index'
      get 'rankings/league/:id', to: 'league_rankings#league_data'
      get 'rankings/division/:id', to: 'league_rankings#division_data'

      get 'matches/details/:id', to: 'matches#details'

      post 'active_storage/direct_uploads' => 'direct_uploads#create'

      mount_devise_token_auth_for 'User', at: 'auth', controllers: {
        confirmations: 'auth/confirmations'
      }, skip: [:invitations]
      devise_for :users, path: 'auth', only: [:invitations],
                         controllers: { invitations: 'auth/invitations' }

      # Upload routes
      post 'events/reset/:id', to: 'events#reset'
      post 'events/state/:id', to: 'events#post_state'
      post 'events/rankings/:id', to: 'events#post_rankings'
      post 'events/awards/:id', to: 'events#post_awards'
      post 'events/teams/:id', to: 'events#post_teams'
      post 'events/alliances/:id', to: 'events#post_alliances'
      post 'events/matches/:id', to: 'events#post_matches'
      post 'events/matches/:id/:mid', to: 'events#post_match'

      post 'events/twitch/:id', to: 'events#twitch'
      delete 'events/twitch/:id', to: 'events#remove_twitch'

      post 'events/add_owner/:id', to: 'events#add_owner'
      post 'events/remove_owner/:id', to: 'events#remove_owner'

      post 'events/requestAccess/:id', to: 'events#request_access'
      get 'events/approveAccess/:token', to: 'events#approve_access', as: 'approve_access'
    end
  end

  health_check_routes
end
