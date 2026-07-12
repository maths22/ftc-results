import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import {styled} from '@mui/material/styles';
import {components} from "../../api/v1";
import {ReactNode} from "react";
import TextLink from "../TextLink";

const colors = {
  red: '#fee',
  blue: '#eef'
};
const keyColors = {
  red: '#fdd',
  blue: '#ddf'
};

type CellOwnerState = {
  key?: boolean,
  color?: 'red' | 'blue'
}

const ScoreCell = styled(TableCell)<{ownerState: CellOwnerState}>(({theme, ownerState}) => ({
  padding: theme.spacing(0.5),
  width: '33%',
  whiteSpace: 'pre-line',
  textAlign: 'center',
  '&:last-child': {
    paddingRight: theme.spacing(1),
  },
  background: ownerState.key ? (ownerState.color ? keyColors[ownerState.color] : '#f0f0f0') : (ownerState.color ? colors[ownerState.color] : undefined)
}));

export function toTitleCase(str: string) {
  return str.replaceAll('_', ' ').replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase();
    }
  );
}

type ScoreType = components["schemas"]["matchDetails"]["red_score_details"]

export type SeasonScore<T extends ScoreType> = components["schemas"]["matchDetails"] & {
  red_score_details: T,
  blue_score_details: T
}

type ScoreInterpretation<T extends ScoreType> = (match: SeasonScore<T>) => ({
  desc: string,
  red_pts?: number,
  blue_pts?: number,
  bonus?: {
    first?: boolean,
    label: string,
    redAccomplished: boolean,
    blueAccomplished: boolean,
    value: number
  },
  penalty?: boolean
} & ({
  key: true,
  red: number,
  blue: number,
} | {
  key?: false,
  value?: number,
  red: number,
  blue: number,
} | {
  key?: false,
  red: ReactNode,
  blue: ReactNode,
  red_pts?: number,
  blue_pts?: number
}))[]

function MatchTeam({teamNumber, surrogate}: {teamNumber?: number, surrogate?: boolean}) {
  if(!teamNumber) return null;
  return <TextLink key={teamNumber} to={`/teams/${teamNumber}`} style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div className={`team-avatar team-${teamNumber}`} style={{marginRight: '0.25em', '--avatar-size': 30}}></div>
      {teamNumber}
      {surrogate ? '*' : ''}
    </div>
  </TextLink>;
}

export default function ScoreTable<T extends ScoreType>(scoreInterpretation: ScoreInterpretation<T>) {
  return ({match}: {match: SeasonScore<T>}) => {
    const scores = scoreInterpretation(match);
    scores.forEach((val) => {
      if ('value' in val && val.value) {
        val.red_pts = val.red * val.value + (val.bonus && val.bonus.redAccomplished ? val.bonus.value : 0);
        val.blue_pts = val.blue * val.value + (val.bonus && val.bonus.blueAccomplished ? val.bonus.value : 0);
      }
    });

    const maxTeams = Math.max(match.red_teams.length, match.blue_teams.length);
    const teamIdxes = Array.from({length: maxTeams}, (_, i) => i);

    return <Table sx={{minWidth: '20em', tableLayout: 'fixed'}}>
      <TableBody>
        {match.red_seed || match.blue_seed ?
            <TableRow>
              <ScoreCell ownerState={{key: true, color: 'red'}}>
                A{match.red_seed}
              </ScoreCell>
              <ScoreCell ownerState={{key: true}}>
                Seed
              </ScoreCell>
              <ScoreCell ownerState={{key: true, color: 'blue'}}>
                A{match.blue_seed}
              </ScoreCell>
            </TableRow> : null}
        {teamIdxes.map((idx) => {
          return <TableRow key={idx}>
            <ScoreCell ownerState={{key: true, color: 'red'}}>
              <MatchTeam teamNumber={match.red_teams[idx]} surrogate={match.red_surrogate[idx]} />
            </ScoreCell>
            <ScoreCell ownerState={{key: true}}>
              Team {idx + 1}
            </ScoreCell>
            <ScoreCell ownerState={{key: true, color: 'blue'}}>
              <MatchTeam teamNumber={match.blue_teams[idx]} surrogate={match.blue_surrogate[idx]} />
            </ScoreCell>
          </TableRow>
        })}
        {scores.map((sc, i) => {
          const bonusLabel = sc.bonus && `${sc.bonus.label} (+${sc.bonus.value})`;
          const redPrimary = <>{sc.red} {sc.red_pts ? `(${sc.red_pts > 0 ? '+' : ''}${sc.red_pts}${sc.penalty ? ' from blue' : ''})` : ''}</>;

          const bluePrimary = <>{sc.blue} {sc.blue_pts ? `(${sc.blue_pts > 0 ? '+' : ''}${sc.blue_pts}${sc.penalty ? ' from red' : ''})` : ''}</>;

          return <TableRow sx={{height: 1}} key={i}>
            <ScoreCell ownerState={{key: sc.key, color: 'red'}}>
              {sc.bonus && sc.bonus.first && sc.bonus.redAccomplished ? <>{bonusLabel}<br/></> : null}
              {redPrimary}
              {sc.bonus && !sc.bonus.first && sc.bonus.redAccomplished ? <><br/>{bonusLabel}</> : null}
            </ScoreCell>
            <ScoreCell ownerState={{key: sc.key}} dangerouslySetInnerHTML={{__html: sc.desc}}></ScoreCell>
            <ScoreCell ownerState={{key: sc.key, color: 'blue'}}>
              {sc.bonus && sc.bonus.first && sc.bonus.blueAccomplished ? <>{bonusLabel}<br/></> : null}
              {bluePrimary}
              {sc.bonus && !sc.bonus.first && sc.bonus.blueAccomplished ? <><br/>{bonusLabel}</> : null}
            </ScoreCell>
          </TableRow>;
        })}
      </TableBody>
    </Table>;
  };
}
