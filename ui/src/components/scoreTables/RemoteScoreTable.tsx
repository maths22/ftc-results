import TableRow from '@mui/material';
import TableCell from '@mui/material/TableCell';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import {styled} from '@mui/material/styles';
import {components} from "../../api/v1";

type CellOwnerState = {
  key?: boolean
}

const ScoreCell = styled(TableCell)<{ownerState: CellOwnerState}>(({theme, ownerState}) => ({
  padding: theme.spacing(0.5),
  whiteSpace: 'pre-line',
  textAlign: 'center',
  '&:last-child': {
    paddingRight: theme.spacing(1),
  },
  background: ownerState.key ? '#f0f0f0' : undefined,
  fontWeight: ownerState.key ? 'bold' : undefined,
}));


type ScoreType = components["schemas"]["remoteMatchDetails"]["score_details"]

export type SeasonScore<T extends ScoreType> = components["schemas"]["remoteMatchDetails"] & {
  score_details: T,
}

type ScoreInterpretation<T extends ScoreType> = (match: SeasonScore<T>) => ({
  desc: string,
  pts?: number,
  bonus?: {
    first?: boolean,
    label: string,
    accomplished: boolean,
    value: number
  },
  penalty?: boolean
} & ({
  key: true,
  scored: number,
} | {
  key?: false,
  value: number,
  scored: number,
} | {
  key?: false,
  scored: string,
  pts: number
}))[]


export default function ScoreTable<T extends ScoreType>(scoreInterpretation: ScoreInterpretation<T>) {
  return ({match}: {match: SeasonScore<T>}) => {
    const scores = scoreInterpretation(match);
    scores.forEach((val) => {
      if('value' in val) {
        val.pts = val.scored * val.value + (val.bonus && val.bonus.accomplished ? val.bonus.value : 0);
      }
    });

    return <Table style={{minWidth: '20em'}}>
      <TableBody>
        {scores.map((sc, i) => {
          const bonusLabel = sc.bonus && `${sc.bonus.label} (+${sc.bonus.value})`;
          const primary = `${sc.scored} ${sc.pts ? `(${sc.pts > 0 ? '+' : ''}${sc.pts})` : ''}`;

          return <TableRow sx={{height: 1}} key={i}>
            <ScoreCell ownerState={{key: sc.key}}>{sc.desc}</ScoreCell>
            <ScoreCell ownerState={{key: sc.key}}>
              {sc.bonus && sc.bonus.first && sc.bonus.accomplished ? <>{bonusLabel}<br/></> : null}
              {primary}
              {sc.bonus && !sc.bonus.first && sc.bonus.accomplished ? <><br/>{bonusLabel}</> : null}
            </ScoreCell>
          </TableRow>;
        })}
      </TableBody>
    </Table>;
  };
}