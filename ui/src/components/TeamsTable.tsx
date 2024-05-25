import TableRow from '@mui/material/TableRow/TableRow';
import Table from '@mui/material/Table/Table';
import TableHead from '@mui/material/TableHead/TableHead';
import TableBody from '@mui/material/TableBody/TableBody';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import {PaddedCell} from './util';
import {useNavigate, useParams, useSearch} from "@tanstack/react-router";
import {useEvent, useEventTeams, useTeam} from "../api";
import type {components} from "../api/v1";
import LoadingSpinner from "./LoadingSpinner";

function TeamRow({event, team, showDivisionAssignments, selectDivision}: {
  event: components['schemas']['event'],
  team: { number: number, division: string | null},
  showDivisionAssignments: boolean,
  selectDivision: (div: string) => void
}) {
  const { data: teamData } = useTeam(team.number);

  if(!teamData) {
    return null;
  }
  const division = event.divisions.find((d) => d.slug === team.division);
  return <TableRow style={{ height: '2rem' }}>
    { showDivisionAssignments && division ? <PaddedCell>
      <TextLink onClick={() => selectDivision(division.slug)}>{division.name}</TextLink>
    </PaddedCell> : ( showDivisionAssignments ? <PaddedCell/> : null) }
    <PaddedCell>
      <TextLink to={`/teams/${team.number}`}>{team.number}</TextLink>
    </PaddedCell>
    <PaddedCell>{teamData.name}</PaddedCell>
    <PaddedCell>{[teamData.city, teamData.state, teamData.country].join(', ')}</PaddedCell>
    <PaddedCell>{teamData.organization ? [...new Set(teamData.organization.split('&').map((s) => s.trim()))].join('\n') : null}</PaddedCell>
  </TableRow>;
}

export default function TeamsTable() {
  const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
  const { division } = useSearch({ from: '/$season/events/$slug' });
  const navigate = useNavigate();

  const { data: event, isLoading: eventIsLoading } = useEvent(seasonYear, slug);
  const { data: eventTeams, isLoading } = useEventTeams(seasonYear, slug);

  function selectDivision(div: string) {
    navigate({ search: {division: div } });
  }

  if(eventIsLoading || isLoading) {
    return <LoadingSpinner />;
  }

  if(!event || !eventTeams || eventTeams.length == 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>Team list is not currently available</Typography>;
  }

  const showDivisionAssignments = event.divisions.length > 0 && !division

  return <Table sx={{minWidth: '20em'}} size="small">
    <TableHead>
      <TableRow style={{ height: '2rem' }}>
        { showDivisionAssignments ? <PaddedCell>Division</PaddedCell> : null }
        <PaddedCell>Team Number</PaddedCell>
        <PaddedCell>Team Name</PaddedCell>
        <PaddedCell>Location</PaddedCell>
        <PaddedCell>Organization</PaddedCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {eventTeams.sort((a, b) => a.number - b.number).map((td) =>
          <TeamRow key={td.number} event={event} team={td} showDivisionAssignments={showDivisionAssignments} selectDivision={selectDivision} />)}
    </TableBody>
  </Table>;
}
