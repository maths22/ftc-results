module SeasonScore
  class SkystoneScore < ApplicationRecord
    def calc_auto
      10 * auto_skystones +
        2 * auto_delivered +
        4 * auto_placed +
        5 * robots_navigated +
        10 * foundation_repositioned
    end

    def calc_teleop
      1 * teleop_placed +
        1 * teleop_delivered +
        2 * tallest_height
    end

    def calc_endgame
      15 * foundation_moved +
        5 * robots_parked +
        (capstone_1_level >= 0 ? 5 + capstone_1_level : 0) +
        (capstone_2_level >= 0 ? 5 + capstone_2_level : 0)
    end

    def calc_penalty
      20 * major_penalties +
        5 * minor_penalties
    end
  end
end
