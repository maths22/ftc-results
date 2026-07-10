import ScoreTable, {toTitleCase} from './ScoreTable';
import type {components} from "../../api/v1";
import './DecodeCriScoreTable.scss';
import {useTeam} from "../../api.ts";
import TextLink from "../TextLink.tsx";

const endLocationPoints = {
  NONE: 0,
  PARTIAL: 5,
  FULL: 10,
};

type Artifact = 'GREEN' | 'PURPLE' | 'RED' | 'ORANGE' | 'BLUE' | 'YELLOW' | 'GEM' | 'NONE';

function ClassifierElement({element}: {element: Artifact}) {
  return <span className={`criArtifact artifact-${element.toLowerCase()}`}>{element == 'NONE' ? '\u00A0' : element[0]}</span>
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

function isSpectrumNext(self: Artifact, other: Artifact) {
    if(self == 'RED') {
      return other == 'ORANGE';
    } else if(self == 'ORANGE') {
      return other == 'YELLOW';
    } else if(self == 'YELLOW') {
       return other == 'GREEN';
    } else if(self == 'GREEN') {
       return other == 'BLUE';
    } else if(self == 'BLUE') {
       return other == 'PURPLE';
    } else if(self == 'PURPLE') {
      return other == 'RED';
    } else {
      return false;
    }
}

function isSpectrumPrevious(self: Artifact, other: Artifact) {
  if(self == 'RED') {
    return other == 'PURPLE';
  } else if(self == 'ORANGE') {
    return other == 'RED';
  } else if(self == 'YELLOW') {
    return other == 'ORANGE';
  } else if(self == 'GREEN') {
    return other == 'YELLOW';
  } else if(self == 'BLUE') {
    return other == 'GREEN';
  } else if(self == 'PURPLE') {
    return other == 'BLUE';
  } else {
    return false;
  }
}

function findSpectra(prismState: Artifact[]) {
  const remainingArtifacts: Artifact[][] = [];
  const spectra: Artifact[][] = [];
  remainingArtifacts.push(prismState.filter(a => a != 'NONE'));
  for(let i = 6; i > 1; i--) {
    for(let ii = 0; ii < remainingArtifacts.length; ii++) {
      const artifacts = remainingArtifacts[ii];
      if (artifacts.length < i) {
        continue;
      }
      for(let j = 0; j < artifacts.length - i + 1; j++) {
        const first = artifacts[j];
        let last = artifacts[j + 1];
        let isSequence = isSpectrumNext(first, last) || isSpectrumPrevious(first, last);
        const isIncreasing = isSpectrumNext(first, last);
        if(isSequence) {
          for (let k = j + 2; k < j + i; k++) {
            const next = artifacts[k];
            if (isIncreasing ? !isSpectrumNext(last, next) : !isSpectrumPrevious(last, next)) {
              isSequence = false;
              break;
            }
            last = next;
          }
        }
        if(isSequence) {
          remainingArtifacts.splice(ii, 1);
          ii--;
          if(j > 0) {
            remainingArtifacts.push(artifacts.slice(0, j));
          }
          spectra.push(artifacts.slice(j, j + i));
          if(j + i < artifacts.length) {
            remainingArtifacts.push(artifacts.slice(j + i, artifacts.length));
          }
          break;
        }
      }
    }
  }
  return spectra;
}

function scorePrism(prismState: Artifact[]) {
  const spectra = findSpectra(prismState);
  const huePoints = new Set(prismState.filter(a => a != 'NONE')).size * 3
  return huePoints + spectra.map(s => 2 ** s.length).reduce((a, b) => a + b, 0);
}

export default ScoreTable<components['schemas']['DecodeCriScore']>((match) => {
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
      desc: 'Robot 3 Location',
      red: red_det.auto_robot3 ? 'Yes' : 'No',
      blue: blue_det.auto_robot3 ? 'Yes' : 'No',
      red_pts: red_det.auto_robot3 ? 3 : 0,
      blue_pts: blue_det.auto_robot3 ? 3 : 0,
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
      desc: 'Teleop Classifier State',
      red: red_det.teleop_classifier_state.map((s, idx) => <ClassifierElement key={idx} element={s} />),
      blue: blue_det.teleop_classifier_state.map((s, idx) => <ClassifierElement key={idx} element={s} />),
      red_pts: motifScore(match.random, red_det.teleop_classifier_state),
      blue_pts: motifScore(match.random, blue_det.teleop_classifier_state),
    },
    {
      desc: 'Teleop Prism State',
      red: red_det.prism_state.map((s, idx) => <ClassifierElement key={idx} element={s} />),
      blue: blue_det.prism_state.map((s, idx) => <ClassifierElement key={idx} element={s} />),
      red_pts: scorePrism(red_det.prism_state),
      blue_pts: scorePrism(blue_det.prism_state),
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
    },
    {
      desc: 'Robot 3 Base',
      red: toTitleCase(red_det.teleop_robot3),
      blue: toTitleCase(blue_det.teleop_robot3),
      red_pts: endLocationPoints[red_det.teleop_robot3],
      blue_pts: endLocationPoints[blue_det.teleop_robot3],
      bonus: {
        label: 'Both Robots in Base',
        redAccomplished: [red_det.teleop_robot1 === 'FULL', red_det.teleop_robot2 === 'FULL', red_det.teleop_robot3 === 'FULL'].filter(x => x).length >= 2,
        blueAccomplished: [blue_det.teleop_robot1 === 'FULL', blue_det.teleop_robot2 === 'FULL', blue_det.teleop_robot3 === 'FULL'].filter(x => x).length >= 2,
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
