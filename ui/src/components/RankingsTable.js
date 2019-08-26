import TableRow from '@material-ui/core/TableRow/TableRow';
import TableCell from '@material-ui/core/TableCell/TableCell';
import Table from '@material-ui/core/Table/Table';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableBody from '@material-ui/core/TableBody/TableBody';
import React from 'react';
import {withStyles} from '@material-ui/core';
import TextLink from './TextLink';
import Typography from '@material-ui/core/Typography';
import ScrollingBody from './ScrollingBody';

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
  },
  rotatingTableCell: {
    // paddingLeft: 1 * theme.spacing.unit,
    // paddingRight: 1 * theme.spacing.unit,
    display: 'inline-block',
    textAlign: 'center',
    // '&:last-child': {
    //   paddingRight: 1 * theme.spacing.unit,
    // }
  }
});

function rankingsTable ({rankings, classes, showRecord, pitDisplay}) {
  if(!rankings || rankings.length === 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>Rankings are not currently available</Typography>;
  }

  const rowStyle = { height: '2rem' };

  if(pitDisplay) {
    return [
    <div className={'tableHeadDiv'}>
      <span className={classes.rotatingTableCell} style={{width: '20%'}}>Rank</span>
      <span className={classes.rotatingTableCell} style={{width: '20%'}}>Team #</span>
      <span className={classes.rotatingTableCell} style={{width: '20%'}}>RP</span>
      <span className={classes.rotatingTableCell} style={{width: '20%'}}>TBP</span>
      <span className={classes.rotatingTableCell} style={{width: '20%'}}>Matches</span>
    </div>,
    <ScrollingBody key={2}>
      {rankings.map((r) => {
          return <div className={'tableRowDiv'} key={r.id} style={Object.assign({},{width: '100%', rowStyle})}>
            <span className={classes.rotatingTableCell} style={{width: '20%'}}>{r.ranking < 0 ? 'NP' : r.ranking}</span>
            <span className={classes.rotatingTableCell} style={{width: '20%'}}>{r.team.number}</span>
            <span className={classes.rotatingTableCell} style={{width: '20%'}}>{r.ranking < 0 ? '-' : r.ranking_points}</span>
            <span className={classes.rotatingTableCell} style={{width: '20%'}}>{r.ranking < 0 ? '-' : r.tie_breaker_points}</span>
            <span className={classes.rotatingTableCell} style={{width: '20%'}}>{r.ranking < 0 ? '-' : r.matches_played}</span>
          </div>;
        })}
      <div className={'tableRowDiv'} />
    </ScrollingBody>];
  }


  return <Table className={classes.table}>
    <TableHead>
      <TableRow style={rowStyle}>
        <TableCell className={classes.tableCell}>Rank</TableCell>
        <TableCell className={classes.tableCell}>Team Number</TableCell>
        <TableCell className={classes.tableCell}>Team Name</TableCell>
        <TableCell className={classes.tableCell}>Ranking Points</TableCell>
        <TableCell className={classes.tableCell}>Tie Breaker Points</TableCell>
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
          <TableCell className={classes.tableCell}>
            <TextLink to={`/teams/summary/${r.team.number}`}>{r.team.number}</TextLink>
          </TableCell>
          <TableCell className={classes.tableCell}>{r.team.name}</TableCell>
          <TableCell className={classes.tableCell}>{r.ranking < 0 ? '-' : r.ranking_points}</TableCell>
          <TableCell className={classes.tableCell}>{r.ranking < 0 ? '-' : r.tie_breaker_points}</TableCell>
          {showRecord ? <TableCell className={classes.tableCell}>{r.ranking < 0 ? '-' : recordLine}</TableCell> : null}
          <TableCell className={classes.tableCell}>{r.ranking < 0 ? '-' : r.matches_played}</TableCell>
        </TableRow>;
      })}
    </TableBody>
  </Table>;
}

export default withStyles(styles)(rankingsTable);