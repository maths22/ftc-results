import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import {PaddedCell} from './util';
import {useTeam} from "../api";
import type {components} from "../api/v1";

function AllianceTeam({number} : {number: number}) {
  const { data: team } = useTeam(number);

  return <PaddedCell key={number}>
    <TextLink to={`/teams/${number}`}>{number}{team ? ` (${team.name})` : ''}</TextLink>
  </PaddedCell>
}

export default function AlliancesTable({alliances}: {
  alliances: components['schemas']['alliance'][]
}) {
  if (alliances.length === 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>Alliances are not currently available</Typography>;
  }

  const rowStyle = {height: '2rem'};

  const colCount = Math.max(3, ...alliances.map((a) => a.teams.length));
  return <Table sx={{minWidth: '20em'}} key={1}>
    <TableHead>
      <TableRow style={rowStyle}>
        <PaddedCell>Seed</PaddedCell>
        <PaddedCell>Captain</PaddedCell>
        <PaddedCell>First Pick</PaddedCell>
        <PaddedCell>Second Pick</PaddedCell>
        {colCount > 3 ? <PaddedCell>Backup</PaddedCell> : null}
      </TableRow>
    </TableHead>
    <TableBody>
      {alliances.map((a) => {
        return <TableRow key={a.id} style={rowStyle}>
          <PaddedCell>{a.seed}</PaddedCell>
          { a.teams.map((team) => <AllianceTeam key={team} number={team} /> )}
          {Array(colCount - a.teams.length).fill(1).map((id) => <PaddedCell key={id}>&nbsp;</PaddedCell>)}
        </TableRow>;
      })}
    </TableBody>
  </Table>;
}