module SeasonScore
  class IntoTheDeepCriScore < ApplicationRecord
    has_one :score, -> {includes(:red_match, :blue_match)}, as: :season_score

    AUTO_ROBOT_VALUES = {
      'NONE' => 0,
      'OBSERVATION_ZONE' => 3,
      'ASCENT' => 3
    }

    def calc_auto
      AUTO_ROBOT_VALUES[auto_robot1] +
        AUTO_ROBOT_VALUES[auto_robot2] +
        AUTO_ROBOT_VALUES[auto_robot3] +
        (auto_sample_net_near + auto_sample_net_far) * 2 +
        (auto_sample_low_near + auto_sample_low_far) * 4 +
        (auto_sample_high_near + auto_sample_high_far) * 8 +
        (auto_specimen_low_1 + auto_specimen_low_2 + auto_specimen_low_3 + auto_specimen_low_4) * 6 +
        (auto_specimen_high_1 + auto_specimen_high_2 + auto_specimen_high_3 + auto_specimen_high_4) * 10 +
        auto_owned_chambers * 10
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
        TELEOP_ROBOT_VALUES[teleop_robot3] +
        (teleop_sample_net_near + teleop_sample_net_far) * 2 +
        (teleop_sample_low_near + teleop_sample_low_far) * 4 +
        (teleop_sample_high_near + teleop_sample_high_far) * 8 +
        (teleop_specimen_low_1 + teleop_specimen_low_2 + teleop_specimen_low_3 + teleop_specimen_low_4) * 6 +
        (teleop_specimen_high_1 + teleop_specimen_high_2 + teleop_specimen_high_3 + teleop_specimen_high_4) * 10 +
        teleop_owned_chambers * 20
    end

    def calc_endgame
      coop_achieved? ? 50 : 0
    end

    def calc_penalty
      15 * major_penalties +
        5 * minor_penalties
    end

    def update_from_fms_score!(fms, other_fms)
      update!({
               auto_robot1: fms["Robot1Auto"],
               auto_robot2: fms["Robot2Auto"],
               auto_robot3: fms["Robot3Auto"],
               auto_sample_net_near: fms["AutoSampleNetNear"],
               auto_sample_low_near: fms["AutoSampleLowNear"],
               auto_sample_high_near: fms["AutoSampleHighNear"],
               auto_sample_net_far: fms["AutoSampleNetFar"],
               auto_sample_low_far: fms["AutoSampleLowFar"],
               auto_sample_high_far: fms["AutoSampleHighFar"],
               auto_specimen_low_1: fms["AutoSpecimenLow1"],
               auto_specimen_high_1: fms["AutoSpecimenHigh1"],
               auto_specimen_low_2: fms["AutoSpecimenLow2"],
               auto_specimen_high_2: fms["AutoSpecimenHigh2"],
               auto_specimen_low_3: fms["AutoSpecimenLow3"],
               auto_specimen_high_3: fms["AutoSpecimenHigh3"],
               auto_specimen_low_4: fms["AutoSpecimenLow4"],
               auto_specimen_high_4: fms["AutoSpecimenHigh4"],
               auto_owned_chambers: fms["AutoOwnershipPoints"] / 10,
               teleop_sample_net_near: fms["TeleopSampleNetNear"],
               teleop_sample_low_near: fms["TeleopSampleLowNear"],
               teleop_sample_high_near: fms["TeleopSampleHighNear"],
               teleop_sample_net_far: fms["TeleopSampleNetFar"],
               teleop_sample_low_far: fms["TeleopSampleLowFar"],
               teleop_sample_high_far: fms["TeleopSampleHighFar"],
               teleop_specimen_low_1: fms["TeleopSpecimenLow1"],
               teleop_specimen_high_1: fms["TeleopSpecimenHigh1"],
               teleop_specimen_low_2: fms["TeleopSpecimenLow2"],
               teleop_specimen_high_2: fms["TeleopSpecimenHigh2"],
               teleop_specimen_low_3: fms["TeleopSpecimenLow3"],
               teleop_specimen_high_3: fms["TeleopSpecimenHigh3"],
               teleop_specimen_low_4: fms["TeleopSpecimenLow4"],
               teleop_specimen_high_4: fms["TeleopSpecimenHigh4"],
               teleop_robot1: fms["Robot1Teleop"],
               teleop_robot2: fms["Robot2Teleop"],
               teleop_robot3: fms["Robot3Teleop"],
               teleop_owned_chambers: fms["TeleopOwnershipPoints"] / 20,
               coop_achieved: fms["CoopBonusPoints"].positive?,

               minor_penalties: fms["MinorFouls"],
               major_penalties: fms["MajorFouls"],
      })
    end
  end
end
