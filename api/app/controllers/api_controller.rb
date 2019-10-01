class ApiController < ApplicationController
  include DeviseTokenAuth::Concerns::SetUserByToken

  def authenticate_user!(_opts = {})
    render_authenticate_error unless current_user
  end

  def current_user
    @current_user ||= current_logedin_user || User.find(OauthController::ANON_USER_ID)
  end

  def current_logedin_user
    @current_logedin_user ||= set_user_by_token(:user)
  end

  def request_cacheable?
    Rails.env.production? && request.headers['HTTP_X_UID'].present?
  end

  before_action :authenticate_user!

  skip_before_action :verify_authenticity_token
  check_authorization

  def request_season
    if params[:season]
      Season.find_by(year: params[:season])
    else
      Season.active.first
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
