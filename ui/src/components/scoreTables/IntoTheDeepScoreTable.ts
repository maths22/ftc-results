import ScoreTable, {toTitleCase} from './ScoreTable';
import type {components} from "../../api/v1";

const autoLocationPoints = {
  NONE: 0,
  OBSERVATION_ZONE: 3,
  ASCENT: 3,
};

const endLocationPoints = {
  NONE: 0,
  OBSERVATION_ZONE: 3,
  ASCENT_1: 3,
  ASCENT_2: 15,
  ASCENT_3: 30,
};

export default ScoreTable<components['schemas']['IntoTheDeepScore']>((match) => {
  const red_det = match.red_score_details;
  const blue_det = match.blue_score_details;
  return [
    {
      desc: 'Robot 1 Location',
      red: toTitleCase(red_det.auto_robot1),
      blue: toTitleCase(blue_det.auto_robot1),
      red_pts: autoLocationPoints[red_det.auto_robot1],
      blue_pts: autoLocationPoints[blue_det.auto_robot1],
    },
    {
      desc: 'Robot 2 Location',
      red: toTitleCase(red_det.auto_robot2),
      blue: toTitleCase(blue_det.auto_robot2),
      red_pts: autoLocationPoints[red_det.auto_robot2],
      blue_pts: autoLocationPoints[blue_det.auto_robot2],
    },
    {
      desc: 'Auto Net Samples',
      red: red_det.auto_sample_net,
      blue: blue_det.auto_sample_net,
      value: 2
    },
    {
      desc: 'Auto Low Basket Samples',
      red: red_det.auto_sample_low,
      blue: blue_det.auto_sample_low,
      value: 4
    },
    {
      desc: 'Auto High Basket Samples',
      red: red_det.auto_sample_high,
      blue: blue_det.auto_sample_high,
      value: 8
    },
    {
      desc: 'Auto Low Chamber Specimens',
      red: red_det.auto_specimen_low,
      blue: blue_det.auto_specimen_low,
      value: 6
    },
    {
      desc: 'Auto High Chamber Specimens',
      red: red_det.auto_specimen_high,
      blue: blue_det.auto_specimen_high,
      value: 10
    },
    {
      desc: 'Auto Total',
      red: match.red_score.auto,
      blue: match.blue_score.auto,
      key: true
    },
    {
      desc: 'Teleop Net Samples',
      red: red_det.teleop_sample_net,
      blue: blue_det.teleop_sample_net,
      value: 2
    },
    {
      desc: 'Teleop Low Basket Samples',
      red: red_det.teleop_sample_low,
      blue: blue_det.teleop_sample_low,
      value: 4
    },
    {
      desc: 'Teleop High Basket Samples',
      red: red_det.teleop_sample_high,
      blue: blue_det.teleop_sample_high,
      value: 8
    },
    {
      desc: 'Teleop Low Chamber Specimens',
      red: red_det.teleop_specimen_low,
      blue: blue_det.teleop_specimen_low,
      value: 6
    },
    {
      desc: 'Teleop High Chamber Specimens',
      red: red_det.teleop_specimen_high,
      blue: blue_det.teleop_specimen_high,
      value: 10
    },
    {
      desc: 'Robot 1 Location',
      red: toTitleCase(red_det.teleop_robot1),
      blue: toTitleCase(blue_det.teleop_robot1),
      red_pts: endLocationPoints[red_det.teleop_robot1],
      blue_pts: endLocationPoints[blue_det.teleop_robot1],
    },
    {
      desc: 'Robot 2 Location',
      red: toTitleCase(red_det.teleop_robot2),
      blue: toTitleCase(blue_det.teleop_robot2),
      red_pts: endLocationPoints[red_det.teleop_robot2],
      blue_pts: endLocationPoints[blue_det.teleop_robot2],
    },
    {
      desc: 'Driver-controlled Total',
      red: match.red_score.teleop,
      blue: match.blue_score.teleop,
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
