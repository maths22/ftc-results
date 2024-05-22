import TableRow from '@mui/material/TableRow/TableRow';
import Table from '@mui/material/Table/Table';
import TableHead from '@mui/material/TableHead/TableHead';
import TableBody from '@mui/material/TableBody/TableBody';
import React from 'react';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import {PaddedCell} from './util';

export default function RankingsTable({rankings, showRecord, elims}) {
  if(!rankings || rankings.length === 0) {
    if(elims) {
      return null;
    }
    return <Typography variant="body1" style={{textAlign: 'center'}}>Rankings are not currently available</Typography>;
  }

  const rowStyle = { height: '2rem' };

  return <Table sx={{minWidth: '20em'}} size="small">
    <TableHead>
      <TableRow style={rowStyle}>
        <PaddedCell>Rank</PaddedCell>
        {elims ? <>
          <PaddedCell>Alliance</PaddedCell>
        </> : <>
          <PaddedCell>Team Number</PaddedCell>
          <PaddedCell>Team Name</PaddedCell>
        </>}
        <PaddedCell>Ranking Points</PaddedCell>
        <PaddedCell>Tie Breaker Points 1</PaddedCell>
        <PaddedCell>Tie Breaker Points 2</PaddedCell>
        {showRecord ? <PaddedCell>Record (W-L-T)</PaddedCell> : null}
        <PaddedCell>Matches Played</PaddedCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rankings.map((r) => {
        let recordLine;
        if(showRecord){
          recordLine = `${r.record.win}-${r.record.loss}-${r.record.tie}`;
        }
        return <TableRow key={r.id} style={rowStyle}>
          <PaddedCell>{r.ranking < 0 ? 'NP' : r.ranking}</PaddedCell>
          {elims ? <>
            <PaddedCell>{r.alliance.seed}</PaddedCell>
          </> : <>
            <PaddedCell>
              <TextLink to={`/teams/summary/${r.team.number}`}>{r.team.number}</TextLink>
            </PaddedCell>
            <PaddedCell>{r.team.name}</PaddedCell>
          </>}
          <PaddedCell>{r.ranking < 0 ? '-' : Number(r.sort_order1).toFixed(2)}</PaddedCell>
          <PaddedCell>{r.ranking < 0 ? '-' : Number(r.sort_order2).toFixed(2)}</PaddedCell>
          <PaddedCell>{r.ranking < 0 ? '-' : Number(r.sort_order3).toFixed(2)}</PaddedCell>
          {showRecord ? <PaddedCell>{r.ranking < 0 ? '-' : recordLine}</PaddedCell> : null}
          <PaddedCell>{r.ranking < 0 ? '-' : r.matches_played}</PaddedCell>
        </TableRow>;
      })}
    </TableBody>
  </Table>;
}
