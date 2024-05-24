import ScoreTable from './ScoreTable.js';

export default ScoreTable((match) => {
  const red_det = match.red_score_details;
  const blue_det = match.blue_score_details;
  return [
    {
      desc: 'Robot 1 Parking',
      red: red_det.auto_navigated1 === 'NONE' ? '-' : (red_det.auto_navigated1 === 'SIGNAL_ZONE' ? (red_det.init_signal_sleeve1 ? 'Signal Zone (TSE)' : 'Signal Zone') : 'Terminal/Substation'),
      blue: blue_det.auto_navigated1 === 'NONE' ? '-' : (blue_det.auto_navigated1 === 'SIGNAL_ZONE' ? (blue_det.init_signal_sleeve1 ? 'Signal Zone (TSE)' : 'Signal Zone') : 'Terminal/Substation'),
      red_pts: red_det.auto_navigated1 === 'NONE' ? 0 : (red_det.auto_navigated1 === 'SIGNAL_ZONE' ? (red_det.init_signal_sleeve1 ? 20 : 10) : 2),
      blue_pts: blue_det.auto_navigated1 === 'NONE' ? 0 : (blue_det.auto_navigated1 === 'SIGNAL_ZONE' ? (blue_det.init_signal_sleeve1 ? 20 : 10) : 2),
    },
    {
      desc: 'Robot 2 Parking',
      red: red_det.auto_navigated2 === 'NONE' ? '-' : (red_det.auto_navigated2 === 'SIGNAL_ZONE' ? (red_det.init_signal_sleeve2 ? 'Signal Zone (TSE)' : 'Signal Zone') : 'Terminal/Substation'),
      blue: blue_det.auto_navigated2 === 'NONE' ? '-' : (blue_det.auto_navigated2 === 'SIGNAL_ZONE' ? (blue_det.init_signal_sleeve2 ? 'Signal Zone (TSE)' : 'Signal Zone') : 'Terminal/Substation'),
      red_pts: red_det.auto_navigated2 === 'NONE' ? 0 : (red_det.auto_navigated2 === 'SIGNAL_ZONE' ? (red_det.init_signal_sleeve2 ? 20 : 10) : 2),
      blue_pts: blue_det.auto_navigated2 === 'NONE' ? 0 : (blue_det.auto_navigated2 === 'SIGNAL_ZONE' ? (blue_det.init_signal_sleeve2 ? 20 : 10) : 2),
    },
    {
      desc: 'Auto High Junctions',
      red: red_det.auto_cone_counts.HIGH,
      blue: blue_det.auto_cone_counts.HIGH,
      value: 5
    },
    {
      desc: 'Auto Medium Junctions',
      red: red_det.auto_cone_counts.MEDIUM,
      blue: blue_det.auto_cone_counts.MEDIUM,
      value: 4
    },
    {
      desc: 'Auto Low Junctions',
      red: red_det.auto_cone_counts.LOW,
      blue: blue_det.auto_cone_counts.LOW,
      value: 3
    },
    {
      desc: 'Auto Ground Junctions',
      red: red_det.auto_cone_counts.GROUND,
      blue: blue_det.auto_cone_counts.GROUND,
      value: 2
    },
    {
      desc: 'Auto Terminal',
      red: red_det.auto_terminal,
      blue: blue_det.auto_terminal,
      value: 1
    },
    {
      desc: 'Auto Total',
      red: match.red_score.auto,
      blue: match.blue_score.auto,
      key: true
    },
    {
      desc: 'Driver-controlled High Junctions',
      red: red_det.teleop_cone_counts.HIGH,
      blue: blue_det.teleop_cone_counts.HIGH,
      value: 5
    },
    {
      desc: 'Driver-controlled Medium Junctions',
      red: red_det.teleop_cone_counts.MEDIUM,
      blue: blue_det.teleop_cone_counts.MEDIUM,
      value: 4
    },
    {
      desc: 'Driver-controlled Low Junctions',
      red: red_det.teleop_cone_counts.LOW,
      blue: blue_det.teleop_cone_counts.LOW,
      value: 3
    },
    {
      desc: 'Driver-controlled Ground Junctions',
      red: red_det.teleop_cone_counts.GROUND,
      blue: blue_det.teleop_cone_counts.GROUND,
      value: 2
    },
    {
      desc: 'Driver-controlled Terminals',
      red: red_det.teleop_terminal_near + red_det.teleop_terminal_far,
      blue: blue_det.teleop_terminal_near + blue_det.teleop_terminal_far,
      value: 1
    },
    {
      desc: 'Driver-controlled Total',
      red: match.red_score.teleop,
      blue: match.blue_score.teleop,
      key: true
    },
    {
      desc: 'Robot 1 Parking',
      red: red_det.teleop_navigated1 ? 'Parked' : '-',
      blue: blue_det.teleop_navigated1 ? 'Parked' : '-',
      red_pts: red_det.teleop_navigated1 ? 2 : 0,
      blue_pts: blue_det.teleop_navigated1 ? 2 : 0,
    },
    {
      desc: 'Robot 2 Parking',
      red: red_det.teleop_navigated2 ? 'Parked' : '-',
      blue: blue_det.teleop_navigated2 ? 'Parked' : '-',
      red_pts: red_det.teleop_navigated2 ? 2 : 0,
      blue_pts: blue_det.teleop_navigated2 ? 2 : 0,
    },
    {
      desc: 'Ownership (with cone)',
      red: red_det.cone_owned_junctions,
      blue: blue_det.cone_owned_junctions,
      value: 3
    },
    {
      desc: 'Ownership (with beacon)',
      red: red_det.beacon_owned_junctions,
      blue: blue_det.beacon_owned_junctions,
      value: 10
    },
    {
      desc: 'Circuit',
      red: red_det.has_circuit ? 'Completed' : '-',
      blue: blue_det.has_circuit ? 'Completed' : '-',
      red_pts: red_det.has_circuit ? 20 : 0,
      blue_pts: blue_det.has_circuit ? 20 : 0,
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
      value: 30,
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
