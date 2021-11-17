import classNames from 'classnames';
import TableRow from '@material-ui/core/TableRow/TableRow';
import TableCell from '@material-ui/core/TableCell/TableCell';
import Table from '@material-ui/core/Table/Table';
import TableBody from '@material-ui/core/TableBody/TableBody';
import React from 'react';
import {withStyles} from '@material-ui/core';

const styles = (theme) => ({
  table: {
    minWidth: '20em',
  },
  tableCell: {
    padding: theme.spacing(0.5),
    whiteSpace: 'pre-line',
    textAlign: 'center',
    '&:last-child': {
      paddingRight: theme.spacing(1),
    }
  },
  tableRow: {
    height: '1.5rem'
  },
  keyTableRow: {
  },
  keyCell: {
    background: '#f0f0f0',
    fontWeight: 'bold',
  },
  allianceCell: {
    fontWeight: 'bold',
  },
  surrogateCell: {
    opacity: '0.6'
  }
});

const ScoreTable = (scoreInterpretation) => withStyles(styles)(({classes, match}) => {
  const scores = scoreInterpretation(match);
  scores.forEach((val) => {
    if(val.value) {
      val.pts = val.scored * val.value + (val.bonus && val.bonus.accomplished ? val.bonus.value : 0);
    }
  });

  return <Table className={classes.table}>
    <TableBody>
      {scores.map((sc, i) => {
        const bonusLabel = sc.bonus && `${sc.bonus.label} (+${sc.bonus.value})`;
        const primary = `${sc.scored} ${sc.pts ? `(${sc.pts > 0 ? '+' : ''}${sc.pts})` : ''}`;

        return <TableRow className={classNames(classes.tableRow, {[classes.keyTableRow]: sc.key})} key={i}>
          <TableCell className={classNames(classes.tableCell, {[classes.keyCell]: sc.key})}>{sc.desc}</TableCell>
          <TableCell className={classNames(classes.tableCell, {[classes.keyCell]: sc.key})}>
            {sc.bonus && sc.bonus.first && sc.bonus.accomplished ? <>{bonusLabel}<br/></> : null}
            {primary}
            {sc.bonus && !sc.bonus.first && sc.bonus.accomplished ? <><br/>{bonusLabel}</> : null}
          </TableCell>
        </TableRow>
      })}
    </TableBody>
  </Table>;
});

export default ScoreTable;