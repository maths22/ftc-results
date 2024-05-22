import TableRow from '@mui/material/TableRow/TableRow';
import TableCell from '@mui/material/TableCell/TableCell';
import Table from '@mui/material/Table/Table';
import TableBody from '@mui/material/TableBody/TableBody';
import React from 'react';
import {styled} from '@mui/material/styles';

const ScoreCell = styled(TableCell)(({theme, ownerState}) => ({
  padding: theme.spacing(0.5),
  whiteSpace: 'pre-line',
  textAlign: 'center',
  '&:last-child': {
    paddingRight: theme.spacing(1),
  },
  background: ownerState.key ? '#f0f0f0' : undefined,
  fontWeight: ownerState.key ? 'bold' : undefined,
}));


export default function ScoreTable(scoreInterpretation) {
  return ({match}) => {
    const scores = scoreInterpretation(match);
    scores.forEach((val) => {
      if(val.value) {
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