class Season < ApplicationRecord
  scope :active, -> { where(active: true).order('year DESC') }

  def score_model
    "SeasonScore::#{score_model_name}".constantize
  end
end
