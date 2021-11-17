import ScoreTable from './ScoreTable';

export default ScoreTable((match) => {
  const red_det = match.red_score_details;
  const blue_det = match.blue_score_details;
  return [
    {
      desc: 'Skystones Delivered\n(of first two)',
      red: red_det.auto_skystones,
      blue: blue_det.auto_skystones,
      value: 10
    },
    {
      desc: 'Stones Delivered',
      red: red_det.auto_delivered,
      blue: blue_det.auto_delivered,
      value: 2
    },
    {
      desc: 'Foundation Repositioned',
      red: red_det.foundation_repositioned,
      blue: blue_det.foundation_repositioned,
      value: 10
    },
    {
      desc: 'Robots Navigated',
      red: red_det.robots_navigated,
      blue: blue_det.robots_navigated,
      value: 5
    },
    {
      desc: 'Stones Placed',
      red: red_det.auto_placed,
      blue: blue_det.auto_placed,
      value: 4
    },
    {
      desc: 'Auto Total',
      red: match.red_score.auto,
      blue: match.blue_score.auto,
      key: true
    },
    {
      desc: 'Stones Delivered',
      red: red_det.teleop_delivered,
      blue: blue_det.teleop_delivered,
      value: 1
    },
    {
      desc: 'Stones Placed',
      red: red_det.teleop_placed,
      blue: blue_det.teleop_placed,
      value: 1
    },
    {
      desc: 'Tallest Tower Bonus',
      red: red_det.tallest_height,
      blue: blue_det.tallest_height,
      value: 2
    },
    {
      desc: 'Teleop Total',
      red: match.red_score.teleop,
      blue: match.blue_score.teleop,
      key: true
    },
    // foundation_moved
    // robots_parked
    // capstone_1_level
    // capstone_2_level
    {
      desc: 'Capstone 1 Placement\nHeight Bonus',
      red: red_det.capstone_1_level < 0 ? 0 : red_det.capstone_1_level,
      blue: blue_det.capstone_1_level < 0 ? 0 : blue_det.capstone_1_level,
      value: 1,
      bonus: {
        first: true,
        label: 'Placed',
        value: 5,
        redAccomplished: red_det.capstone_1_level >= 0,
        blueAccomplished: blue_det.capstone_1_level >= 0,
      }
    },
    {
      desc: 'Capstone 2 Placement\nHeight Bonus',
      red: red_det.capstone_2_level < 0 ? 0 : red_det.capstone_2_level,
      blue: blue_det.capstone_2_level < 0 ? 0 : blue_det.capstone_2_level,
      value: 1,
      bonus: {
        first: true,
        label: 'Placed',
        value: 5,
        redAccomplished: red_det.capstone_2_level >= 0,
        blueAccomplished: blue_det.capstone_2_level >= 0,
      }
    },
    {
      desc: 'Foundation Moved Out\nOf Building Site',
      red: red_det.foundation_moved,
      blue: blue_det.foundation_moved,
      value: 15
    },
    {
      desc: 'Robots Parked',
      red: red_det.robots_parked,
      blue: blue_det.robots_parked,
      value: 5
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
      value: 5,
      penalty: true
    },
    {
      desc: 'Major Penalties',
      red: blue_det.major_penalties,
      blue: red_det.major_penalties,
      value: 20,
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