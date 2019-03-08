class AwardFinalist < ApplicationRecord
  belongs_to :award
  belongs_to :team, optional: true
end
