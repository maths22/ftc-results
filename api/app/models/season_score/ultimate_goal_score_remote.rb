module SeasonScore
  class UltimateGoalScoreRemote < ApplicationRecord
    self.table_name = 'ultimate_goal_scores_remote'

    def self.penalty_direction
      :subtract
    end

    def calc_auto
      (wobble_1_delivered ? 15 : 0) +
        (wobble_2_delivered ? 15 : 0) +
        12 * auto_tower_high +
        6 * auto_tower_mid +
        3 * auto_tower_low +
        (auto_power_shot_left ? 15 : 0) +
        (auto_power_shot_center ? 15 : 0) +
        (auto_power_shot_right ? 15 : 0) +
        (navigated ? 15 : 0)
    end

    def calc_teleop
      6 * teleop_tower_high +
        4 * teleop_tower_mid +
        2 * teleop_tower_low
    end

    def calc_endgame
      5 * wobble_1_rings +
        5 * wobble_2_rings +
        (teleop_power_shot_left ? 15 : 0) +
        (teleop_power_shot_center ? 15 : 0) +
        (teleop_power_shot_right ? 15 : 0) +
        (wobble_1_end == 2 ? 20 : (wobble_1_end == 1 ? 5 : 0)) +
        (wobble_2_end == 2 ? 20 : (wobble_2_end == 1 ? 5 : 0))
    end

    def calc_penalty
      30 * major_penalties +
        10 * minor_penalties
    end
  end
end
