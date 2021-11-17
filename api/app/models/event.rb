class Event < ApplicationRecord
  scope :with_channel, -> { includes(event_channel_assignment: :twitch_channel) }
  scope :current_season, -> { where(season: Season.active.first) }

  include AASM

  has_many :events_teams, dependent: :destroy
  has_many :teams, through: :events_teams
  belongs_to :season
  has_many :rankings, as: :context, dependent: :destroy
  has_many :matches, dependent: :destroy
  has_many :alliances, dependent: :destroy
  has_many :event_divisions, dependent: :destroy
  has_many :awards, dependent: :destroy
  has_one :event_channel_assignment, dependent: :destroy

  has_many :events_sponsors, dependent: :destroy
  has_many :sponsors, through: :events_sponsors

  has_one_attached :import

  belongs_to :context, polymorphic: true, optional: true

  has_and_belongs_to_many :owners, class_name: 'User'

  enum type: {
    league_meet: 1,
    qualifier: 2,
    league_tournament: 3,
    championship: 4
  }

  def to_param
    slug
  end

  # So that type is a valid column name
  def self.inheritance_column
    :does_not_exist
  end

  # TODO: don't use ID
  def before_import_associations(record)
    return unless (ctx_id = record[:context_id]) && (ctx_type = record[:context_type])

    self.context = Division.find_by id: ctx_id if ctx_type == 'Division'
    self.context = League.find_by id: ctx_id if ctx_type == 'League'
  end

  def channel_name
    return nil if event_channel_assignment.nil?

    event_channel_assignment.twitch_channel.name
  end

  def divisions?
    event_divisions.count.positive?
  end

  aasm do
    state :not_started, initial: true
    state :in_progress,
          # :complete, //TODO support this one
          :finalized,
          :canceled

    event :start do
      transitions from: :not_started, to: :in_progress
    end

    event :finalize do
      transitions from: %i[not_started in_progress], to: :finalized
    end

    event :reset do
      transitions to: :not_started
      after :clear_associated_data
    end
  end

  def aasm_state_enum
    aasm.states
  end

  rails_admin do
    list do
      scopes [:current_season, nil]
    end

    import do
      mapping_key %i[season_id slug]
    end
  end

  private

  def clear_associated_data
    self.teams = []
    rankings.destroy_all
    matches.destroy_all
    alliances.destroy_all
    awards.destroy_all
  end
end
