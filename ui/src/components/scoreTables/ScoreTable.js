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
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    whiteSpace: 'pre-line',
    textAlign: 'center',
    '&:last-child': {
      paddingRight: theme.spacing.unit,
    }
  },
  tableRow: {
    height: '2rem'
  },
  keyTableRow: {
  },
  redCell: {
    background: '#fee',
    width: '25%',
  },
  blueCell: {
    background: '#eef',
    width: '25%',
  },
  redKeyCell: {
    background: '#fdd',
    fontWeight: 'bold',
  },
  blueKeyCell: {
    background: '#ddf',
    fontWeight: 'bold',
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
      val.red_pts = val.red * val.value + (val.bonus && val.bonus.redAccomplished ? val.bonus.value : 0);
      val.blue_pts = val.blue * val.value + (val.bonus && val.bonus.blueAccomplished ? val.bonus.value : 0);
    }
  });

  return <Table className={classes.table}>
    <TableBody>
      {scores.map((sc) => (<TableRow className={classNames(classes.tableRow, {[classes.keyTableRow]: sc.key})}>
        <TableCell className={classNames(classes.tableCell, classes.redCell, {[classes.redKeyCell]: sc.key})}>
          {sc.red} {sc.red_pts ? `(+${sc.red_pts}${sc.penalty ? ' to blue' : ''})` : ''}
          {sc.bonus && sc.bonus.redAccomplished ? <><br/>Bonus (+{sc.bonus.value})</> : null}
        </TableCell>
        <TableCell className={classNames(classes.tableCell, {[classes.keyCell]: sc.key})}>{sc.desc}</TableCell>
        <TableCell className={classNames(classes.tableCell, classes.blueCell, {[classes.blueKeyCell]: sc.key})}>
          {sc.blue} {sc.blue_pts ? `(+${sc.blue_pts}${sc.penalty ? ' to red' : ''})` : ''}
          {sc.bonus && sc.bonus.blueAccomplished ? <><br/>Bonus (+{sc.bonus.value})</> : null}
        </TableCell>
      </TableRow>))}
    </TableBody>
  </Table>;
})

export default ScoreTable