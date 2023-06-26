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
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    textAlign: 'center',
    '&:last-child': {
      paddingRight: theme.spacing(1),
    }
  }
});

function rankingsTable ({rankings, classes, showRecord, elims}) {
  if(!rankings || rankings.length === 0) {
    if(elims) {
      return null;
    }
    return <Typography variant="body1" style={{textAlign: 'center'}}>Rankings are not currently available</Typography>;
  }

  const rowStyle = { height: '2rem' };

  return <Table className={classes.table} size="small">
    <TableHead>
      <TableRow style={rowStyle}>
        <TableCell className={classes.tableCell}>Rank</TableCell>
        {elims ? <>
          <TableCell className={classes.tableCell}>Alliance</TableCell>
        </> : <>
          <TableCell className={classes.tableCell}>Team Number</TableCell>
          <TableCell className={classes.tableCell}>Team Name</TableCell>
        </>}
        <TableCell className={classes.tableCell}>Ranking Points</TableCell>
        <TableCell className={classes.tableCell}>Tie Breaker Points 1</TableCell>
        <TableCell className={classes.tableCell}>Tie Breaker Points 2</TableCell>
        {showRecord ? <TableCell className={classes.tableCell}>Record (W-L-T)</TableCell> : null}
        <TableCell className={classes.tableCell}>Matches Played</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rankings.map((r) => {
        let recordLine;
        if(showRecord){
          recordLine = `${r.record.win}-${r.record.loss}-${r.record.tie}`;
        }
        return <TableRow key={r.id} style={rowStyle}>
          <TableCell className={classes.tableCell}>{r.ranking < 0 ? 'NP' : r.ranking}</TableCell>
          {elims ? <>
            <TableCell className={classes.tableCell}>{r.alliance.seed}</TableCell>
          </> : <>
            <TableCell className={classes.tableCell}>
              <TextLink to={`/teams/summary/${r.team.number}`}>{r.team.number}</TextLink>
            </TableCell>
            <TableCell className={classes.tableCell}>{r.team.name}</TableCell>
          </>}
          <TableCell className={classes.tableCell}>{r.ranking < 0 ? '-' : Number(r.sort_order1).toFixed(2)}</TableCell>
          <TableCell className={classes.tableCell}>{r.ranking < 0 ? '-' : Number(r.sort_order2).toFixed(2)}</TableCell>
          <TableCell className={classes.tableCell}>{r.ranking < 0 ? '-' : Number(r.sort_order3).toFixed(2)}</TableCell>
          {showRecord ? <TableCell className={classes.tableCell}>{r.ranking < 0 ? '-' : recordLine}</TableCell> : null}
          <TableCell className={classes.tableCell}>{r.ranking < 0 ? '-' : r.matches_played}</TableCell>
        </TableRow>;
      })}
    </TableBody>
  </Table>;
}

export default withStyles(styles)(rankingsTable);