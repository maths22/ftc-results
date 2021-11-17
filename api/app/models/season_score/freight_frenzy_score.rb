module SeasonScore
  class FreightFrenzyScore < ApplicationRecord
    AUTO_NAVIGATED_POINTS = {
      'NONE' => 0,
      'IN_STORAGE' => 3,
      'COMPLETELY_IN_STORAGE' => 6,
      'IN_WAREHOUSE' => 5,
      'COMPLETELY_IN_WAREHOUSE' => 10
    }.freeze

    END_PARKED_POINTS = {
      'NONE' => 0,
      'IN_WAREHOUSE' => 3,
      'COMPLETELY_IN_WAREHOUSE' => 6
    }.freeze

    def self.penalty_direction
      :subtract
    end

    def calc_auto
      (carousel ? 10 : 0) +
        AUTO_NAVIGATED_POINTS[auto_navigated1] +
        AUTO_NAVIGATED_POINTS[auto_navigated2] +
        (auto_bonus1 ? (barcode_element1 == 'TEAM_SHIPPING_ELEMENT' ? 20 : 10) : 0) +
        (auto_bonus2 ? (barcode_element2 == 'TEAM_SHIPPING_ELEMENT' ? 20 : 10) : 0) +
        2 * auto_storage_freight +
        6 * auto_freight1 +
        6 * auto_freight2 +
        6 * auto_freight3
    end

    def calc_teleop
      1 * teleop_storage_freight +
        2 * teleop_freight1 +
        4 * teleop_freight2 +
        6 * teleop_freight3 +
        4 * shared_freight
    end

    def calc_endgame
      6 * end_delivered +
        (alliance_balanced ? 10 : 0) +
        (shared_unbalanced ? 20 : 0) +
        END_PARKED_POINTS[end_parked1] +
        END_PARKED_POINTS[end_parked2] +
        15 * capped
    end

    def calc_penalty
      30 * major_penalties +
        10 * minor_penalties
    end
  end
end
