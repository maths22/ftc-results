class Ability
  include CanCan::Ability

  def initialize(user)
    alias_action %i[
      reset
      post_rankings
      post_teams
      post_alliances
      post_matches
      post_match
      post_awards
    ], to: :live_upload

    user ||= User.new
    if user.admin?
      can :manage, :all
    else
      can :read, :all
      can :download_scoring_system_url, :all
      can :details, :all
      can :view_matches, :all
      can :view_rankings, :all
      can :view_teams, :all
      can :view_awards, :all
      can :request_access, :all

      can :search, User, :all if user.confirmed?

      can %i[
        import_results
        live_upload
        twitch
        remove_twitch
        read_scoring_secrets
        add_owner
        remove_owner
      ], Event, owners: { id: user.id }

    end
  end
end
