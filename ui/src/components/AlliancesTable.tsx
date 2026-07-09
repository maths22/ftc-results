import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import {CompactCell} from './util';
import {useTeam} from "../api";
import type {components} from "../api/v1";

function AllianceTeam({number} : {number: number}) {
  const { data: team } = useTeam(number);

  return <CompactCell key={number}>
    <TextLink to={`/teams/${number}`} style={{display: 'flex', alignItems: 'center'}}>
      <div className={`team-avatar team-${number}`} style={{marginRight: '0.5em', '--avatar-size': 30}}></div>
      {number}{team ? ` (${team.name})` : ''}
    </TextLink>
  </CompactCell>
}

export default function AlliancesTable({alliances}: {
  alliances: components['schemas']['alliance'][]
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
        return <TableRow key={a.id} style={rowStyle}>
          <CompactCell>{a.seed}</CompactCell>
          { a.teams.map((team) => <AllianceTeam key={team} number={team} /> )}
          {Array(colCount - a.teams.length).fill(1).map((id) => <CompactCell key={id}>&nbsp;</CompactCell>)}
        </TableRow>;
      })}
    </TableBody>
  </Table>;
}