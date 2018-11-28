class DirectUploadsController < ActiveStorage::DirectUploadsController
  include DeviseTokenAuth::Concerns::SetUserByToken

  protect_from_forgery with: :exception
  before_action :authenticate_user!
  skip_before_action :verify_authenticity_token
  # check_authorization
end
