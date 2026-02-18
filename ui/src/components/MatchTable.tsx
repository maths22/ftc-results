import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import MatchDetailsDialog from './MatchDetailsDialog';
import {styled} from '@mui/material/styles';
import {Match, useNavigate, useSearch} from '@tanstack/react-router';
import type {components} from "../api/first-v3";
import {Box} from "@mui/material";
import { useTeam } from '../api';
import { teamToStateName } from './util';
import { Temporal } from 'temporal-polyfill';

const plainColors = {
  red: '#fee',
  blue: '#eef'
};

const winningColors = {
  red: '#fdd',
  blue: '#ddf'
};

interface MatchOwnerState {
  win?: boolean,
  color?: 'red' | 'blue',
  alliance?: boolean,
  surrogate?: boolean
}

const MatchCell = styled(TableCell)<{ownerState?: MatchOwnerState}>(({theme, ownerState = {}}) => ({
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  textAlign: 'center',
  '&:last-child': {
    paddingRight: theme.spacing(1),
  },
  background: ownerState.color ? (ownerState.win ? winningColors[ownerState.color] : plainColors[ownerState.color]) : undefined,
  fontWeight: ownerState.alliance ? 'bold' : undefined,
  opacity: ownerState.surrogate ? '0.6' : undefined,
}));

const DisabledRow = styled(TableRow)(() => ({
  '& td': {
    textDecoration: 'line-through',
    color: 'rgba(0, 0, 0, 0.4)'
  },
  '& a': {
    textDecoration: 'line-through',
    color: 'rgba(0, 0, 0, 0.4)'
  }
}));

function MatchTeam({seasonYear, teamNumber, surrogate, link}: {seasonYear: string, teamNumber: string, surrogate?: boolean, link?: boolean}) {
    const { data: team } = useTeam(seasonYear, teamNumber);

  const Component = link ? TextLink : 'span';
  return <Component key={teamNumber} to={`/teams/${teamNumber}`} style={{flex: 1, display: 'flex', justifyContent: 'center'}}>
    <div style={{ display: 'flex', alignItems: 'center', width: '10em', textAlign: 'left'}}>
      <div className={`team-avatar team-${team?.stateProv}`} style={{marginRight: '0.25em', '--avatar-size': 30}}></div>
      {teamToStateName(team)}
      {surrogate ? '*' : ''}
    </div>
  </Component>;
}

function TraditionalMatchTable({seasonYear, matches, team, showMatchDetail, timezone}: {
  seasonYear: string,
  matches: components['schemas']['ApiV3AllianceMatch'][],
  showMatchDetail: (tournamentLevel: components["schemas"]["ApiV3TournamentLevel"], series: string, number: number) => void,
  team?: string,
  timezone: string
}) {
  const rowStyle = {height: '2rem'};

  const groupedMatches = Object.fromEntries(Object.entries(Object.groupBy(matches, m => m.tournamentLevel)).map(([key, matches]) => {
    return [key, matches.map((m) => {
      let isRedTeam, isSurrogate = false, idx = -1, result;
      const hasScores = 'red_score' in m && 'blue_score' in m && m.red_score != undefined && m.blue_score != undefined
      if(team) {
        isRedTeam = m.teams.redAlliance.teams.some(t => t.team.number == team);
      }

      if (team && hasScores) {
        isSurrogate = (isRedTeam ? m.teams.redAlliance.teams.find(t => t.team.number == team)?.surrogate : m.teams.blueAlliance.teams.find(t => t.team.number == team)?.surrogate) || false;
        if(m.red_score === m.blue_score) {
          result = 'T';
        } else if((isRedTeam && m.red_score! > m.blue_score!) || (!isRedTeam && m.red_score! < m.blue_score!)) {
          result = 'W';
        } else {
          result = 'L';
        }
      }

      const redOwnerState  = {
        color: 'red',
        win: m.matchResults?.winner == 'RED',
        alliance: team != undefined && isRedTeam,
        surrogate: isSurrogate
      } as const;
      const blueOwnerState = {
        color: 'blue',
        win: m.matchResults?.winner == 'BLUE',
        alliance: team != undefined && !isRedTeam,
        surrogate: isSurrogate
      } as const;

      const effectiveStartTime = m.startTime || m.scheduledStartTime
      const startTime = effectiveStartTime ? Temporal.ZonedDateTime.from(`${effectiveStartTime}[${timezone}]` ) : undefined;

      const matchTime = <span style={{fontStyle: m.startTime ? 'normal' : 'italic'}}>{startTime?.toLocaleString(undefined, {
              weekday: 'short',
              month: 'numeric',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric',
              timeZoneName: 'shortGeneric'
            })}</span>

      const showDetail = () => showMatchDetail(m.tournamentLevel, m.series.toString(), m.number);

      return [
        <TableRow key={`${m.tournamentLevel}-${m.series}-${m.number}`} style={rowStyle}>
          <MatchCell ownerState={{surrogate: isSurrogate}}>
            {m.tournamentLevel != 'PRACTICE' && m.matchResults ? <TextLink onClick={showDetail}>{m.shortName}</TextLink> : m.shortName}
            <Box sx={{ display: { xs: 'none', sm: 'block'}}}>{matchTime}</Box>
          </MatchCell>
          {team ? <MatchCell ownerState={{surrogate: isSurrogate}} sx={{ display: { xs: 'none', sm: 'table-cell'}}}>{m.matchResults ? result : '-'}</MatchCell> : null}
          <MatchCell ownerState={redOwnerState}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
              {m.teams.type == 'ApiV3AlliancePlayoffMatchParticipants' ? <span style={{display: 'flex', alignItems: 'center'}}>A{m.teams.redAlliance.seed}</span> : ''}
              {m.teams.redAlliance.teams.map(mp => <MatchTeam key={mp.team.number} seasonYear={seasonYear} teamNumber={mp.team.number} surrogate={mp.surrogate} link={mp.team.number !== team} />)}
            </Box>
          </MatchCell>
          <MatchCell ownerState={blueOwnerState}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
              {m.teams.type == 'ApiV3AlliancePlayoffMatchParticipants' ? <span style={{display: 'flex', alignItems: 'center'}}>A{m.teams.blueAlliance.seed}</span> : ''}
              {m.teams.blueAlliance.teams.map(mp => <MatchTeam key={mp.team.number} seasonYear={seasonYear} teamNumber={mp.team.number} surrogate={mp.surrogate} link={mp.team.number !== team} />)}
            </Box>
          </MatchCell>

          {m.tournamentLevel != 'PRACTICE' && m.matchResults ? <MatchCell ownerState={redOwnerState} sx={{ display: { xs: 'none', sm: 'table-cell'}}} onClick={showDetail}>
            <span>{m.matchResults.redScore}</span>
          </MatchCell> : null}
          {m.tournamentLevel != 'PRACTICE' && m.matchResults ? <MatchCell ownerState={blueOwnerState} sx={{ display: { xs: 'none', sm: 'table-cell'}}} onClick={showDetail}>
            <span>{m.matchResults.blueScore}</span>
          </MatchCell>: null}
          {m.tournamentLevel != 'PRACTICE' && !m.matchResults ? <MatchCell colSpan={2} sx={{ display: { xs: 'none', sm: 'table-cell'}}}>
            <span>Awaiting results</span>
          </MatchCell>: null}
          {m.tournamentLevel == 'PRACTICE' ? <MatchCell colSpan={2} sx={{ display: { xs: 'none', sm: 'table-cell'}}}>
            <span>N/A</span>
          </MatchCell> : null}
        </TableRow>,
        m.tournamentLevel == 'PRACTICE' ? null : <TableRow style={rowStyle} sx={{ display: { sm: 'none', xs: 'table-row'}}}>
          <TableCell>{matchTime}</TableCell>
          {m.matchResults ? <MatchCell ownerState={redOwnerState} onClick={showDetail}>
            <span>{m.matchResults.redScore}</span>
          </MatchCell> : null}
          {m.matchResults ? <MatchCell ownerState={blueOwnerState} onClick={showDetail}>
            <span>{m.matchResults.blueScore}</span>
          </MatchCell>: null}
          {!m.matchResults ? <MatchCell colSpan={2}>
            <span>Awaiting results</span>
          </MatchCell>: null}
        </TableRow>
      ];
    })];
  }));

  return <Table key={1} size="small">
    <TableHead>
      <TableRow style={rowStyle}>
        <MatchCell>Match</MatchCell>
        {team ? <MatchCell sx={{ display: { xs: 'none', sm: 'table-cell'}}}>Result</MatchCell> : null}
        <MatchCell>Red Alliance</MatchCell>
        <MatchCell>Blue Alliance</MatchCell>
        <MatchCell colSpan={2} sx={{ display: { xs: 'none', sm: 'table-cell'}}}>Scores</MatchCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {groupedMatches['PLAYOFF'] ? <TableRow style={rowStyle}>
        <MatchCell colSpan={5}>Playoff</MatchCell>
      </TableRow> : null}
      {groupedMatches['PLAYOFF'] ? groupedMatches['PLAYOFF'] : null}
      {groupedMatches['FINAL'] ? <TableRow style={rowStyle}>
        <MatchCell colSpan={5}>Finals</MatchCell>
      </TableRow> : null}
      {groupedMatches['FINAL'] ? groupedMatches['FINAL'] : null}
      {groupedMatches['SEMIFINAL'] ? <TableRow style={rowStyle}>
        <MatchCell colSpan={5}>Semi-Finals</MatchCell>
      </TableRow> : null}
      {groupedMatches['SEMIFINAL'] ? groupedMatches['SEMIFINAL'] : null}
      {groupedMatches['QUALIFICATION'] ? <TableRow style={rowStyle}>
        <MatchCell colSpan={5}>Qualifications</MatchCell>
      </TableRow> : null}
      {groupedMatches['QUALIFICATION'] ? groupedMatches['QUALIFICATION'] : null}
      {groupedMatches['PRACTICE'] ? <TableRow style={rowStyle}>
        <MatchCell colSpan={5}>Practice</MatchCell>
      </TableRow> : null}
      {groupedMatches['PRACTICE'] ? groupedMatches['PRACTICE'] : null}
    </TableBody>
  </Table>;
}

function RemoteMatchTable({seasonYear, matches, team, showMatchDetail}: {
  seasonYear: string,
  matches: components['schemas']['ApiV3SingleTeamMatch'][],
  showMatchDetail: (tournamentLevel: components["schemas"]["ApiV3TournamentLevel"], series: string, number: number) => void,
  team?: string
}) {
  const rowStyle = {height: '2rem'};

  return <Table sx={{minWidth: '30em'}} size="small">
    <TableHead>
      <TableRow style={rowStyle}>
        {team ? null : <MatchCell>Team</MatchCell> }
        <MatchCell>Match</MatchCell>
        <MatchCell>Score</MatchCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {matches.map((m) => {
        const RowElement = (m.teams.team.disqualified || !m.teams.team.onField) ? DisabledRow : TableRow;
        return <RowElement key={`${m.tournamentLevel}-${m.series}-${m.number}`} style={rowStyle}>
          {team ? null : <MatchCell>
            <TextLink to={`/teams/${m.teams.team.team.number}`}>{m.teams.team.team.displayNumber}</TextLink>
          </MatchCell>
          }
          <MatchCell>
            {m.matchResults ? <TextLink onClick={() => showMatchDetail(m.tournamentLevel, m.teams.team.team.number, m.number)}>#{m.number}</TextLink> : `#${m.number}`}
          </MatchCell>
          <MatchCell>
            <span>{!m.matchResults ? 'Awaiting results' : m.matchResults.score}</span>
          </MatchCell>
        </RowElement>;
      })}
    </TableBody>
  </Table>;
}

export default function MatchTable({seasonYear, event, matches, team, division}: {
  seasonYear: string,
  matches?: (components['schemas']['ApiV3Match'])[],
  event?: components['schemas']['ApiV3Event'] | components['schemas']['ApiV3SimpleEvent'],
  team?: string,
  division?: string
}) {
  const navigate = useNavigate();
  const search = useSearch({strict: false});
  const showMatchDetail = (tournamentLevel: components["schemas"]["ApiV3TournamentLevel"], series: string, number: number) =>
    navigate({ search: { ...search, matchDetails: `${division || event?.code}-${tournamentLevel}-${series}-${number}` } });

  if (!event || !matches || matches.length === 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>No matches are currently available</Typography>;
  }

  return <>
    {event.format == 'REMOTE' ?
        <RemoteMatchTable seasonYear={seasonYear} matches={matches as components['schemas']['ApiV3SingleTeamMatch'][]} team={team} showMatchDetail={showMatchDetail} /> :
        <TraditionalMatchTable seasonYear={seasonYear} matches={matches as components['schemas']['ApiV3AllianceMatch'][]} team={team} showMatchDetail={showMatchDetail} timezone={event.timezone}/>}
  </>;
}

