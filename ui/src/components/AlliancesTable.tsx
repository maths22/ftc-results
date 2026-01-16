import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import {abbrevToState, PaddedCell} from './util';
import {useTeam} from "../api";
import type {components} from "../api/first-v3";

function AllianceTeam({seasonYear, number}: {seasonYear: string, number: string}) {
  const { data: team } = useTeam(seasonYear, number);

  return <PaddedCell key={number}>
    <TextLink to={`/${seasonYear}/teams/${number}`} style={{display: 'flex', alignItems: 'center'}}>
      <div className={`team-avatar team-${team?.stateProv}`} style={{marginRight: '0.5em', '--avatar-size': 30}}></div>
      {abbrevToState(team?.stateProv)}
    </TextLink>
  </PaddedCell>
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
        <PaddedCell>Seed</PaddedCell>
        <PaddedCell>Captain</PaddedCell>
        <PaddedCell>{colCount == 2 ? 'Partner' : 'First Pick'}</PaddedCell>
        {colCount > 2 ? <PaddedCell>Second Pick</PaddedCell> : null}
        {colCount > 3 ? <PaddedCell>Backup</PaddedCell> : null}
      </TableRow>
    </TableHead>
    <TableBody>
      {alliances.map((a) => {
        return <TableRow key={a.seed} style={rowStyle}>
          <PaddedCell>{a.seed}</PaddedCell>
          { a.teams.map((team) => <AllianceTeam key={team.number} seasonYear={seasonYear} number={team.number} /> )}
          {Array(colCount - a.teams.length).fill(1).map((id) => <PaddedCell key={id}>&nbsp;</PaddedCell>)}
        </TableRow>;
      })}
    </TableBody>
  </Table>;
}