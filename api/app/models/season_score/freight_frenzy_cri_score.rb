module SeasonScore
  class FreightFrenzyCriScore < ApplicationRecord
    AUTO_NAVIGATED_POINTS = {
      'NONE' => 0,
      'IN_WAREHOUSE' => 5,
      'COMPLETELY_IN_WAREHOUSE' => 10
    }.freeze
    AUTO_NAVIGATED_OPTIONS = %w[NONE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE]

    END_PARKED_POINTS = {
      'NONE' => 0,
      'IN_WAREHOUSE' => 3,
      'COMPLETELY_IN_WAREHOUSE' => 6
    }.freeze
    END_PARKED_OPTIONS = %w[NONE IN_WAREHOUSE COMPLETELY_IN_WAREHOUSE]

    def self.penalty_direction
      :subtract
    end

    def calc_auto
      (carousel ? 10 : 0) +
        AUTO_NAVIGATED_POINTS[auto_navigated1] +
        AUTO_NAVIGATED_POINTS[auto_navigated2] +
        AUTO_NAVIGATED_POINTS[auto_navigated3] +
        (auto_bonus1 ? (barcode_element1 == 'TEAM_SHIPPING_ELEMENT' ? 20 : 10) : 0) +
        (auto_bonus2 ? (barcode_element2 == 'TEAM_SHIPPING_ELEMENT' ? 20 : 10) : 0) +
        (auto_bonus3 ? (barcode_element3 == 'TEAM_SHIPPING_ELEMENT' ? 20 : 10) : 0) +
        6 * auto_coop_freight +
        6 * auto_freight1 +
        6 * auto_freight2 +
        6 * auto_freight3
    end

    def calc_teleop
      4 * teleop_coop_freight +
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
        END_PARKED_POINTS[end_parked3] +
        15 * capped +
        (coop_balanced ? (4 * (teleop_coop_freight + teleop_other_coop_freight)) : 0)
    end

    def calc_penalty
      30 * major_penalties +
        10 * minor_penalties
    end

    def update_from_fms_score!(fms, other_fms)
      update!({
                barcode_element1: fms["InitTSE1"] ? 'TEAM_SHIPPING_ELEMENT' : 'DUCK',
                barcode_element2: fms["InitTSE2"] ? 'TEAM_SHIPPING_ELEMENT' : 'DUCK',
                barcode_element3: fms["InitTSE3"] ? 'TEAM_SHIPPING_ELEMENT' : 'DUCK',
                carousel: fms["Carousel"],
                auto_navigated1: AUTO_NAVIGATED_OPTIONS[fms["Navigated1"]],
                auto_navigated2: AUTO_NAVIGATED_OPTIONS[fms["Navigated2"]],
                auto_navigated3: AUTO_NAVIGATED_OPTIONS[fms["Navigated3"]],
                auto_bonus1: fms["Preload1"].positive?,
                auto_bonus2: fms["Preload2"].positive?,
                auto_bonus3: fms["Preload3"].positive?,
                auto_freight1: fms["AutoFreight1"],
                auto_freight2: fms["AutoFreight2"],
                auto_freight3: fms["AutoFreight3"],
                auto_coop_freight: fms["AutoCoopFreight"],
                teleop_freight1: fms["DcFreight1"],
                teleop_freight2: fms["DcFreight2"],
                teleop_freight3: fms["DcFreight3"],
                shared_freight: fms["SharedFreight"],
                teleop_coop_freight: fms["DcCoopFreight"],
                teleop_other_coop_freight: other_fms["DcCoopFreight"],
                end_delivered: fms["EgDelivered"],
                alliance_balanced: fms["Balanced"],
                shared_unbalanced: fms["SharedTipped"],
                coop_balanced: fms["CoopBalanced"],
                end_parked1: END_PARKED_OPTIONS[fms["Parked1"]],
                end_parked2: END_PARKED_OPTIONS[fms["Parked2"]],
                end_parked3: END_PARKED_OPTIONS[fms["Parked3"]],
                capped: fms["Capped"],
                major_penalties: fms["MajorPenalties"],
                minor_penalties: fms["MinorPenalties"]
              })
    end
  end
end
