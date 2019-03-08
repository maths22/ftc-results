module Constraints
  class CanCan
    def initialize(action, resource)
      @action = action
      @resource = resource
    end

    def matches?(req)
      return false unless req.env['warden'].authenticate?

      current_user = req.env['warden'].user
      ability = Ability.new(current_user)
      ability.can?(@action, @resource)
    end
  end
end
