module SeasonScore
  class CenterstageCriScore < ApplicationRecord
    has_one :score, -> {includes(:red_match, :blue_match)}, as: :season_score

    def calc_auto
      (robot1_auto ? 5 : 0) +
        (robot2_auto ? 5 : 0) +
        (robot3_auto ? 5 : 0) +
        auto_backstage * 3 +
        (auto_own_backdrop + auto_shared_backdrop) * 5 +
        (auto_own_mosaics + auto_shared_mosaics) * 10 +
        (auto_own_max_set_line + auto_shared_max_set_line) * 10 +
        (spike_mark_pixel1 ? 10 : 0) * (init_team_prop1 ? 2 : 1) +
        (spike_mark_pixel2 ? 10 : 0) * (init_team_prop2 ? 2 : 1) +
        (spike_mark_pixel3 ? 10 : 0) * (init_team_prop3 ? 2 : 1) +
        (target_backdrop_pixel1 ? 10 : 0) * (init_team_prop1 ? 2 : 1) +
        (target_backdrop_pixel2 ? 10 : 0) * (init_team_prop2 ? 2 : 1) +
        (target_backdrop_pixel3 ? 10 : 0) * (init_team_prop3 ? 2 : 1)
    end

    def calc_teleop
      1 * teleop_backstage +
        3 * (teleop_own_backdrop + teleop_shared_backdrop) +
        10 * (teleop_own_mosaics + teleop_shared_mosaics) +
        10 * (teleop_own_max_set_line + teleop_shared_max_set_line)
    end

    def calc_endgame
      (teleop_robot1 == 'RIGGING' ? 20 : 0) +
        (teleop_robot2 == 'RIGGING' ? 20 : 0) +
        (teleop_robot3 == 'RIGGING' ? 20 : 0) +
        (teleop_robot1 == 'BACKSTAGE' ? 10 : 0) +
        (teleop_robot2 == 'BACKSTAGE' ? 10 : 0) +
        (teleop_robot3 == 'BACKSTAGE' ? 10 : 0) +
        (drone1 == 0 ? 0 : (5 - drone1) * 10) +
        (drone2 == 0 ? 0 : (5 - drone2) * 10) +
        (drone3 == 0 ? 0 : (5 - drone3) * 10)
    end

    def calc_penalty
      30 * major_penalties +
        10 * minor_penalties
    end

    def collage?
      alliance_pixels >= 2 && other_alliance_pixels >= 2
    end

    def mural?
      (teleop_own_mosaics + teleop_shared_mosaics) >= (collage? ? 3 : 5)
    end

    def finale?
      calc_endgame >= 120
    end

    def update_from_fms_score!(fms, other_fms)
      update!({
                init_team_prop1: fms["InitTeamProp1"],
                init_team_prop2: fms["InitTeamProp2"],
                init_team_prop3: fms["InitTeamProp3"],
                robot1_auto: fms["Robot1Auto"],
                robot2_auto: fms["Robot2Auto"],
                robot3_auto: fms["Robot3Auto"],
                spike_mark_pixel1: fms["SpikeMarkPixel1"],
                spike_mark_pixel2: fms["SpikeMarkPixel2"],
                spike_mark_pixel3: fms["SpikeMarkPixel3"],
                target_backdrop_pixel1: fms["TargetBackdropPixel1"],
                target_backdrop_pixel2: fms["TargetBackdropPixel2"],
                target_backdrop_pixel3: fms["TargetBackdropPixel3"],
                auto_backstage: fms["AutoBackstage"],
                auto_own_backdrop: fms["AutoOwnBackdrop"],
                auto_own_mosaics: fms["AutoOwnMosaics"],
                auto_own_max_set_line: fms["AutoOwnMaxSetLine"],
                auto_shared_backdrop: fms["AutoSharedBackdrop"],
                auto_shared_mosaics: fms["AutoSharedMosaics"],
                auto_shared_max_set_line: fms["AutoSharedMaxSetLine"],

                teleop_backstage: fms["DcBackstage"],
                teleop_own_backdrop: fms["DcOwnBackdrop"],
                teleop_own_mosaics: fms["DcOwnMosaics"],
                teleop_own_max_set_line: fms["DcOwnMaxSetLine"],
                teleop_shared_backdrop: fms["DcSharedBackdrop"],
                teleop_shared_mosaics: fms["DcSharedMosaics"],
                teleop_shared_max_set_line: fms["DcSharedMaxSetLine"],
                alliance_pixels: fms["AlliancePixels"],
                other_alliance_pixels: fms["OtherAlliancePixels"],

                teleop_robot1: fms["EgRobot1"],
                teleop_robot2: fms["EgRobot2"],
                teleop_robot3: fms["EgRobot3"],
                drone1: fms["Drone1"],
                drone2: fms["Drone2"],
                drone3: fms["Drone3"],
                major_penalties: fms["MajorPenalties"],
                minor_penalties: fms["MinorPenalties"]
              })
    end
  end
end
