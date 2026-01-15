import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import MatchDetailsDialog from './MatchDetailsDialog';
import {styled} from '@mui/material/styles';
import {useNavigate, useSearch} from '@tanstack/react-router';
import type {components} from "../api/first-v3";
import {Box} from "@mui/material";

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

function TraditionalMatchTable({seasonYear, matches, team, showMatchDetail, practice}: {
  seasonYear: string,
  matches: components['schemas']['ApiV3AllianceMatch'][],
  showMatchDetail: (tournamentLevel: components["schemas"]["ApiV3TournamentLevel"], series: string, number: number) => void,
  team?: string,
  practice?: boolean
}) {
  const rowStyle = {height: '2rem'};

  const groupedMatches = Object.fromEntries(Object.entries(Object.groupBy(matches, m => m.tournamentLevel)).map(([key, matches]) => {
    return [key, matches.map((m) => {
      let isRedTeam, isSurrogate = false, idx = -1, result;
      const hasScores = 'red_score' in m && 'blue_score' in m && m.red_score != undefined && m.blue_score != undefined
      if (team && hasScores) {
        isRedTeam = m.teams.redAlliance.teams.some(t => t.team.number == team);
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

      return [
        <TableRow key={`${m.tournamentLevel}-${m.series}-${m.number}`} style={rowStyle}>
          <MatchCell ownerState={{surrogate: isSurrogate}}>
            {m.matchResults ? <TextLink onClick={() => showMatchDetail(m.tournamentLevel, m.series.toString(), m.number)}>{m.shortName}</TextLink> : m.shortName}
          </MatchCell>
          {team ? <MatchCell ownerState={{surrogate: isSurrogate}} sx={{ display: { xs: 'none', sm: 'table-cell'}}}>{m.matchResults ? result : '-'}</MatchCell> : null}
          <MatchCell ownerState={redOwnerState}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
              {m.teams.redAlliance.teams.map(mp => {
                const Component = mp.team.number === team ? 'span' : TextLink;
                return <Component key={mp.team.number} to={`/${seasonYear}/teams/${mp.team.number}`} style={{flex: 1}}>{mp.team.displayNumber}
                  {mp.surrogate ? '*' : ''}</Component>;
              })}
            </Box>
          </MatchCell>
          <MatchCell ownerState={blueOwnerState}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
              {m.teams.blueAlliance.teams.map(mp => {
                const Component = mp.team.number === team ? 'span' : TextLink;
                return <Component key={mp.team.number} to={`/${seasonYear}/teams/${mp.team.number}`} style={{flex: 1}}>{mp.team.displayNumber}
                  {mp.surrogate ? '*' : ''}</Component>;
              })}
            </Box>
          </MatchCell>

          {!practice && m.matchResults ? <MatchCell ownerState={redOwnerState} sx={{ display: { xs: 'none', sm: 'table-cell'}}}>
            <span>{m.matchResults.redScore}</span>
          </MatchCell> : null}
          {!practice && m.matchResults ? <MatchCell ownerState={blueOwnerState} sx={{ display: { xs: 'none', sm: 'table-cell'}}}>
            <span>{m.matchResults.blueScore}</span>
          </MatchCell>: null}
          {!practice && !m.matchResults ? <MatchCell colSpan={2} sx={{ display: { xs: 'none', sm: 'table-cell'}}}>
            <span>Awaiting results</span>
          </MatchCell>: null}
        </TableRow>,
        practice ? null : <TableRow style={rowStyle} sx={{ display: { sm: 'none', xs: 'table-row'}}}>
          <TableCell />
          {m.matchResults ? <MatchCell ownerState={redOwnerState}>
            <span>{m.matchResults.redScore}</span>
          </MatchCell> : null}
          {m.matchResults ? <MatchCell ownerState={blueOwnerState}>
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
        {practice ? null : <MatchCell colSpan={2} sx={{ display: { xs: 'none', sm: 'table-cell'}}}>Scores</MatchCell>}
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
            <TextLink to={`/${seasonYear}/teams/${m.teams.team.team.number}`}>{m.teams.team.team.displayNumber}</TextLink>
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

export default function MatchTable({seasonYear, event, matches, team, practice, division}: {
  seasonYear: string,
  matches?: (components['schemas']['ApiV3Match'])[],
  event?: components['schemas']['ApiV3Event'] | components['schemas']['ApiV3SimpleEvent'],
  team?: string,
  practice?: boolean,
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
        <TraditionalMatchTable seasonYear={seasonYear} matches={matches as components['schemas']['ApiV3AllianceMatch'][]} team={team} showMatchDetail={showMatchDetail} practice={practice} />}
  </>;
}

