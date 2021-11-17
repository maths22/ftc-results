import RemoteScoreTable from './RemoteScoreTable';

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
  IN_STORAGE: 3,
  COMPLETELY_IN_STORAGE: 6,
  IN_WAREHOUSE: 5,
  COMPLETELY_IN_WAREHOUSE: 10
};

const endParkedPoints = {
  NONE: 0,
  IN_WAREHOUSE: 3,
  COMPLETELY_IN_WAREHOUSE: 6
};

export default RemoteScoreTable((match) => {
  const det = match.score_details;
  return [
    {
      desc: 'Carousel Duck Delivered',
      scored: det.carousel ? 'Delivered' : '-',
      pts: det.carousel ? 10 : 0,
    },
    {
      desc: 'Robot Navigated',
      scored: toTitleCase(det.auto_navigated),
      pts: autoNavigatedPoints[det.auto_navigated],
    },
    {
      desc: 'Auto Bonus',
      scored: det.auto_bonus ? toTitleCase(det.barcode_element) : '-',
      pts: det.auto_bonus ? (det.barcode_element === 'DUCK' ? 10 : 20) : 0,
    },
    {
      desc: 'Auto Storage Freight',
      scored: det.auto_storage_freight,
      value: 2
    },
    {
      desc: 'Auto Shipping Hub Freight',
      scored: det.auto_freight1 + det.auto_freight2 + det.auto_freight3,
      value: 6
    },
    {
      desc: 'Auto Total',
      scored: match.score.auto,
      key: true
    },
    {
      desc: 'Driver-controlled Storage Freight',
      scored: det.teleop_storage_freight,
      value: 1
    },
    {
      desc: 'Driver-controlled Shipping Hub Freight Level 1',
      scored: det.teleop_freight1,
      value: 2
    },
    {
      desc: 'Driver-controlled Shipping Hub Freight Level 2',
      scored: det.teleop_freight2,
      value: 4
    },
    {
      desc: 'Driver-controlled Shipping Hub Freight Level 3',
      scored: det.teleop_freight3,
      value: 6
    },
    {
      desc: 'Driver-controlled Total',
      scored: match.score.teleop,
      key: true
    },
    {
      desc: 'Ducks/Team Shipping Elements Delivered',
      scored: det.end_delivered,
      value: 6
    },
    {
      desc: 'Alliance Shipping Hub Balanced',
      scored: det.alliance_balanced ? 'Balanced' : '-',
      pts: det.alliance_balanced ? 10 : 0,
    },
    {
      desc: 'Robot Parked',
      scored: toTitleCase(det.end_parked),
      pts: endParkedPoints[det.end_parked],
    },
    {
      desc: 'Team Shipping Elements Capping',
      scored: det.capped,
      value: 15
    },
    {
      desc: 'Endgame Total',
      scored: match.score.endgame,
      key: true
    },
    {
      desc: 'Minor Penalties',
      scored: det.minor_penalties,
      value: -10
    },
    {
      desc: 'Major Penalties',
      scored: det.major_penalties,
      value: -30
    },
    {
      desc: 'Total Score',
      scored: match.score_total,
      key: true
    }
  ];
});
