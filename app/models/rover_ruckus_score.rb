class RoverRuckusScore < ApplicationRecord
  def calc_auto
    30 * robots_landed +
      15 * depots_claimed +
      10 * robots_parked_auto +
      25 * fields_sampled
  end

  def calc_teleop
    2 * depot_minerals +
      5 * silver_cargo +
      5 * gold_cargo
  end

  def calc_endgame
    50 * latched_robots +
      15 * robots_in_crater +
      25 * robots_completely_in_crater
  end

  def calc_penalty
    40 * major_penalties +
      10 * minor_penalties
  end
end
