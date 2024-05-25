import TableRow from '@mui/material/TableRow/TableRow';
import Table from '@mui/material/Table/Table';
import TableHead from '@mui/material/TableHead/TableHead';
import TableBody from '@mui/material/TableBody/TableBody';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import {PaddedCell} from './util';
import type {components} from "../api/v1";
import {useTeam} from "../api";

function TeamInfo({number}: {number: number}) {
  const { data: team } = useTeam(number);

  return <>
    <PaddedCell>
      <TextLink to={`/teams/${number}`}>{number}</TextLink>
    </PaddedCell>
    <PaddedCell>{team?.name}</PaddedCell>
  </>
}

export default function RankingsTable({rankings, showRecord, elims}: {
  rankings: components['schemas']['ranking'][],
  showRecord: boolean,
  elims: false
} | {
  rankings?: components['schemas']['elimRanking'][],
  showRecord: boolean,
  elims: true
}) {
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
            <PaddedCell>{(r as components['schemas']['elimRanking']).alliance}</PaddedCell>
          </> : <TeamInfo number={(r as components['schemas']['ranking']).team} />}
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
