class AllianceTeam < ApplicationRecord
  default_scope { order(:position) }
  belongs_to :alliance
  belongs_to :team
  acts_as_list scope: :alliance
end
