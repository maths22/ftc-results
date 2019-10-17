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

  # Default JWTs are transient, good for 3 minutes
  def generate_jwt(subject:, action:, nbf: Time.now.to_i, exp: (Time.zone.now + 3.minutes).to_i, **payload)
    payload = payload.merge(sub: jwt_subject(subject), act: action, nbf: nbf, exp: exp)
    JWT.encode payload, hmac_secret, 'HS512'
  end

  def validate_jwt
    # rubocop:disable Style/GuardClause
    # Let's keep cancancan happy
    @_authorized = true
    subject = CanCan::ControllerResource.new(self).send(:resource_instance)

    token = params[:token] || request.headers['Authorization'].sub('Bearer ', '')
    begin
      @decoded_token = JWT.decode token, hmac_secret, true, algorithm: 'HS512'
    rescue JWT::ExpiredSignature
      render json: { error: 'URL expired', status: 'unauthorized' }, status: :unauthorized
      return
    rescue JWT::VerificationError
      render json: { error: 'Invalid URL (Invalid JWT)', status: 'unauthorized' }, status: :unauthorized
      return
    end

    if @decoded_token[0]['sub'] != jwt_subject(subject)
      render json: { error: "Invalid URL (JWT for #{@decoded_token[0]['sub']}, requested #{jwt_subject(subject)})", status: 'unauthorized' }, status: :unauthorized
      return
    end

    unless actions_for_alias(@decoded_token[0]['act'].to_sym).include? action_name.to_sym
      render json: { error: "Invalid URL (JWT for #{@decoded_token[0]['act']}, requested #{action_name})", status: 'unauthorized' }, status: :unauthorized
      return
    end
    # rubocop:enable Style/GuardClause
  end

  def validate_jwt_or_authorize_resource
    return validate_jwt if params[:token] || request.headers['Authorization']

    subject = CanCan::ControllerResource.new(self).send(:resource_instance)
    authorize!(params[:action].to_sym, subject)
  end

  def hmac_secret
    @hmac_secret ||= ENV.fetch('JWT_SIGNING_KEY', 'garbage')
  end

  def jwt_subject(resource)
    primary_key = resource[resource.class.primary_key]
    "#{resource.class.name}:#{primary_key}"
  end

  def actions_for_alias(name)
    Ability.new(nil).send(:expand_actions, [name]).flatten
  end

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
