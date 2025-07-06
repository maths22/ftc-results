import ScoreTable, {toTitleCase} from './ScoreTable';
import type {components} from "../../api/v1";

const autoLocationPoints = {
  NONE: 0,
  OBSERVATION_ZONE: 3,
  ASCENT: 3,
};

const autoLocationLabels = {
  NONE: 'None',
  OBSERVATION_ZONE: 'Observation Zone',
  ASCENT: 'Ascent L1'
}

const endLocationPoints = {
  NONE: 0,
  OBSERVATION_ZONE: 3,
  ASCENT_1: 3,
  ASCENT_2: 15,
  ASCENT_3: 30,
}

const endLocationLabels = {
  NONE: 'None',
  OBSERVATION_ZONE: 'Observation Zone',
  ASCENT_1: 'Ascent L1',
  ASCENT_2: 'Ascent L2',
  ASCENT_3: 'Ascent L3',
}

export default ScoreTable<components['schemas']['IntoTheDeepCriScore']>((match) => {
  const red_det = match.red_score_details;
  const blue_det = match.blue_score_details;
  return [
    {
      desc: 'Robot 1 Location',
      red: autoLocationLabels[red_det.auto_robot1],
      blue: autoLocationLabels[blue_det.auto_robot1],
      red_pts: autoLocationPoints[red_det.auto_robot1],
      blue_pts: autoLocationPoints[blue_det.auto_robot1],
    },
    {
      desc: 'Robot 2 Location',
      red: autoLocationLabels[red_det.auto_robot2],
      blue: autoLocationLabels[blue_det.auto_robot2],
      red_pts: autoLocationPoints[red_det.auto_robot2],
      blue_pts: autoLocationPoints[blue_det.auto_robot2],
    },
    {
      desc: 'Robot 3 Location',
      red: autoLocationLabels[red_det.auto_robot3],
      blue: autoLocationLabels[blue_det.auto_robot3],
      red_pts: autoLocationPoints[red_det.auto_robot3],
      blue_pts: autoLocationPoints[blue_det.auto_robot3],
    },
    {
      desc: 'Auto Net Zone Samples<br/>Near/Far',
      red: `${red_det.auto_sample_net_near}/${red_det.auto_sample_net_far}`,
      blue: `${blue_det.auto_sample_net_near}/${blue_det.auto_sample_net_far}`,
      red_pts: 2 * (red_det.auto_sample_net_near + red_det.auto_sample_net_far),
      blue_pts: 2 * (blue_det.auto_sample_net_near + blue_det.auto_sample_net_far)
    },
    {
      desc: 'Auto Low Basket Samples<br/>Near/Far',
      red: `${red_det.auto_sample_low_near}/${red_det.auto_sample_low_far}`,
      blue: `${blue_det.auto_sample_low_near}/${blue_det.auto_sample_low_far}`,
      red_pts: 4 * (red_det.auto_sample_low_near + red_det.auto_sample_low_far),
      blue_pts: 4 * (blue_det.auto_sample_low_near + blue_det.auto_sample_low_far)
    },
    {
      desc: 'Auto High Basket Samples<br/>Near/Far',
      red: `${red_det.auto_sample_high_near}/${red_det.auto_sample_high_far}`,
      blue: `${blue_det.auto_sample_high_near}/${blue_det.auto_sample_high_far}`,
      red_pts: 8 * (red_det.auto_sample_high_near + red_det.auto_sample_high_far),
      blue_pts: 8 * (blue_det.auto_sample_high_near + blue_det.auto_sample_high_far)
    },
    {
      desc: 'Auto Low Specimens<br/>1/2/3/4',
      red: `${red_det.auto_specimen_low_1}/${red_det.auto_specimen_low_2}/${red_det.auto_specimen_low_3}/${red_det.auto_specimen_low_4}`,
      blue: `${blue_det.auto_specimen_low_1}/${blue_det.auto_specimen_low_2}/${blue_det.auto_specimen_low_3}/${blue_det.auto_specimen_low_4}`,
      red_pts: 6 * (red_det.auto_specimen_low_1 + red_det.auto_specimen_low_2 + red_det.auto_specimen_low_3 + red_det.auto_specimen_low_4),
      blue_pts: 6 * (blue_det.auto_specimen_low_1 + blue_det.auto_specimen_low_2 + blue_det.auto_specimen_low_3 + blue_det.auto_specimen_low_4)
    },
    {
      desc: 'Auto High Specimens<br/>1/2/3/4',
      red: `${red_det.auto_specimen_high_1}/${red_det.auto_specimen_high_2}/${red_det.auto_specimen_high_3}/${red_det.auto_specimen_high_4}`,
      blue: `${blue_det.auto_specimen_high_1}/${blue_det.auto_specimen_high_2}/${blue_det.auto_specimen_high_3}/${blue_det.auto_specimen_high_4}`,
      red_pts: 10 * (red_det.auto_specimen_high_1 + red_det.auto_specimen_high_2 + red_det.auto_specimen_high_3 + red_det.auto_specimen_high_4),
      blue_pts: 10 * (blue_det.auto_specimen_high_1 + blue_det.auto_specimen_high_2 + blue_det.auto_specimen_high_3 + blue_det.auto_specimen_high_4)
    },
    {
      desc: 'Auto Chambers Owned',
      red: red_det.auto_owned_chambers,
      blue: blue_det.auto_owned_chambers,
      value: 10
    },
    {
      desc: 'AUTO Total',
      red: match.red_score.auto,
      blue: match.blue_score.auto,
      key: true
    },
    {
      desc: 'Teleop Net Samples<br/>Near/Far',
      red: `${red_det.teleop_sample_net_near}/${red_det.teleop_sample_net_far}`,
      blue: `${blue_det.teleop_sample_net_near}/${blue_det.teleop_sample_net_far}`,
      red_pts: 2 * (red_det.teleop_sample_net_near + red_det.teleop_sample_net_far),
      blue_pts: 2 * (blue_det.teleop_sample_net_near + blue_det.teleop_sample_net_far)
    },
    {
      desc: 'Teleop Low Basket Samples<br/>Near/Far',
      red: `${red_det.teleop_sample_low_near}/${red_det.teleop_sample_low_far}`,
      blue: `${blue_det.teleop_sample_low_near}/${blue_det.teleop_sample_low_far}`,
      red_pts: 4 * (red_det.teleop_sample_low_near + red_det.teleop_sample_low_far),
      blue_pts: 4 * (blue_det.teleop_sample_low_near + blue_det.teleop_sample_low_far)
    },
    {
      desc: 'Teleop High Basket Samples<br/>Near/Far',
      red: `${red_det.teleop_sample_high_near}/${red_det.teleop_sample_high_far}`,
      blue: `${blue_det.teleop_sample_high_near}/${blue_det.teleop_sample_high_far}`,
      red_pts: 8 * (red_det.teleop_sample_high_near + red_det.teleop_sample_high_far),
      blue_pts: 8 * (blue_det.teleop_sample_high_near + blue_det.teleop_sample_high_far)
    },
    {
      desc: 'Teleop Low Specimens<br/>1/2/3/4',
      red: `${red_det.teleop_specimen_low_1}/${red_det.teleop_specimen_low_2}/${red_det.teleop_specimen_low_3}/${red_det.teleop_specimen_low_4}`,
      blue: `${blue_det.teleop_specimen_low_1}/${blue_det.teleop_specimen_low_2}/${blue_det.teleop_specimen_low_3}/${blue_det.teleop_specimen_low_4}`,
      red_pts: 6 * (red_det.teleop_specimen_low_1 + red_det.teleop_specimen_low_2 + red_det.teleop_specimen_low_3 + red_det.teleop_specimen_low_4),
      blue_pts: 6 * (blue_det.teleop_specimen_low_1 + blue_det.teleop_specimen_low_2 + blue_det.teleop_specimen_low_3 + blue_det.teleop_specimen_low_4)
    },
    {
      desc: 'Teleop High Specimens<br/>1/2/3/4',
      red: `${red_det.teleop_specimen_high_1}/${red_det.teleop_specimen_high_2}/${red_det.teleop_specimen_high_3}/${red_det.teleop_specimen_high_4}`,
      blue: `${blue_det.teleop_specimen_high_1}/${blue_det.teleop_specimen_high_2}/${blue_det.teleop_specimen_high_3}/${blue_det.teleop_specimen_high_4}`,
      red_pts: 10 * (red_det.teleop_specimen_high_1 + red_det.teleop_specimen_high_2 + red_det.teleop_specimen_high_3 + red_det.teleop_specimen_high_4),
      blue_pts: 10 * (blue_det.teleop_specimen_high_1 + blue_det.teleop_specimen_high_2 + blue_det.teleop_specimen_high_3 + blue_det.teleop_specimen_high_4)
    },
    {
      desc: 'Telop Chambers Owned',
      red: red_det.teleop_owned_chambers,
      blue: blue_det.teleop_owned_chambers,
      value: 20
    },
    {
      desc: 'Robot 1 Location',
      red: endLocationLabels[red_det.teleop_robot1],
      blue: endLocationLabels[blue_det.teleop_robot1],
      red_pts: endLocationPoints[red_det.teleop_robot1],
      blue_pts: endLocationPoints[blue_det.teleop_robot1],
    },
    {
      desc: 'Robot 2 Location',
      red: endLocationLabels[red_det.teleop_robot2],
      blue: endLocationLabels[blue_det.teleop_robot2],
      red_pts: endLocationPoints[red_det.teleop_robot2],
      blue_pts: endLocationPoints[blue_det.teleop_robot2],
    },
    {
      desc: 'Robot 3 Location',
      red: endLocationLabels[red_det.teleop_robot3],
      blue: endLocationLabels[blue_det.teleop_robot3],
      red_pts: endLocationPoints[red_det.teleop_robot3],
      blue_pts: endLocationPoints[blue_det.teleop_robot3],
    },
    {
      desc: 'TELEOP Total',
      red: match.red_score.teleop,
      blue: match.blue_score.teleop,
      key: true
    },
    {
      desc: 'Coop Bonus',
      red: red_det.coop_achieved ? 50 : 0,
      blue: blue_det.coop_achieved ? 50 : 0,
      key: true
    },
    {
      desc: 'Minor Fouls',
      red: blue_det.minor_penalties,
      blue: red_det.minor_penalties,
      value: 10,
      penalty: true
    },
    {
      desc: 'Major Fouls',
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
