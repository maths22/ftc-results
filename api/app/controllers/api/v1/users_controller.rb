module Api
  module V1
    class UsersController < ::ApiController
      load_and_authorize_resource
      skip_load_resource only: [:search]

      # GET /users
      def index
        render json: @users.where(uid: params[:uids])
      end

      # GET /users/1
      def show
        render json: @user
      end

      def search
        render json: User.where('uid ILIKE :query OR name ILIKE :query', query: "#{params[:query]}%").order(:name, :uid).limit(10)
      end
    end
  end
end
