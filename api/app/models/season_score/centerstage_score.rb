module SeasonScore
  class CenterstageScore < ApplicationRecord
    has_one :score, -> {includes(:red_match, :blue_match)}, as: :season_score

    def calc_auto
      (robot1_auto ? 5 : 0) +
        (robot2_auto ? 5 : 0) +
        auto_backdrop * 5 +
        auto_backstage * 3 +
        (spike_mark_pixel1 ? 10 : 0) * (init_team_prop1 ? 2 : 1) +
        (spike_mark_pixel2 ? 10 : 0) * (init_team_prop2 ? 2 : 1)+
        (target_backdrop_pixel1 ? 10 : 0) * (init_team_prop1 ? 2 : 1) +
        (target_backdrop_pixel2 ? 10 : 0) * (init_team_prop2 ? 2 : 1)
    end

    def calc_teleop
      1 * teleop_backstage +
        3 * teleop_backdrop +
        10 * mosaics +
        10 * max_set_line
    end

    def calc_endgame
      (teleop_robot1 == 'RIGGING' ? 20 : 0) +
        (teleop_robot2 == 'RIGGING' ? 20 : 0) +
        (teleop_robot1 == 'BACKSTAGE' ? 5 : 0) +
        (teleop_robot2 == 'BACKSTAGE' ? 5 : 0) +
        (drone1 == 0 ? 0 : (4 - drone1) * 10) +
        (drone2 == 0 ? 0 : (4 - drone2) * 10)
    end

    def calc_penalty
      30 * major_penalties +
        10 * minor_penalties
    end

    def update_from_fms_score!(fms, other_fms)
      puts fms.to_s
      update!({
                init_team_prop1: fms["InitTeamProp1"],
                init_team_prop2: fms["InitTeamProp2"],
                robot1_auto: fms["Robot1Auto"],
                robot2_auto: fms["Robot2Auto"],
                spike_mark_pixel1: fms["SpikeMarkPixel1"],
                spike_mark_pixel2: fms["SpikeMarkPixel2"],
                target_backdrop_pixel1: fms["TargetBackdropPixel1"],
                target_backdrop_pixel2: fms["TargetBackdropPixel2"],
                auto_backdrop: fms["AutoBackdrop"],
                auto_backstage: fms["AutoBackstage"],

                teleop_backdrop: fms["DcBackdrop"],
                teleop_backstage: fms["DcBackstage"],
                mosaics: fms["Mosaics"],
                max_set_line: fms["MaxSetLine"],

                teleop_robot1: fms["EgRobot1"],
                teleop_robot2: fms["EgRobot2"],
                drone1: fms["Drone1"],
                drone2: fms["Drone2"],
                major_penalties: fms["MajorPenalties"],
                minor_penalties: fms["MinorPenalties"]
              })
    end
  end
end
