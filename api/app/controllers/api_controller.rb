class ApiController < ApplicationController
  include DeviseTokenAuth::Concerns::SetUserByToken

  def authenticate_user!(_opts = {})
    render_authenticate_error unless current_user
  end

  def current_user
    @current_user ||= current_logedin_user || User.find(OauthController::ANON_USER_ID)
  end

  def user_signed_in?
    !!current_logedin_user
  end

  def current_logedin_user
    @current_logedin_user ||= set_user_by_token(:user)
  end

  before_action :authenticate_user!

  skip_before_action :verify_authenticity_token
  check_authorization

  before_action :set_season

  def set_season
    season_id = request.headers['X-Ftc-Season']
    return if season_id.nil?

    CurrentScope.season = Season.find_by year: season_id
    if CurrentScope.season.nil?
      render json: { error: "Invalid season #{season_id}" },
             status: :not_found
    end
  end

  rescue_from CanCan::AccessDenied do |exception|
    if current_user
      render json: { error: exception.message }, status: :forbidden
    else
      render json: { error: exception.message }, status: :unauthorized
    end
  end
end
