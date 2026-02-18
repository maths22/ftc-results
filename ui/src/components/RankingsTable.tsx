import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import {teamToStateName, PaddedCell} from './util';
import type {components} from "../api/first-v3";
import {useTeam} from "../api";

function TeamInfo({seasonYear, number}: {seasonYear: string, number: string}) {
  const { data: team } = useTeam(seasonYear, number);

  return <>
    <PaddedCell>
      <TextLink to={`/teams/${number}`} style={{display: 'flex', alignItems: 'center'}}>
        <div className={`team-avatar team-${team?.stateProv}`} style={{marginRight: '0.25em', '--avatar-size': 30}}></div>
        {teamToStateName(team)}
      </TextLink>
    </PaddedCell>
  </>
}

export default function RankingsTable({seasonYear, rankings, showRecord, elims}: {
  seasonYear: string,
  rankings: components['schemas']['ApiV3Ranking'][],
  showRecord: boolean,
  elims: false
} ) {
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
          <PaddedCell>Team</PaddedCell>
        </>}
        <PaddedCell>RS</PaddedCell>
        <PaddedCell>POINTS</PaddedCell>
        <PaddedCell>BASE</PaddedCell>
        {showRecord ? <PaddedCell>Record (W-L-T)</PaddedCell> : null}
        <PaddedCell>Matches Played</PaddedCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {rankings.map((r) => {
        let recordLine;
        if(showRecord){
          recordLine = `${r.wins}-${r.losses}-${r.ties}`;
        }
        return <TableRow key={r.rank} style={rowStyle}>
          <PaddedCell>{r.rank < 0 ? 'NP' : r.rank}</PaddedCell>
          {elims ? <>
            <PaddedCell>TODO IF EXISTS</PaddedCell>
          </> : <TeamInfo seasonYear={seasonYear} number={r.team.number} />}
          <PaddedCell>{r.rank < 0 ? '-' : Number(r.sortOrders[0]).toFixed(2)}</PaddedCell>
          <PaddedCell>{r.rank < 0 ? '-' : Number(r.sortOrders[1]).toFixed(2)}</PaddedCell>
          <PaddedCell>{r.rank < 0 ? '-' : Number(r.sortOrders[2]).toFixed(2)}</PaddedCell>
          {showRecord ? <PaddedCell>{r.rank < 0 ? '-' : recordLine}</PaddedCell> : null}
          <PaddedCell>{r.rank < 0 ? '-' : r.matchesPlayed}</PaddedCell>
        </TableRow>;
      })}
    </TableBody>
  </Table>;
}
