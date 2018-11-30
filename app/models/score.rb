class Score < ApplicationRecord
  belongs_to :season_score, polymorphic: true, optional: true, dependent: :destroy

  before_save do |s|
    next if season_score.nil?

    s.auto = s.season_score.calc_auto
    s.teleop = s.season_score.calc_teleop
    s.endgame = s.season_score.calc_endgame
    s.penalty = s.season_score.calc_penalty
  end

  def earned
    auto + teleop + penalty
  end

  def match
    Match.where('red_score = ? OR blue_score = ?', id, id)
  end
end
