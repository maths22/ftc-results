class Score < ApplicationRecord
  belongs_to :season_score, polymorphic: true, optional: true, dependent: :destroy

  before_save do |s|
    next if season_score.nil?

    s.auto = s.season_score.calc_auto
    s.teleop = s.season_score.calc_teleop
    s.endgame = s.season_score.calc_endgame
    s.penalty = s.season_score.calc_penalty
  end

  def auto
    return 0 if season_score.nil?

    self[:auto] || season_score.calc_auto
  end

  def teleop
    return 0 if season_score.nil?

    self[:teleop] || season_score.calc_teleop
  end

  def endgame
    return 0 if season_score.nil?

    self[:endgame] || season_score.calc_endgame
  end

  def penalty
    return 0 if season_score.nil?

    self[:penalty] || season_score.calc_penalty
  end

  def penalty_direction
    return nil if season_score.nil?

    season_score.class.try(:penalty_direction) || :add
  end

  def earned
    auto + teleop + endgame
  end

  def match
    Match.where('red_score = ? OR blue_score = ?', id, id)
  end
end
