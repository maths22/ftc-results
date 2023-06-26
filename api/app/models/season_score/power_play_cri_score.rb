module SeasonScore
  class PowerPlayCriScore < ApplicationRecord
    has_one :score, -> {includes(:red_match, :blue_match)}, as: :season_score

    JUNCTION_MAP = [
      [:GROUND ,:LOW    ,:GROUND ,nil     ,:GROUND ,:LOW    ,:GROUND],
      [:LOW    ,:MEDIUM ,:HIGH   ,:MEDIUM ,:HIGH   ,:MEDIUM ,:LOW   ],
      [:GROUND ,:LOW    ,:MEDIUM ,:HIGH   ,:MEDIUM ,:LOW    ,:GROUND],
      [nil     ,:GROUND ,:HIGH   ,:LOW    ,:HIGH   ,:GROUND ,nil    ],
      [:GROUND ,:LOW    ,:MEDIUM ,:HIGH   ,:MEDIUM ,:LOW    ,:GROUND],
      [:LOW    ,:MEDIUM ,:HIGH   ,:MEDIUM ,:HIGH   ,:MEDIUM ,:LOW   ],
      [:GROUND ,:LOW    ,:GROUND ,nil     ,:GROUND ,:LOW    ,:GROUND],
    ]

    def self.penalty_direction
      :add
    end

    def calc_auto
      (auto_navigated1 == 'SUBSTATION_TERMINAL' ? 2 : 0) +
        (auto_navigated2 == 'SUBSTATION_TERMINAL' ? 2 : 0) +
        (auto_navigated3 == 'SUBSTATION_TERMINAL' ? 2 : 0) +
        (auto_navigated1 == 'SIGNAL_ZONE' ? (init_signal_sleeve1 ? 20 : 10) : 0) +
        (auto_navigated2 == 'SIGNAL_ZONE' ? (init_signal_sleeve2 ? 20 : 10) : 0) +
        (auto_navigated3 == 'SIGNAL_ZONE' ? (init_signal_sleeve3 ? 20 : 10) : 0) +
        1 * auto_terminal +
        2 * count_junction_cones(auto_junctions, :GROUND) +
        3 * count_junction_cones(auto_junctions, :LOW) +
        4 * count_junction_cones(auto_junctions, :MEDIUM) +
        5 * count_junction_cones(auto_junctions, :HIGH) +
        3 * auto_transformed_cones
    end

    def calc_teleop
      1 * (teleop_terminal_near + teleop_terminal_far) +
        2 * count_junction_cones(teleop_junctions, :GROUND) +
        3 * count_junction_cones(teleop_junctions, :LOW) +
        4 * count_junction_cones(teleop_junctions, :MEDIUM) +
        5 * count_junction_cones(teleop_junctions, :HIGH) +
        3 * teleop_transformed_cones
    end

    def calc_endgame
      (teleop_navigated1 ? 5 : 0) +
        (teleop_navigated2 ? 5 : 0) +
        (teleop_navigated3 ? 5 : 0) +
        3 * cone_owned_junctions +
        10 * beacon_owned_junctions +
        (has_circuit? ? 40 : 0)
    end

    def calc_penalty
      30 * major_penalties +
        10 * minor_penalties
    end

    def auto_cone_counts
      [:GROUND, :LOW, :MEDIUM, :HIGH]
        .map { |height| [height, count_junction_cones(auto_junctions, height)]}.to_h
    end

    def teleop_cone_counts
      [:GROUND, :LOW, :MEDIUM, :HIGH]
        .map { |height| [height, count_junction_cones(teleop_junctions, height)]}.to_h
    end

    def has_circuit?
      return false if teleop_terminal_near.zero? || teleop_terminal_far.zero?

      height = 7
      width = 7
      starts = if score.alliance_color == :red
                 [[0,0],[0,1],[1,0]]
               else
                 [[height - 1,0],[height - 1,1],[height - 2,0]]
               end
      ends = if score.alliance_color == :red
               [[height - 1,width - 1],[height - 1,width - 2],[height - 2,width - 1]]
             else
               [[0,width - 1],[0,width - 2],[1,width - 1]]
             end
      owned = teleop_junctions.map do |row|
        row.map do |el|
          el.last&.start_with?("MY_") || el.last == 'TRANSFORMER'
        end
      end

      starts.each do |start|
        visited = Array.new(height) { Array.new(width, false) }
        return true if circuit_check(owned, ends, visited, start)
      end
      false
    end

    def cone_owned_junctions
      teleop_junctions.sum do |row|
        row.count do |el|
          el.last&.start_with?("MY_") && !el.last&.end_with?("_BEACON")
        end
      end
    end

    def beacon_owned_junctions
      teleop_junctions.sum do |row|
        row.count do |el|
          el.last&.start_with?("MY_") && el.last&.end_with?("_BEACON")
        end
      end
    end

    def update_from_fms_score!(fms, other_fms)
      update!({
                init_signal_sleeve1: fms["InitSignalSleeve1"],
                init_signal_sleeve2: fms["InitSignalSleeve2"],
                init_signal_sleeve3: fms["InitSignalSleeve3"],
                auto_navigated1: fms["Robot1Auto"],
                auto_navigated2: fms["Robot2Auto"],
                auto_navigated3: fms["Robot3Auto"],
                auto_terminal: fms["AutoTerminal"],
                auto_junctions: fms["AutoJunctions"],
                teleop_junctions: fms["DcJunctions"],
                teleop_terminal_near: fms["DcTerminalNear"],
                teleop_terminal_far: fms["DcTerminalFar"],
                teleop_navigated1: fms["EgNavigated1"],
                teleop_navigated2: fms["EgNavigated2"],
                teleop_navigated3: fms["EgNavigated3"],
                major_penalties: fms["MajorPenalties"],
                minor_penalties: fms["MinorPenalties"]
              })
    end

    def auto_transformed_cones
      count_transformed_cones(auto_junctions)
    end

    def teleop_transformed_cones
      count_transformed_cones(teleop_junctions)
    end

    private

    def count_junction_cones(map, height)
      ret = 0
      JUNCTION_MAP.each_with_index do |row, i|
        row.each_with_index do |entry, j|
          next unless entry == height
          next unless map.dig(i, j)

          ret += map[i][j].count { |el| el == 'MY_CONE' }
        end
      end
      ret
    end

    def count_transformed_cones(map)
      map.sum do |row|
        row.sum do |el|
          el.last == 'TRANSFORMER' ? el.count { |e| e == 'MY_CONE' } : 0
        end
      end
    end

    def circuit_check(owned, ends, visited, coords)
      return false if coords[0] < 0 || coords[1] < 0 || coords[0] >= owned.length || coords[1] >= owned[1].length
      return false if visited[coords[0]][coords[1]] || !owned[coords[0]][coords[1]]

      visited[coords[0]][coords[1]] = true
      return true if ends.include?(coords)

      (-1..1).each do |dx|
        (-1..1).each do |dy|
          return true if circuit_check(owned, ends, visited, [coords[0] + dx, coords[1] + dy])
        end
      end

      false
    end
  end
end
