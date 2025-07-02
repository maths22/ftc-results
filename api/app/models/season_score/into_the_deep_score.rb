module SeasonScore
  class IntoTheDeepScore < ApplicationRecord
    has_one :score, -> {includes(:red_match, :blue_match)}, as: :season_score

    AUTO_ROBOT_VALUES = {
      'NONE' => 0,
      'OBSERVATION_ZONE' => 3,
      'ASCENT' => 3
    }

    def calc_auto
      AUTO_ROBOT_VALUES[auto_robot1] +
        AUTO_ROBOT_VALUES[auto_robot2] +
        auto_sample_net * 2 +
        auto_sample_low * 4 +
        auto_sample_high * 8 +
        auto_specimen_low * 6 +
        auto_specimen_high * 10
    end

    TELEOP_ROBOT_VALUES = {
      'NONE' => 0,
      'OBSERVATION_ZONE' => 3,
      'ASCENT_1' => 3,
      'ASCENT_2' => 15,
      'ASCENT_3' => 30,
    }

    def calc_teleop
      TELEOP_ROBOT_VALUES[teleop_robot1] +
        TELEOP_ROBOT_VALUES[teleop_robot2] +
        teleop_sample_net * 2 +
        teleop_sample_low * 4 +
        teleop_sample_high * 8 +
        teleop_specimen_low * 6 +
        teleop_specimen_high * 10
    end

    def calc_endgame
      0
    end

    def calc_penalty
      15 * major_penalties +
        5 * minor_penalties
    end

    def update_from_fms_score!(fms, other_fms)
      puts fms.to_json
      throw 'bad!!'
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
