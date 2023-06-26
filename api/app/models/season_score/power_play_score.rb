module SeasonScore
  class PowerPlayScore < ApplicationRecord
    has_one :score, -> {includes(:red_match, :blue_match)}, as: :season_score

    JUNCTION_MAP = [
      [:GROUND ,:LOW    ,:GROUND ,:LOW    ,:GROUND],
      [:LOW    ,:MEDIUM ,:HIGH   ,:MEDIUM ,:LOW   ],
      [:GROUND ,:HIGH   ,:GROUND ,:HIGH   ,:GROUND],
      [:LOW    ,:MEDIUM ,:HIGH   ,:MEDIUM ,:LOW   ],
      [:GROUND ,:LOW    ,:GROUND ,:LOW    ,:GROUND],
    ]

    def self.penalty_direction
      :add
    end

    def calc_auto
      (auto_navigated1 == 'SUBSTATION_TERMINAL' ? 2 : 0) +
        (auto_navigated2 == 'SUBSTATION_TERMINAL' ? 2 : 0) +
        (auto_navigated1 == 'SIGNAL_ZONE' ? (init_signal_sleeve1 ? 20 : 10) : 0) +
        (auto_navigated2 == 'SIGNAL_ZONE' ? (init_signal_sleeve2 ? 20 : 10) : 0) +
        1 * auto_terminal +
        2 * count_junction_cones(auto_junctions, :GROUND) +
        3 * count_junction_cones(auto_junctions, :LOW) +
        4 * count_junction_cones(auto_junctions, :MEDIUM) +
        5 * count_junction_cones(auto_junctions, :HIGH)
    end

    def calc_teleop
      1 * (teleop_terminal_near + teleop_terminal_far) +
        2 * count_junction_cones(teleop_junctions, :GROUND) +
        3 * count_junction_cones(teleop_junctions, :LOW) +
        4 * count_junction_cones(teleop_junctions, :MEDIUM) +
        5 * count_junction_cones(teleop_junctions, :HIGH)
    end

    def calc_endgame
      (teleop_navigated1 ? 2 : 0) +
        (teleop_navigated2 ? 2 : 0) +
        3 * cone_owned_junctions +
        10 * beacon_owned_junctions +
        (has_circuit? ? 20 : 0)
       # TODO parking + circuit
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

      starts = if score.alliance_color == :red
                 [[0,0],[0,1],[1,0]]
               else
                 [[4,0],[4,1],[3,0]]
               end
      ends = if score.alliance_color == :red
               [[4,4],[4,3],[3,4]]
             else
               [[0,4],[0,3],[1,4]]
             end
      owned = teleop_junctions.map do |row|
        row.map do |el|
          el.last&.start_with?("MY_")
        end
      end

      starts.each do |start|
        visited = Array.new(5) { Array.new(5, false) }
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
