class Ability
  include CanCan::Ability

  def initialize(user)
    # Define abilities for the passed in user here. For example:
    #
    #   user ||= User.new # guest user (not logged in)
    #   if user.admin?
    #     can :manage, :all
    #   else
    #     can :read, :all
    #   end
    #
    # The first argument to `can` is the action you are giving the user
    # permission to do.
    # If you pass :manage it will apply to every action. Other common actions
    # here are :read, :create, :update and :destroy.
    #
    # The second argument is the resource the user can perform the action on.
    # If you pass :all it will apply to every resource. Otherwise pass a Ruby
    # class of the resource.
    #
    # The third argument is an optional hash of conditions to further filter the
    # objects.
    # For example, here the user can only update published articles.
    #
    #   can :update, Article, :published => true
    #
    # See the wiki for details:
    # https://github.com/CanCanCommunity/cancancan/wiki/Defining-Abilities
    #

    user ||= User.new
    if user.admin?
      can :manage, :all
    else
      can :read, :all
      can :download_scoring_system, :all
      can :details, :all
      can :view_matches, :all
      can :view_rankings, :all
      can :view_teams, :all
      can :view_awards, :all
      can :request_access, :all

      can %i[
        import_results
        reset
        post_rankings
        post_teams
        post_alliances
        post_matches
        post_match
        post_awards
        twitch
        remove_twitch
      ], Event do |evt|
        evt.owner_ids.include? user.id
      end

    end
  end
end
