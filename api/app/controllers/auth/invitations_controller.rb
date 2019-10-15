# frozen_string_literal: true

module Auth
  class InvitationsController < DeviseTokenAuth::ApplicationController
    prepend_before_action :authenticate_inviter!, only: %i[create]
    prepend_before_action :invitations_left?, only: [:create]
    prepend_before_action :require_no_authentication, only: %i[edit update destroy]
    prepend_before_action :resource_from_invitation_token, only: %i[edit destroy]
    before_action :validate_redirect_url_param, only: %i[create edit]
    skip_after_action :update_auth_header, only: %i[create edit]

    # this action is responsible for generating invitation tokens and sending emails
    def create
      return render_create_error_missing_email unless invite_params[:email]

      self.resource = invite_resource
      resource_invited = resource.errors.empty?

      if resource_invited
        yield resource_invited if block_given?

        return render_create_success if resource_invited.errors.empty?

        render_create_error resource_invited.errors
      else
        render_not_found_error
        # TODO: this doesn't make tons of logical sense
      end
    end

    # this is where users arrive after visiting the invitation link
    def edit
      set_minimum_password_length
      resource.invitation_token = params[:invitation_token]
      redirect_to DeviseTokenAuth::Url.generate(@redirect_url, invitation_token: params[:invitation_token])
    end

    # PUT /resource/invitation
    def update
      @resource = accept_resource
      invitation_accepted = @resource.errors.empty?

      yield @resource if block_given?
      return render_update_error_unauthorized unless @resource

      @token = @resource.create_token
      @resource.save

      return render_update_error unless invitation_accepted

      yield @resource if block_given?
      render_update_success
    end

    # GET /resource/invitation/remove?invitation_token=abcdef
    def destroy
      #   TODO update for token auth
      #   resource.destroy
      #   set_flash_message :notice, :invitation_removed if is_flashing_format?
      #   redirect_to after_sign_out_path_for(resource_name)
    end

    protected

    def invite_resource(&block)
      resource_class.invite!(invite_params, current_inviter, { 'redirect-url' => 'tmp' }, &block)
    end

    def accept_resource
      resource_class.accept_invitation!(update_resource_params)
    end

    def current_inviter
      authenticate_inviter!
    end

    def invitations_left?
      return if current_inviter.nil? || current_inviter.has_invitations_left?

      self.resource = resource_class.new
      set_flash_message :alert, :no_invitations_remaining if is_flashing_format?
      respond_with_navigational(resource) { render :new }
    end

    def resource_from_invitation_token
      # rubocop:disable Rails/DynamicFindBy
      # This is a custom method that happens to be named like a dynamic finder
      render_not_found_error unless params[:invitation_token] && (self.resource = resource_class.find_by_invitation_token(params[:invitation_token], true))
      # rubocop:enable Rails/DynamicFindBy
    end

    def invite_params
      # TODO: update?
      devise_parameter_sanitizer.sanitize(:invite)
    end

    def update_resource_params
      params.permit(:name, :password, :password_confirmation, :invitation_token)
    end

    def translation_scope
      'devise.invitations'
    end

    def render_create_error_missing_email
      render_error(401, I18n.t('devise_token_auth.passwords.missing_email'))
    end

    def render_create_error_missing_redirect_url
      render_error(401, I18n.t('devise_token_auth.passwords.missing_redirect_url'))
    end

    def render_error_not_allowed_redirect_url
      response = {
        status: 'error',
        data: resource_data
      }
      message = I18n.t('devise_token_auth.passwords.not_allowed_redirect_url', redirect_url: @redirect_url)
      render_error(422, message, response)
    end

    def render_create_success
      render json: {
        success: true,
        message: I18n.t('devise_token_auth.passwords.sended', email: @email)
      }
    end

    def render_create_error(errors)
      render json: {
        success: false,
        errors: errors
      }, status: :bad_request
    end

    def render_edit_error
      raise ActionController::RoutingError, 'Not Found'
    end

    def render_update_error_unauthorized
      render_error(401, 'Unauthorized')
    end

    def render_update_error_password_not_required
      render_error(422, I18n.t('devise_token_auth.passwords.password_not_required', provider: @resource.provider.humanize))
    end

    def render_update_error_missing_password
      render_error(422, I18n.t('devise_token_auth.passwords.missing_passwords'))
    end

    def render_update_success
      render json: {
        success: true,
        data: resource_data,
        message: I18n.t('devise_token_auth.passwords.successfully_updated')
      }
    end

    def render_update_error
      render json: {
        success: false,
        errors: resource_errors
      }, status: :unprocessable_entity
    end

    private

    def render_not_found_error
      render_error(404, I18n.t('devise_token_auth.passwords.user_not_found', email: @email))
    end

    def validate_redirect_url_param
      # give redirect value from params priority
      @redirect_url = params.fetch(
        :redirect_url,
        DeviseTokenAuth.default_password_reset_url
      )

      return render_create_error_missing_redirect_url unless @redirect_url
      return render_error_not_allowed_redirect_url if blacklisted_redirect_url?(@redirect_url)
    end
  end
end
