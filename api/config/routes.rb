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
      resources :teams do
        member do
          get 'details'
        end
      end
      resources :users do
        collection do
          get 'search'
        end
      end
      scope ':season' do
        resources :events do
          member do
            # Basic views
            get 'matches', action: 'view_matches'
            get 'rankings', action: 'view_rankings'
            get 'awards', action: 'view_awards'
            get 'alliances', action: 'view_alliances'
            get 'teams', action: 'view_teams'
            post 'transform_db', action: 'transform_scoring_system'

            post 'import_results'

            post 'reset'
            post 'state', action: 'post_state'
            post 'rankings', action: 'post_rankings'
            post 'awards', action: 'post_awards'
            post 'teams', action: 'post_teams'
            post 'alliances', action: 'post_alliances'
            post 'matches', action: 'post_matches'
            post 'matches/:mid', action: 'post_match'

            post 'twitch'
            delete 'twitch', action: 'remove_twitch'

            post 'add_owner'
            post 'remove_owner'

            post 'request_access'
          end


        end

        resources :leagues do
          member do
            get 'details'
          end
        end

        get 'rankings/league', to: 'league_rankings#index'
        get 'rankings/league/:id', to: 'league_rankings#league_data'
      end

      resources :leagues

      resources :events do
        collection do
          get 'approve_access/:token', action: 'approve_access', as: 'approve_access'
        end
      end

      get 'matches/:id/details', to: 'matches#details'

      mount_devise_token_auth_for 'User', at: 'auth', controllers: {
        confirmations: 'auth/confirmations'
      }, skip: [:invitations]
      devise_for :users, path: 'auth', only: [:invitations],
                         controllers: { invitations: 'auth/invitations' }

      get 'events/approveAccess/:token', to: 'events#approve_access'

      post 'scoring/uploads', to: 'scoring#uploads'
      put 'scoring/uploads', to: 'scoring#process_upload'
      post 'scoring/sync/upload', to: 'scoring#sync_upload'
    end
  end

  health_check_routes
end
