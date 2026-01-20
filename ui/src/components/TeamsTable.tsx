import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import {abbrevToState, PaddedCell} from './util';
import {createLazyRoute, useNavigate, useParams, useSearch} from "@tanstack/react-router";
import {GOV_CUP_CODE, GOV_CUP_SEASON, useEvent, useEventTeams, useTeam} from "../api";
import type {components} from "../api/first-v3";
import LoadingSpinner from "./LoadingSpinner";

function TeamRow({seasonYear, event, participant, showDivisionAssignments, selectDivision}: {
  seasonYear: string,
  event: components['schemas']['ApiV3Event'],
  participant: components['schemas']['ApiV3EventParticipant'],
  showDivisionAssignments: boolean,
  selectDivision: (div: string) => void
}) {
  const division = event.divisions.find((d) => d.eventCode === participant.divisionEventCode);
  const team = participant.team;
  return <TableRow style={{ height: '2rem' }}>
    { showDivisionAssignments && division ? <PaddedCell>
      <TextLink onClick={() => selectDivision(division.eventCode)}>{division.name}</TextLink>
    </PaddedCell> : ( showDivisionAssignments ? <PaddedCell/> : null) }
    <PaddedCell>
      <TextLink to={`/teams/${team.number}`} style={{display: 'flex', alignItems: 'center'}}>
        <div className={`team-avatar team-${team.stateProv}`} style={{marginRight: '0.5em', '--avatar-size': 40}}></div>
        {abbrevToState(team.stateProv)}
      </TextLink>
      <Typography sx={{ display: { sm: 'none', xs: 'block'}}}>
        {[team.city, team.stateProv, team.country].join(', ')}
      </Typography>
    </PaddedCell>
    <PaddedCell sx={{ display: { xs: 'none', sm: 'table-cell'}}}>{[team.city, team.stateProv, team.country].join(', ')}</PaddedCell>
    <PaddedCell>{team.affiliations}</PaddedCell>
  </TableRow>;
}

export default function TeamsTable() {
  const seasonYear = GOV_CUP_SEASON;
  const slug = GOV_CUP_CODE;
  const { division } = useSearch({ from: '/eventSummary' });
  const navigate = useNavigate({ from: '/eventSummary' });

  const { data: event, isLoading: eventIsLoading } = useEvent(seasonYear, slug);
  const { data: eventTeams, isLoading } = useEventTeams(seasonYear, division || slug);


  function selectDivision(div: string) {
    navigate({ search: {division: div } });
  }

  if(eventIsLoading || isLoading) {
    return <LoadingSpinner />;
  }

  if(!event || !eventTeams || eventTeams.participants.length == 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>Team list is not currently available</Typography>;
  }

  const showDivisionAssignments = event.divisions.length > 0 && !division
  const sortedTeams = [...eventTeams.participants].sort((a, b) => abbrevToState(a.team.stateProv)!.localeCompare(abbrevToState(b.team.stateProv)!));

  return <Table sx={{minWidth: '20em'}} size="small">
    <TableHead>
      <TableRow style={{ height: '2rem' }}>
        { showDivisionAssignments ? <PaddedCell>Division</PaddedCell> : null }
        <PaddedCell>Team</PaddedCell>
        <PaddedCell sx={{ display: { xs: 'none', sm: 'table-cell'}}}>Location</PaddedCell>
        <PaddedCell>Affiliations</PaddedCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {sortedTeams.map((participant) =>
          <TeamRow key={participant.team.number} seasonYear={seasonYear} event={event} participant={participant} showDivisionAssignments={showDivisionAssignments} selectDivision={selectDivision} />)}
    </TableBody>
  </Table>;
}

export const IndexRoute = createLazyRoute("/")({
  component: TeamsTable
})

export const Route = createLazyRoute("/teams")({
  component: TeamsTable
})

