import ScoreTable, {toTitleCase} from './ScoreTable';
import type {components} from "../../api/first-v3";
import './DecodeScoreTable.css'

const endLocationPoints = {
  NONE: 0,
  PARTIAL: 5,
  FULL: 10
};

function ClassifierElement({element}: {element: 'GREEN' | 'PURPLE' | 'NONE'}) {
  return <span className={`artifact artifact-${element === 'GREEN' ? 'green' : (element === 'PURPLE' ? 'purple' : 'none')}`}>{element == 'NONE' ? '\u00A0' : element[0]}</span>
}

const motifs = {
  [1]: ['GREEN', 'PURPLE', 'PURPLE'] as const,
  [2]: ['PURPLE', 'GREEN', 'PURPLE'] as const,
  [3]: ['PURPLE', 'PURPLE', 'GREEN'] as const
}

function Motif({motif}: {motif: number}) {
  if(!(motif in motifs)) return null;
  const elements = motifs[motif as 1 | 2 | 3];
  return <>{elements.map((el, idx) => <ClassifierElement key={idx} element={el} />)}</>
}

export default ScoreTable<components['schemas']['ApiV3DecodeScoreDetail']>((match) => {
  const red_det = match.matchResultsDetails.redDetails;
  const blue_det = match.matchResultsDetails.blueDetails;
  return [
    {
      desc: 'Motif',
      red: match.random ? <>ID 2{match.random}<br/><Motif motif={match.random} /></> : '',
      blue: match.random ? <>ID 2{match.random}<br/><Motif motif={match.random} /></> : ''
    },
    {
      desc: 'Auto Classified Artifacts',
      red: red_det.achievements.autoClassifiedArtifacts,
      blue: blue_det.achievements.autoClassifiedArtifacts,
      value: 3
    },
    {
      desc: 'Auto Overflow Artifacts',
      red: red_det.achievements.autoOverflowArtifacts,
      blue: blue_det.achievements.autoOverflowArtifacts,
      value: 1
    },
    {
      desc: 'Auto Classifier State',
      red: red_det.achievements.autoClassifierState.map((s, idx) => <ClassifierElement key={idx} element={s} />),
      blue: blue_det.achievements.autoClassifierState.map((s, idx) => <ClassifierElement key={idx} element={s} />),
      red_pts: red_det.points.autoPatternPoints,
      blue_pts: blue_det.points.autoPatternPoints,
    },
    {
      desc: 'Robot 1 Leave',
      red: red_det.achievements.robot1Auto ? 'Yes' : 'No',
      blue: blue_det.achievements.robot1Auto ? 'Yes' : 'No',
      red_pts: red_det.achievements.robot1Auto ? 3 : 0,
      blue_pts: blue_det.achievements.robot1Auto ? 3 : 0,
    },
    {
      desc: 'Robot 2 Leave',
      red: red_det.achievements.robot2Auto ? 'Yes' : 'No',
      blue: blue_det.achievements.robot2Auto ? 'Yes' : 'No',
      red_pts: red_det.achievements.robot2Auto ? 3 : 0,
      blue_pts: blue_det.achievements.robot2Auto ? 3 : 0,
    },
    {
      desc: 'Auto Total',
      red: red_det.points.autoPoints,
      blue: blue_det.points.autoPoints,
      key: true
    },
    {
      desc: 'Teleop Classified Artifacts',
      red: red_det.achievements.teleopClassifiedArtifacts,
      blue: blue_det.achievements.teleopClassifiedArtifacts,
      value: 3
    },
    {
      desc: 'Teleop Overflow Artifacts',
      red: red_det.achievements.teleopOverflowArtifacts,
      blue: blue_det.achievements.teleopOverflowArtifacts,
      value: 1
    },
    {
      desc: 'Teleop Classifier State',
      red: red_det.achievements.teleopClassifierState.map((s, idx) => <ClassifierElement key={idx} element={s} />),
      blue: blue_det.achievements.teleopClassifierState.map((s, idx) => <ClassifierElement key={idx} element={s} />),
      red_pts: red_det.points.teleopPatternPoints,
      blue_pts: blue_det.points.teleopPatternPoints,
    },
    {
      desc: 'Teleop Depot Artifacts',
      red: red_det.achievements.teleopDepotArtifacts,
      blue: blue_det.achievements.teleopDepotArtifacts,
      value: 1
    },
    {
      desc: 'Robot 1 Base',
      red: toTitleCase(red_det.achievements.robot1Teleop),
      blue: toTitleCase(blue_det.achievements.robot1Teleop),
      red_pts: endLocationPoints[red_det.achievements.robot1Teleop],
      blue_pts: endLocationPoints[blue_det.achievements.robot1Teleop],
    },
    {
      desc: 'Robot 2 Base',
      red: toTitleCase(red_det.achievements.robot2Teleop),
      blue: toTitleCase(blue_det.achievements.robot2Teleop),
      red_pts: endLocationPoints[red_det.achievements.robot2Teleop],
      blue_pts: endLocationPoints[blue_det.achievements.robot2Teleop],
      bonus: {
        label: 'Both Robots in Base',
        redAccomplished: red_det.achievements.robot1Teleop === 'FULL' && red_det.achievements.robot2Teleop === 'FULL',
        blueAccomplished: blue_det.achievements.robot1Teleop === 'FULL' && blue_det.achievements.robot2Teleop === 'FULL',
        value: 10
      }
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
    },
    {
      desc: 'Movement RP',
      red: red_det.points.movementRP ? '\u2713' : '-',
      blue: blue_det.points.movementRP ? '\u2713' : '-'
    },
    {
      desc: 'Goal RP',
      red: red_det.points.goalRP ? '\u2713' : '-',
      blue: blue_det.points.goalRP ? '\u2713' : '-'
    },
    {
      desc: 'Pattern RP',
      red: red_det.points.patternRP ? '\u2713' : '-',
      blue: blue_det.points.patternRP ? '\u2713' : '-'
    }
  ];
});
