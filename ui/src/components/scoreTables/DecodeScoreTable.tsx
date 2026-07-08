import ScoreTable, {toTitleCase} from './ScoreTable';
import type {components} from "../../api/v1";
import './DecodeScoreTable.css';
import {useTeam} from "../../api.ts";
import TextLink from "../TextLink.tsx";

const endLocationPoints = {
  NONE: 0,
  PARTIAL: 5,
  FULL: 10,
};

type Artifact = 'GREEN' | 'PURPLE' | 'NONE';

function ClassifierElement({element}: {element: Artifact}) {
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

function motifScore(random: number | undefined, classifierState: Artifact[]) {
  const motif = motifs[random as 1 | 2 | 3]
  if(!motif) return 0;
  return classifierState.map((el, idx) => el == motif[idx % motif.length] ? 2 : 0)
      .reduce<number>((acc, val) => acc + val, 0)

}

export default ScoreTable<components['schemas']['DecodeScore']>((match) => {
  const red_det = match.red_score_details;
  const blue_det = match.blue_score_details;
  return [
    {
      desc: 'Motif',
      red: match.random ? <>ID 2{match.random}<br/><Motif motif={match.random} /></> : '',
      blue: match.random ? <>ID 2{match.random}<br/><Motif motif={match.random} /></> : ''
    },
    {
      desc: 'Auto Classified Artifacts',
      red: red_det.auto_classified_artifacts,
      blue: blue_det.auto_classified_artifacts,
      value: 3
    },
    {
      desc: 'Auto Overflow Artifacts',
      red: red_det.auto_overflow_artifacts,
      blue: blue_det.auto_overflow_artifacts,
      value: 1
    },
    {
      desc: 'Auto Classifier State',
      red: red_det.auto_classifier_state.map((s, idx) => <ClassifierElement key={idx} element={s} />),
      blue: blue_det.auto_classifier_state.map((s, idx) => <ClassifierElement key={idx} element={s} />),
      red_pts: motifScore(match.random, red_det.auto_classifier_state),
      blue_pts: motifScore(match.random, blue_det.auto_classifier_state),
    },
    {
      desc: 'Robot 1 Leave',
      red: red_det.auto_robot1 ? 'Yes' : 'No',
      blue: blue_det.auto_robot1 ? 'Yes' : 'No',
      red_pts: red_det.auto_robot1 ? 3 : 0,
      blue_pts: blue_det.auto_robot1 ? 3 : 0,
    },
    {
      desc: 'Robot 2 Location',
      red: red_det.auto_robot2 ? 'Yes' : 'No',
      blue: blue_det.auto_robot2 ? 'Yes' : 'No',
      red_pts: red_det.auto_robot2 ? 3 : 0,
      blue_pts: blue_det.auto_robot2 ? 3 : 0,
    },
    {
      desc: 'Auto Total',
      red: match.red_score.auto,
      blue: match.blue_score.auto,
      key: true
    },
    {
      desc: 'Teleop Classified Artifacts',
      red: red_det.teleop_classified_artifacts,
      blue: blue_det.teleop_classified_artifacts,
      value: 3
    },
    {
      desc: 'Teleop Overflow Artifacts',
      red: red_det.teleop_overflow_artifacts,
      blue: blue_det.teleop_overflow_artifacts,
      value: 1
    },
    {
      desc: 'Teleop Depot Artifacts',
      red: red_det.teleop_depot_artifacts,
      blue: blue_det.teleop_depot_artifacts,
      value: 1
    },
    {
      desc: 'Auto Classifier State',
      red: red_det.teleop_classifier_state.map((s, idx) => <ClassifierElement key={idx} element={s} />),
      blue: blue_det.teleop_classifier_state.map((s, idx) => <ClassifierElement key={idx} element={s} />),
      red_pts: motifScore(match.random, red_det.teleop_classifier_state),
      blue_pts: motifScore(match.random, blue_det.teleop_classifier_state),
    },
    {
      desc: 'Robot 1 Base',
      red: toTitleCase(red_det.teleop_robot1),
      blue: toTitleCase(blue_det.teleop_robot1),
      red_pts: endLocationPoints[red_det.teleop_robot1],
      blue_pts: endLocationPoints[blue_det.teleop_robot1],
    },
    {
      desc: 'Robot 2 Base',
      red: toTitleCase(red_det.teleop_robot2),
      blue: toTitleCase(blue_det.teleop_robot2),
      red_pts: endLocationPoints[red_det.teleop_robot2],
      blue_pts: endLocationPoints[blue_det.teleop_robot2],
      bonus: {
        label: 'Both Robots in Base',
        redAccomplished: red_det.teleop_robot1 === 'FULL' && red_det.teleop_robot2 === 'FULL',
        blueAccomplished: blue_det.teleop_robot1 === 'FULL' && blue_det.teleop_robot2 === 'FULL',
        value: 10
      }
    },
    {
      desc: 'Teleop Total',
      red: match.red_score.teleop,
      blue: match.blue_score.teleop,
      key: true
    },
    {
      desc: 'Minor Fouls',
      red: blue_det.minor_fouls,
      blue: red_det.minor_fouls,
      value: 5,
      penalty: true
    },
    {
      desc: 'Major Fouls',
      red: blue_det.major_fouls,
      blue: red_det.major_fouls,
      value: 15,
      penalty: true
    },
    {
      desc: 'Total Score',
      red: match.red_score_total,
      blue: match.blue_score_total,
      key: true
    },
    {
      desc: 'Movement RP',
      red: red_det.movement_rp ? '\u2713' : '-',
      blue: blue_det.movement_rp ? '\u2713' : '-'
    },
    {
      desc: 'Goal RP',
      red: red_det.goal_rp ? '\u2713' : '-',
      blue: blue_det.goal_rp ? '\u2713' : '-'
    },
    {
      desc: 'Pattern RP',
      red: red_det.pattern_rp ? '\u2713' : '-',
      blue: blue_det.pattern_rp ? '\u2713' : '-'
    }
  ];
});
