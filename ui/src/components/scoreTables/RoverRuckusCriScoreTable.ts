import ScoreTable from './ScoreTable.js';
import type {components} from "../../api/v1";

export default ScoreTable<components['schemas']['RoverRuckusCriScore']>((match) => {
  const red_det = match.red_score_details;
  const blue_det = match.blue_score_details;

  return [
    {
      desc: 'Robots Landed',
      red: red_det.robots_landed,
      blue: blue_det.robots_landed,
      value: 30
    },
    {
      desc: 'Depots Claimed\nBonus for claiming all',
      red: red_det.depots_claimed,
      blue: blue_det.depots_claimed,
      value: 15,
      bonus: {
        value: 10,
        redAccomplished: red_det.depots_claimed >= 2,
        blueAccomplished: blue_det.depots_claimed >= 2,
        label: 'Bonus'
      }
    },
    {
      desc: 'Mineral Fields Sampled',
      red: red_det.fields_sampled,
      blue: blue_det.fields_sampled,
      value: 25
    },
    {
      desc: 'Robots Parked',
      red: red_det.robots_parked_auto,
      blue: blue_det.robots_parked_auto,
      value: 10
    },
    {
      desc: 'Auto Total',
      red: match.red_score.auto,
      blue: match.blue_score.auto,
      key: true
    },
    {
      desc: 'Minerals in Depot',
      red: red_det.depot_minerals,
      blue: blue_det.depot_minerals,
      value: 2
    },
    {
      desc: 'Platinum in Depot',
      red: red_det.depot_platinum_minerals,
      blue: blue_det.depot_platinum_minerals,
      value: 5
    },
    {
      desc: 'Gold in Gold Cargo Hold',
      red: red_det.gold_cargo,
      blue: blue_det.gold_cargo,
      value: 5
    },
    {
      desc: 'Silver in Silver Cargo Hold',
      red: red_det.silver_cargo,
      blue: blue_det.silver_cargo,
      value: 5
    },
    {
      desc: 'Cargo in "Any" Cargo Hold',
      red: red_det.any_cargo,
      blue: blue_det.any_cargo,
      value: 10
    },
    {
      desc: 'Platinum in All Cargo Holds',
      red: red_det.platinum_cargo,
      blue: blue_det.platinum_cargo,
      value: 20
    },
    {
      desc: 'Teleop Total',
      red: match.red_score.teleop,
      blue: match.blue_score.teleop,
      key: true
    },
    {
      desc: 'Robots Latched',
      red: red_det.latched_robots,
      blue: blue_det.latched_robots,
      value: 50
    },
    {
      desc: 'Robots Latched ("Any" Lander)',
      red: red_det.any_latched_robots,
      blue: blue_det.any_latched_robots,
      value: 75
    },
    {
      desc: 'Parked Robots (in Crater)',
      red: red_det.robots_in_crater,
      blue: blue_det.robots_in_crater,
      value: 15
    },
    {
      desc: 'Parked Robots (Completely in Crater)',
      red: red_det.robots_completely_in_crater,
      blue: blue_det.robots_completely_in_crater,
      value: 25
    },
    {
      desc: 'Endgame Total',
      red: match.red_score.endgame,
      blue: match.blue_score.endgame,
      key: true
    },
    {
      desc: 'Minor Penalties',
      red: blue_det.minor_penalties,
      blue: red_det.minor_penalties,
      value: 10,
      penalty: true
    },
    {
      desc: 'Major Penalties',
      red: blue_det.major_penalties,
      blue: red_det.major_penalties,
      value: 40,
      penalty: true
    },
    {
      desc: 'Total Score',
      red: match.red_score_total,
      blue: match.blue_score_total,
      key: true
    }
  ];
});