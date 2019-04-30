class Season < ApplicationRecord
  scope :active, -> { where(active: true).order('year DESC') }

  def score_model
    score_model_name.constantize
  end
end
