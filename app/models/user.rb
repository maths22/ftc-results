class User < ApplicationRecord
  # Include default devise modules. Others available are:
  # :lockable, :timeoutable and :omniauthable
  devise :confirmable, :database_authenticatable, :registerable,
         :recoverable, :rememberable, :trackable, :validatable

  include DeviseTokenAuth::Concerns::User

  # Deprecate special user types-user, admin, anon should be sufficent
  enum role: %i[user _event_host admin anon _reg_admin]

  has_and_belongs_to_many :events

  after_initialize do
    self.role ||= :user if new_record?
  end

  rails_admin do
    object_label_method do
      :uid
    end
  end
end
