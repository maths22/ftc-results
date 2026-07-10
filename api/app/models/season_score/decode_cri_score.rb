module SeasonScore
  class DecodeCriScore < ApplicationRecord
    has_one :score, -> {includes(:red_match, :blue_match)}, as: :season_score

    def calc_auto
      (auto_robot1 ? 3 : 0) +
        (auto_robot2 ? 3 : 0) +
        (auto_robot3 ? 3 : 0) +
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
      full_count = [teleop_robot1, teleop_robot2, teleop_robot3].count { |x| x == 'FULL' }

      TELEOP_ROBOT_VALUES[teleop_robot1] +
        TELEOP_ROBOT_VALUES[teleop_robot2] +
        TELEOP_ROBOT_VALUES[teleop_robot3] +
        (full_count >= 2 ? 10 : 0) +
        teleop_classified_artifacts * 3 +
        teleop_overflow_artifacts * 1 +
        teleop_depot_artifacts * 1 +
        score_pattern(teleop_classifier_state) +
        score_prism(prism_state)
    end

    def calc_endgame
      0
    end

    def calc_penalty
      15 * major_penalties +
        5 * minor_penalties
    end

    def update_from_fms_score!(fms, other_fms)
      update!({
                auto_classified_artifacts: fms["autoClassifiedArtifacts"],
                auto_overflow_artifacts: fms["autoOverflowArtifacts"],
                auto_classifier_state: fms["autoClassifierState"],
                auto_robot1: fms["robot1Auto"],
                auto_robot2: fms["robot2Auto"],
                auto_robot3: fms["robot3Auto"],

                teleop_classified_artifacts: fms["teleopClassifiedArtifacts"],
                teleop_overflow_artifacts: fms["teleopOverflowArtifacts"],
                teleop_depot_artifacts: fms["teleopDepotArtifacts"],
                teleop_classifier_state: fms["teleopClassifierState"],
                prism_state: fms["prismState"],
                teleop_robot1: fms["robot1Teleop"],
                teleop_robot2: fms["robot2Teleop"],
                teleop_robot3: fms["robot3Teleop"],

                minor_penalties: fms["minorFouls"],
                major_penalties: fms["majorFouls"],

                movement_rp: fms["movementRP"],
                goal_rp: fms["goalRP"],
                pattern_rp: fms["patternRP"],
              })
    end

    private

    MOTIFS = {
      1 => %w[GREEN PURPLE PURPLE],
      2 => %w[PURPLE GREEN PURPLE],
      3 => %w[PURPLE PURPLE GREEN]
    }

    SPECTRUM_NEXT = {
      'RED' => 'ORANGE',
      'ORANGE' => 'YELLOW',
      'YELLOW' => 'GREEN',
      'GREEN' => 'BLUE',
      'BLUE' => 'PURPLE',
      'PURPLE' => 'RED',
    }.freeze

    SPECTRUM_PREVIOUS = SPECTRUM_NEXT.invert.freeze

    def score_pattern(state)
      motif = MOTIFS[score.match.random] || %w[NEVER NEVER NEVER]
      state.map.with_index { |val, i| (val == motif[i % motif.size]) ? 2 : 0 }.sum
    end

    def spectrum_next?(current, other)
      SPECTRUM_NEXT[current] == other
    end

    def spectrum_previous?(current, other)
      SPECTRUM_PREVIOUS[current] == other
    end

    def find_spectra(prism_state)
      remaining_artifacts = [Array(prism_state).reject { |artifact| artifact == 'NONE' }]
      spectra = []

      6.downto(2) do |length|
        index = 0
        while index < remaining_artifacts.length
          artifacts = remaining_artifacts[index]
          if artifacts.length < length
            index += 1
            next
          end

          found = false
          (0..(artifacts.length - length)).each do |start_index|
            first = artifacts[start_index]
            second = artifacts[start_index + 1]
            increasing = spectrum_next?(first, second)
            sequence = increasing || spectrum_previous?(first, second)
            next unless sequence

            last = second
            (start_index + 2...start_index + length).each do |artifact_index|
              current = artifacts[artifact_index]
              if increasing ? !spectrum_next?(last, current) : !spectrum_previous?(last, current)
                sequence = false
                break
              end

              last = current
            end

            next unless sequence

            remaining_artifacts.delete_at(index)
            remaining_artifacts << artifacts.slice(0, start_index) if start_index.positive?
            spectra << artifacts.slice(start_index, length)
            remaining_artifacts << artifacts.slice(start_index + length, artifacts.length - start_index - length) if start_index + length < artifacts.length
            found = true
            break
          end

          index += 1 unless found
        end
      end

      spectra
    end

    def score_prism(prism_state)
      spectra = find_spectra(prism_state)
      hue_points = Array(prism_state).reject { |artifact| artifact == 'NONE' }.uniq.length * 3

      hue_points + spectra.sum { |spectrum| 2**spectrum.length }
    end
  end
end
