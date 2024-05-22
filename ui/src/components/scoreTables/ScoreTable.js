import TableRow from '@mui/material/TableRow/TableRow';
import TableCell from '@mui/material/TableCell/TableCell';
import Table from '@mui/material/Table/Table';
import TableBody from '@mui/material/TableBody/TableBody';
import React from 'react';
import {styled} from '@mui/material/styles';

const colors = {
  red: '#fee',
  blue: '#eef'
};
const keyColors = {
  red: '#fdd',
  blue: '#ddf',
  [undefined]: '#f0f0f0'
};

const ScoreCell = styled(TableCell)(({theme, ownerState}) => ({
  padding: theme.spacing(0.5),
  whiteSpace: 'pre-line',
  textAlign: 'center',
  '&:last-child': {
    paddingRight: theme.spacing(1),
  },
  background: ownerState.key ? keyColors[ownerState.color] : colors[ownerState.color]
}));

export default function ScoreTable(scoreInterpretation) {
  return ({match}) => {
    const scores = scoreInterpretation(match);
    scores.forEach((val) => {
      if (val.value) {
        val.red_pts = val.red * val.value + (val.bonus && val.bonus.redAccomplished ? val.bonus.value : 0);
        val.blue_pts = val.blue * val.value + (val.bonus && val.bonus.blueAccomplished ? val.bonus.value : 0);
      }
    });

    return <Table sx={{minWidth: '20em'}}>
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
