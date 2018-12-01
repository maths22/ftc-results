import TableRow from '@material-ui/core/TableRow/TableRow';
import TableCell from '@material-ui/core/TableCell/TableCell';
import Table from '@material-ui/core/Table/Table';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableBody from '@material-ui/core/TableBody/TableBody';
import React from 'react';
import {withStyles} from '@material-ui/core';
import TextLink from './TextLink';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
  table: {
    minWidth: '20em',
  },
  tableCell: {
    paddingLeft: 1 * theme.spacing.unit,
    paddingRight: 1 * theme.spacing.unit,
    textAlign: 'center',
    '&:last-child': {
      paddingRight: 1 * theme.spacing.unit,
    }
  }
});

function rankingsTable({rankings, classes}) {
  if(!rankings || rankings.length === 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>Rankings are not currently available</Typography>;
  }

  const rowStyle = { height: '2rem' };


  return <Table className={classes.table}>
    <TableHead>
      <TableRow style={rowStyle}>
        <TableCell className={classes.tableCell}>Rank</TableCell>
        <TableCell className={classes.tableCell}>Team Number</TableCell>
        <TableCell className={classes.tableCell}>Team Name</TableCell>
        <TableCell className={classes.tableCell}>Ranking Points</TableCell>
        <TableCell className={classes.tableCell}>Tie Breaker Points</TableCell>
        <TableCell className={classes.tableCell}>Matches Played</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rankings.map((r) => (<TableRow key={r.id} style={rowStyle}>
        <TableCell className={classes.tableCell}>{r.ranking}</TableCell>
        <TableCell className={classes.tableCell}>
          <TextLink to={`/teams/summary/${r.team.number}`}>{r.team.number}</TextLink>
        </TableCell>
        <TableCell className={classes.tableCell}>{r.team.name}</TableCell>
        <TableCell className={classes.tableCell}>{r.ranking_points}</TableCell>
        <TableCell className={classes.tableCell}>{r.tie_breaker_points}</TableCell>
        <TableCell className={classes.tableCell}>{r.matches_played}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>;
}

export default withStyles(styles)(rankingsTable);