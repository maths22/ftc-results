class Ability
  include CanCan::Ability

  def initialize(user)
    alias_action(*Api::V1::EventsController::MANAGE_RESULTS_ACTIONS, to: :manage_results)

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
      can :view_alliances, :all
      can :view_awards, :all
      can :request_access, :all

      can :search, User, :all if user.confirmed?

      can %i[
        manage_results
        twitch
        remove_twitch
        read_scoring_secrets
        add_owner
        remove_owner
      ], Event, owners: { id: user.id }

    end
  end
end
