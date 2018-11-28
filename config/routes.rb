Rails.application.routes.draw do
  # TODO: a better root!
  root 'application#index'

  get 'oauth/admin', to: 'oauth#admin_token' if Rails.env.development?
  devise_for :users
  mount RailsAdmin::Engine => '/admin', as: 'rails_admin'

  # mount Logster::Web => "/logs", constraints: Constraints::CanCan.new(:manage, :logs)

  namespace :api do
    namespace :v1 do
      resources :teams
      resources :events
      resources :leagues
      resources :divisions
      get 'events/download_scoring_system/:id', to: 'events#download_scoring_system'
      post 'events/import_results/:id', to: 'events#import_results'
      get 'rankings/league', to: 'league_rankings#index'

      post 'active_storage/direct_uploads' => 'direct_uploads#create'

      mount_devise_token_auth_for 'User', at: 'auth'
    end
  end
end
