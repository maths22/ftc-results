import ScoreTable, {toTitleCase} from './ScoreTable';
import type {components} from "../../api/first-v3";

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

export default ScoreTable<components['schemas']['ApiV3IntoTheDeepScoreDetail']>((match) => {
  const red_det = match.matchResultsDetails.redDetails;
  const blue_det = match.matchResultsDetails.blueDetails;
  return [
    {
      desc: 'Robot 1 Location',
      red: toTitleCase(red_det.achievements.robot1Auto),
      blue: toTitleCase(blue_det.achievements.robot1Auto),
      red_pts: autoLocationPoints[red_det.achievements.robot1Auto],
      blue_pts: autoLocationPoints[blue_det.achievements.robot1Auto],
    },
    {
      desc: 'Robot 2 Location',
      red: toTitleCase(red_det.achievements.robot2Auto),
      blue: toTitleCase(blue_det.achievements.robot2Auto),
      red_pts: autoLocationPoints[red_det.achievements.robot2Auto],
      blue_pts: autoLocationPoints[blue_det.achievements.robot2Auto],
    },
    {
      desc: 'Auto Net Samples',
      red: red_det.achievements.autoSampleNet,
      blue: blue_det.achievements.autoSampleNet,
      value: 2
    },
    {
      desc: 'Auto Low Basket Samples',
      red: red_det.achievements.autoSampleLow,
      blue: blue_det.achievements.autoSampleLow,
      value: 4
    },
    {
      desc: 'Auto High Basket Samples',
      red: red_det.achievements.autoSampleHigh,
      blue: blue_det.achievements.autoSampleHigh,
      value: 8
    },
    {
      desc: 'Auto Low Chamber Specimens',
      red: red_det.achievements.autoSpecimenLow,
      blue: blue_det.achievements.autoSpecimenLow,
      value: 6
    },
    {
      desc: 'Auto High Chamber Specimens',
      red: red_det.achievements.autoSpecimenHigh,
      blue: blue_det.achievements.autoSpecimenHigh,
      value: 10
    },
    {
      desc: 'Auto Total',
      red: red_det.points.autoPoints,
      blue: blue_det.points.autoPoints,
      key: true
    },
    {
      desc: 'Teleop Net Samples',
      red: red_det.achievements.teleopSampleNet,
      blue: blue_det.achievements.teleopSampleNet,
      value: 2
    },
    {
      desc: 'Teleop Low Basket Samples',
      red: red_det.achievements.teleopSampleLow,
      blue: blue_det.achievements.teleopSampleLow,
      value: 4
    },
    {
      desc: 'Teleop High Basket Samples',
      red: red_det.achievements.teleopSampleHigh,
      blue: blue_det.achievements.teleopSampleHigh,
      value: 8
    },
    {
      desc: 'Teleop Low Chamber Specimens',
      red: red_det.achievements.teleopSpecimenLow,
      blue: blue_det.achievements.teleopSpecimenLow,
      value: 6
    },
    {
      desc: 'Teleop High Chamber Specimens',
      red: red_det.achievements.teleopSpecimenHigh,
      blue: blue_det.achievements.teleopSpecimenHigh,
      value: 10
    },
    {
      desc: 'Robot 1 Location',
      red: toTitleCase(red_det.achievements.robot1Teleop),
      blue: toTitleCase(blue_det.achievements.robot1Teleop),
      red_pts: endLocationPoints[red_det.achievements.robot1Teleop],
      blue_pts: endLocationPoints[blue_det.achievements.robot1Teleop],
    },
    {
      desc: 'Robot 2 Location',
      red: toTitleCase(red_det.achievements.robot2Teleop),
      blue: toTitleCase(blue_det.achievements.robot2Teleop),
      red_pts: endLocationPoints[red_det.achievements.robot2Teleop],
      blue_pts: endLocationPoints[blue_det.achievements.robot2Teleop],
    },
    {
      desc: 'Driver-controlled Total',
      red: red_det.points.teleopPoints,
      blue: blue_det.points.teleopPoints,
      key: true
    },
    {
      desc: 'Minor Fouls',
      red: blue_det.achievements.minorFouls,
      blue: red_det.achievements.minorFouls,
      value: 5,
      penalty: true
    },
    {
      desc: 'Major Fouls',
      red: blue_det.achievements.majorFouls,
      blue: red_det.achievements.majorFouls,
      value: 15,
      penalty: true
    },
    {
      desc: 'Total Score',
      red: match.matchResults?.redScore || 0,
      blue: match.matchResults?.blueScore || 0,
      key: true
    }
  ];
});
