import ScoreTable from './ScoreTable';

export default ScoreTable((match) => {
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
      desc: 'Depots Claimed',
      red: red_det.depots_claimed,
      blue: blue_det.depots_claimed,
      value: 15
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
      red: red_det.minor_penalties,
      blue: blue_det.minor_penalties,
      value: 10,
      penalty: true
    },
    {
      desc: 'Major Penalties',
      red: red_det.major_penalties,
      blue: blue_det.major_penalties,
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