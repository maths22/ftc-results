class Event < ApplicationRecord
  default_scope { where season: CurrentScope.season_or_default }

  include AASM

  has_and_belongs_to_many :teams
  belongs_to :season
  has_many :rankings, dependent: :destroy
  has_many :matches, dependent: :destroy
  has_many :rankings, dependent: :destroy
  has_many :alliances, dependent: :destroy

  has_one_attached :import

  belongs_to :context, polymorphic: true, optional: true

  # TODO: don't use ID
  # def before_import_associations(record)
  #   return unless (ctx_id = record[:context_id]) && (ctx_type = record[:context_type])
  #
  #   self.context = Division.find_by id: ctx_id if ctx_type == 'Division'
  #   self.context = League.find_by ctx_id if ctx_type == 'League'
  # end

  def league_meet?
    context.is_a? Division
  end

  def league_championship?
    context.is_a? League
  end

  aasm do
    state :not_started, initial: true
    state :in_progress,
          # :complete, //TODO support this one
          :finalized

    event :start do
      transitions from: :not_started, to: :in_progress
    end

    event :finalize do
      transitions from: %i[not_started in_progress], to: :finalized
    end
  end
end
