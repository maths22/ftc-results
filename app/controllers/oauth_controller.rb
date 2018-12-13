class OauthController < ApplicationController
  ANON_USER_ID = 0
  ADMIN_USER_ID = -1

  def anon_token
    render json: permanent_token_for_user(ANON_USER_ID)
  end

  def admin_token
    render json: permanent_token_for_user(ADMIN_USER_ID)
  end

  private

  def permanent_token_for_user(uid)
    User.find(uid).create_new_auth_token
  end
end
