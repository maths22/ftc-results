import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import {teamToStateName, CompactCell, PaddedCell} from './util';
import {useTeam} from "../api";
import type {components} from "../api/first-v3";
import TableCell from '@mui/material/TableCell';

function AllianceTeam({seasonYear, number}: {seasonYear: string, number: string}) {
  const { data: team } = useTeam(seasonYear, number);

  return <CompactCell key={number}>
    <TextLink to={`/teams/${number}`} style={{display: 'flex', alignItems: 'center'}}>
      <div className={`team-avatar team-${team?.stateProv}`} style={{marginRight: '0.5em', '--avatar-size': 30}}></div>
      {teamToStateName(team)}
    </TextLink>
  </CompactCell>
}

export default function AlliancesTable({seasonYear, alliances}: {
  seasonYear: string,
  alliances: components['schemas']['ApiV3PlayoffAlliance'][]
}) {
  if (alliances.length === 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>Alliances are not currently available</Typography>;
  }

  const rowStyle = {height: '2rem'};

  const colCount = Math.max(2, ...alliances.map((a) => a.teams.length));
  return <Table sx={{minWidth: '20em'}} key={1}>
    <TableHead>
      <TableRow style={rowStyle}>
        <CompactCell>Seed</CompactCell>
        <CompactCell>Captain</CompactCell>
        <CompactCell>{colCount == 2 ? 'Partner' : 'First Pick'}</CompactCell>
        {colCount > 2 ? <CompactCell>Second Pick</CompactCell> : null}
        {colCount > 3 ? <CompactCell>Backup</CompactCell> : null}
      </TableRow>
    </TableHead>
    <TableBody>
      {alliances.map((a) => {
        return <TableRow key={a.seed} style={rowStyle}>
          <CompactCell>{a.seed}</CompactCell>
          { a.teams.map((team) => <AllianceTeam key={team.number} seasonYear={seasonYear} number={team.number} /> )}
          {Array(colCount - a.teams.length).fill(1).map((id) => <CompactCell key={id}>&nbsp;</CompactCell>)}
        </TableRow>;
      })}
    </TableBody>
  </Table>;
}