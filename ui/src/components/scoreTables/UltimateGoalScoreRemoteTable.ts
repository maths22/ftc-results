import RemoteScoreTable from './RemoteScoreTable.js';
import type {components} from "../../api/v1";
import {toTitleCase} from "./ScoreTable";

export default RemoteScoreTable<components['schemas']['UltimateGoalScoreRemote']>((match) => {
  const det = match.score_details;
  return [
    {
      desc: 'Auto Total',
      scored: match.score.auto,
      key: true
    },
    {
      desc: 'Driver-controlled Total',
      scored: match.score.teleop,
      key: true
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
