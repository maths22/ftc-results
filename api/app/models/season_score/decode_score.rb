module SeasonScore
  class DecodeScore < ApplicationRecord
    has_one :score, -> {includes(:red_match, :blue_match)}, as: :season_score

    def calc_auto
      (auto_robot1 ? 3 : 0) +
        (auto_robot2 ? 3 : 0) +
        auto_classified_artifacts * 3 +
        auto_overflow_artifacts * 1 +
        score_pattern(auto_classifier_state)
    end

    TELEOP_ROBOT_VALUES = {
      'NONE' => 0,
      'PARTIAL' => 5,
      'FULL' => 10,
    }

    def calc_teleop
      TELEOP_ROBOT_VALUES[teleop_robot1] +
        TELEOP_ROBOT_VALUES[teleop_robot2] +
        (teleop_robot1 == 'FULL' && teleop_robot2 == 'FULL' ? 10 : 0) +
        teleop_classified_artifacts * 3 +
        teleop_overflow_artifacts * 1 +
        teleop_depot_artifacts * 1 +
        score_pattern(teleop_classifier_state)
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
    end

    private
    MOTIFS = {
      1 => %w[GREEN PURPLE PURPLE],
      2 => %w[PURPLE GREEN PURPLE],
      3 => %w[PURPLE PURPLE GREEN]
    }

    def score_pattern(state)
      motif = MOTIFS[score.match.random] || %w[NEVER NEVER NEVER]
      state.map.with_index { |val, i| (val == motif[i % motif.size]) ? 2 : 0 }.sum
    end
  end
end
