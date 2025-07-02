class Season < ApplicationRecord
  scope :active, -> { where(active: true).order('year DESC') }

  def score_model(remote: false)
    "SeasonScore::#{score_model_name}#{remote ? 'Remote' : ''}".constantize
  end

  def first_api_year
    year.split('-').first
  end

  enum :ranking_algorithm, {
    traditional: 0,
    skystone: 1
  }
end
