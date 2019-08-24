class TwitchChannel < ApplicationRecord
  has_many :event_channel_assignments, dependent: :destroy

  scope :inactive, -> { where.not(id: active) }
  scope :active, -> { includes(:event_channel_assignments).merge(EventChannelAssignment.ready) }

  scope :managed, -> { where(unmanaged: false) }

  def current_assignment
    event_channel_assignments.ready.first
  end
end
