import TableRow from '@mui/material/TableRow/TableRow';
import TableCell from '@mui/material/TableCell/TableCell';
import Table from '@mui/material/Table/Table';
import TableBody from '@mui/material/TableBody/TableBody';
import {styled} from '@mui/material/styles';
import {components} from "../../api/v1";

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
  red: string,
  blue: string,
  red_pts?: number,
  blue_pts?: number
}))[]

export default function ScoreTable<T extends ScoreType>(scoreInterpretation: ScoreInterpretation<T>) {
  return ({match}: {match: SeasonScore<T>}) => {
    const scores = scoreInterpretation(match);
    scores.forEach((val) => {
      if ('value' in val && val.value) {
        val.red_pts = val.red * val.value + (val.bonus && val.bonus.redAccomplished ? val.bonus.value : 0);
        val.blue_pts = val.blue * val.value + (val.bonus && val.bonus.blueAccomplished ? val.bonus.value : 0);
      }
    });

    return <Table sx={{minWidth: '20em', tableLayout: 'fixed'}}>
      <TableBody>
        {scores.map((sc, i) => {
          const bonusLabel = sc.bonus && `${sc.bonus.label} (+${sc.bonus.value})`;
          const redPrimary = `${sc.red} ${sc.red_pts ? `(${sc.red_pts > 0 ? '+' : ''}${sc.red_pts}${sc.penalty ? ' from blue' : ''})` : ''}`;

          const bluePrimary = `${sc.blue} ${sc.blue_pts ? `(${sc.blue_pts > 0 ? '+' : ''}${sc.blue_pts}${sc.penalty ? ' from red' : ''})` : ''}`;

          return <TableRow sx={{height: 1}} key={i}>
            <ScoreCell ownerState={{key: sc.key, color: 'red'}}>
              {sc.bonus && sc.bonus.first && sc.bonus.redAccomplished ? <>{bonusLabel}<br/></> : null}
              {redPrimary}
              {sc.bonus && !sc.bonus.first && sc.bonus.redAccomplished ? <><br/>{bonusLabel}</> : null}
            </ScoreCell>
            <ScoreCell ownerState={{key: sc.key}}>{sc.desc}</ScoreCell>
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
