import ScoreTable from './ScoreTable';

function toTitleCase(str) {
  return str.replaceAll('_', ' ').replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    }
  );
}

const autoNavigatedPoints = {
  NONE: 0,
  IN_WAREHOUSE: 5,
  COMPLETELY_IN_WAREHOUSE: 10
};

const endParkedPoints = {
  NONE: 0,
  IN_WAREHOUSE: 3,
  COMPLETELY_IN_WAREHOUSE: 6
};

export default ScoreTable((match) => {
  const red_det = match.red_score_details;
  const blue_det = match.blue_score_details;
  return [
    {
      desc: 'Carousel Duck Delivered',
      red: red_det.carousel ? 'Delivered' : '-',
      blue: blue_det.carousel ? 'Delivered' : '-',
      red_pts: red_det.carousel ? 10 : 0,
      blue_pts: blue_det.carousel ? 10 : 0,
    },
    {
      desc: 'Robot 1 Navigated',
      red: toTitleCase(red_det.auto_navigated1),
      blue: toTitleCase(blue_det.auto_navigated1),
      red_pts: autoNavigatedPoints[red_det.auto_navigated1],
      blue_pts: autoNavigatedPoints[blue_det.auto_navigated1],
    },
    {
      desc: 'Robot 2 Navigated',
      red: toTitleCase(red_det.auto_navigated2),
      blue: toTitleCase(blue_det.auto_navigated2),
      red_pts: autoNavigatedPoints[red_det.auto_navigated2],
      blue_pts: autoNavigatedPoints[blue_det.auto_navigated2],
    },
    {
      desc: 'Robot 3 Navigated',
      red: toTitleCase(red_det.auto_navigated3),
      blue: toTitleCase(blue_det.auto_navigated3),
      red_pts: autoNavigatedPoints[red_det.auto_navigated3],
      blue_pts: autoNavigatedPoints[blue_det.auto_navigated3],
    },
    {
      desc: 'Robot 1 Auto Bonus',
      red: red_det.auto_bonus1 ? toTitleCase(red_det.barcode_element1) : '-',
      blue: blue_det.auto_bonus1 ? toTitleCase(blue_det.barcode_element1) : '-',
      red_pts: red_det.auto_bonus1 ? (red_det.barcode_element1 === 'DUCK' ? 10 : 20) : 0,
      blue_pts: blue_det.auto_bonus1 ? (blue_det.barcode_element1 === 'DUCK' ? 10 : 20) : 0,
    },
    {
      desc: 'Robot 2 Auto Bonus',
      red: red_det.auto_bonus2 ? toTitleCase(red_det.barcode_element2) : '-',
      blue: blue_det.auto_bonus2 ? toTitleCase(blue_det.barcode_element2) : '-',
      red_pts: red_det.auto_bonus2 ? (red_det.barcode_element2 === 'DUCK' ? 10 : 20) : 0,
      blue_pts: blue_det.auto_bonus2 ? (blue_det.barcode_element2 === 'DUCK' ? 10 : 20) : 0,
    },
    {
      desc: 'Robot 3 Auto Bonus',
      red: red_det.auto_bonus3 ? toTitleCase(red_det.barcode_element3) : '-',
      blue: blue_det.auto_bonus3 ? toTitleCase(blue_det.barcode_element3) : '-',
      red_pts: red_det.auto_bonus3 ? (red_det.barcode_element3 === 'DUCK' ? 10 : 20) : 0,
      blue_pts: blue_det.auto_bonus3 ? (blue_det.barcode_element3 === 'DUCK' ? 10 : 20) : 0,
    },
    {
      desc: 'Auto Shipping Hub Freight',
      red: red_det.auto_freight1 + red_det.auto_freight2 + red_det.auto_freight3,
      blue: blue_det.auto_freight1 + blue_det.auto_freight2 + blue_det.auto_freight3,
      value: 6
    },
    {
      desc: 'Auto Coop Hub Freight',
      red: red_det.auto_coop_freight,
      blue: blue_det.auto_coop_freight,
      value: 6
    },
    {
      desc: 'Auto Total',
      red: match.red_score.auto,
      blue: match.blue_score.auto,
      key: true
    },
    {
      desc: 'Driver-controlled Shipping Hub Freight Level 1',
      red: red_det.teleop_freight1,
      blue: blue_det.teleop_freight1,
      value: 2
    },
    {
      desc: 'Driver-controlled Shipping Hub Freight Level 2',
      red: red_det.teleop_freight2,
      blue: blue_det.teleop_freight2,
      value: 4
    },
    {
      desc: 'Driver-controlled Shipping Hub Freight Level 3',
      red: red_det.teleop_freight3,
      blue: blue_det.teleop_freight3,
      value: 6
    },
    {
      desc: 'Shared Hub Freight',
      red: red_det.shared_freight,
      blue: blue_det.shared_freight,
      value: 4
    },
    {
      desc: 'Driver-controlled Coop Hub Freight',
      red: red_det.teleop_coop_freight,
      blue: blue_det.teleop_coop_freight,
      value: 4
    },
    {
      desc: 'Driver-controlled Total',
      red: match.red_score.teleop,
      blue: match.blue_score.teleop,
      key: true
    },
    {
      desc: 'Ducks/Team Shipping Elements Delivered',
      red: red_det.end_delivered,
      blue: blue_det.end_delivered,
      value: 6
    },
    {
      desc: 'Alliance Shipping Hub Balanced',
      red: red_det.alliance_balanced ? 'Balanced' : '-',
      blue: blue_det.alliance_balanced ? 'Balanced' : '-',
      red_pts: red_det.alliance_balanced ? 10 : 0,
      blue_pts: blue_det.alliance_balanced ? 10 : 0,
    },
    {
      desc: 'Shared Shipping Hub Unbalanced',
      red: red_det.shared_unbalanced ? 'Unbalanced' : '-',
      blue: blue_det.shared_unbalanced ? 'Unbalanced' : '-',
      red_pts: red_det.shared_unbalanced ? 20 : 0,
      blue_pts: blue_det.shared_unbalanced ? 20 : 0,
    },
    {
      desc: 'Coop Hub Bonus',
      red: red_det.coop_balanced ? 'Balanced' : '-',
      blue: blue_det.coop_balanced ? 'Balanced' : '-',
      red_pts: red_det.coop_balanced ? 4 * (red_det.teleop_coop_freight + red_det.teleop_other_coop_freight) : 0,
      blue_pts: blue_det.coop_balanced ? 4 * (blue_det.teleop_coop_freight + blue_det.teleop_other_coop_freight) : 0,
    },
    {
      desc: 'Robot 1 Parked',
      red: toTitleCase(red_det.end_parked1),
      blue: toTitleCase(blue_det.end_parked1),
      red_pts: endParkedPoints[red_det.end_parked1],
      blue_pts: endParkedPoints[blue_det.end_parked1],
    },
    {
      desc: 'Robot 2 Parked',
      red: toTitleCase(red_det.end_parked2),
      blue: toTitleCase(blue_det.end_parked2),
      red_pts: endParkedPoints[red_det.end_parked2],
      blue_pts: endParkedPoints[blue_det.end_parked2],
    },
    {
      desc: 'Robot 3 Parked',
      red: toTitleCase(red_det.end_parked3),
      blue: toTitleCase(blue_det.end_parked3),
      red_pts: endParkedPoints[red_det.end_parked3],
      blue_pts: endParkedPoints[blue_det.end_parked3],
    },
    {
      desc: 'Team Shipping Elements Capping',
      red: red_det.capped,
      blue: blue_det.capped,
      value: 15
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
      value: -10
    },
    {
      desc: 'Major Penalties',
      red: red_det.major_penalties,
      blue: blue_det.major_penalties,
      value: -30
    },
    {
      desc: 'Total Score',
      red: match.red_score_total,
      blue: match.blue_score_total,
      key: true
    }
  ];
});
