import classNames from 'classnames';
import TableRow from '@mui/material/TableRow/TableRow';
import TableCell from '@mui/material/TableCell/TableCell';
import Table from '@mui/material/Table/Table';
import TableBody from '@mui/material/TableBody/TableBody';
import React from 'react';
import withStyles from '@mui/styles/withStyles';

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
      {scores.map((sc, i) => {
        const bonusLabel = sc.bonus && `${sc.bonus.label} (+${sc.bonus.value})`;
        const redPrimary = `${sc.red} ${sc.red_pts ? `(${sc.red_pts > 0 ? '+' : ''}${sc.red_pts}${sc.penalty ? ' from blue' : ''})` : ''}`;

        const bluePrimary = `${sc.blue} ${sc.blue_pts ? `(${sc.blue_pts > 0 ? '+' : ''}${sc.blue_pts}${sc.penalty ? ' from red' : ''})` : ''}`;

        return <TableRow className={classNames(classes.tableRow, {[classes.keyTableRow]: sc.key})} key={i}>
          <TableCell className={classNames(classes.tableCell, classes.redCell, {[classes.redKeyCell]: sc.key})}>
            {sc.bonus && sc.bonus.first && sc.bonus.redAccomplished ? <>{bonusLabel}<br/></> : null}
            {redPrimary}
            {sc.bonus && !sc.bonus.first && sc.bonus.redAccomplished ? <><br/>{bonusLabel}</> : null }
          </TableCell>
          <TableCell className={classNames(classes.tableCell, {[classes.keyCell]: sc.key})}>{sc.desc}</TableCell>
          <TableCell className={classNames(classes.tableCell, classes.blueCell, {[classes.blueKeyCell]: sc.key})}>
            {sc.bonus && sc.bonus.first && sc.bonus.blueAccomplished ? <>{bonusLabel}<br/></> : null}
            {bluePrimary}
            {sc.bonus && !sc.bonus.first && sc.bonus.blueAccomplished ? <><br/>{bonusLabel}</> : null}
          </TableCell>
        </TableRow>;
      })}
    </TableBody>
  </Table>;
});

export default ScoreTable;