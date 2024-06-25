import TableRow from '@mui/material/TableRow/TableRow';
import TableCell from '@mui/material/TableCell/TableCell';
import Table from '@mui/material/Table/Table';
import TableHead from '@mui/material/TableHead/TableHead';
import TableBody from '@mui/material/TableBody/TableBody';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography/Typography';
import MatchDetailsDialog from './MatchDetailsDialog';
import Hidden from '@mui/material/Hidden/Hidden';
import {styled} from '@mui/material/styles';
import {useNavigate, useSearch} from '@tanstack/react-router';
import type {components} from "../api/v1";
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

function TraditionalMatchTable({matches, team, showMatchDetail}: {
  matches: components['schemas']['match'][],
  showMatchDetail: (name: string) => void,
  team?: number
}) {
  const rowStyle = {height: '2rem'};

  const groupedMatches = Object.fromEntries(Object.entries(Object.groupBy(matches, m => m.phase)).map(([key, matches]) => {
    return [key, matches.map((m) => {
      let isRedTeam, isSurrogate = false, idx = -1, result;
      const hasScores = 'red_score' in m && 'blue_score' in m && m.red_score != undefined && m.blue_score != undefined
      if (team && hasScores) {
        isRedTeam = m.red_alliance.includes(team);
        idx = isRedTeam ? m.red_alliance.indexOf(team) : m.blue_alliance.indexOf(team);
        isSurrogate = isRedTeam ? m.red_surrogate[idx] : m.blue_surrogate[idx];
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
        win: ('red_score' in m && 'blue_score' in m) ? m.red_score! > m.blue_score! : false,
        alliance: team != undefined && isRedTeam,
        surrogate: isSurrogate
      } as const;
      const blueOwnerState = {
        color: 'blue',
        win: ('red_score' in m && 'blue_score' in m) ? m.red_score! < m.blue_score! : false,
        alliance: team != undefined && !isRedTeam,
        surrogate: isSurrogate
      } as const;

      return [
        <TableRow key={m.id} style={rowStyle}>
          <MatchCell ownerState={{surrogate: isSurrogate}}>
            {m.played ? <TextLink onClick={() => showMatchDetail(m.name)}>{m.name}</TextLink> : m.name}
          </MatchCell>
          <Hidden smDown>
            {team ? <MatchCell ownerState={{surrogate: isSurrogate}}>{m.played ? result : '-'}</MatchCell> : null}
          </Hidden>
          <MatchCell ownerState={redOwnerState}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
              {m.red_alliance.map((t, idx) => {
                const Component = t === team ? 'span' : TextLink;
                return <Component key={t} to={`/teams/${t}`} style={{flex: 1}}>{t}
                  {m.red_surrogate[idx] ? '*' : ''}</Component>;
              })}
            </Box>
          </MatchCell>
          <MatchCell ownerState={blueOwnerState}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' } }}>
              {m.blue_alliance.map((t, idx) => {
                const Component = t === team ? 'span' : TextLink;
                return <Component key={t} to={`/teams/${t}`} style={{flex: 1}}>{t}
                  {m.blue_surrogate[idx] ? '*' : ''}</Component>
                  ;
              })}
            </Box>
          </MatchCell>

          <Hidden smDown>
            {m.played ? <MatchCell ownerState={redOwnerState}>
              <span>{m.red_score}</span>
            </MatchCell> : null}
            {m.played ? <MatchCell ownerState={blueOwnerState} >
              <span>{m.blue_score}</span>
            </MatchCell>: null}
            {!m.played ? <MatchCell colSpan={2}>
              <span>Awaiting results</span>
            </MatchCell>: null}
          </Hidden>
        </TableRow>,
        <Hidden smUp key={m.id + '_results'}>
          <TableRow style={rowStyle}>
            <TableCell />
            {m.played ? <MatchCell ownerState={redOwnerState}>
              <span>{m.red_score}</span>
            </MatchCell> : null}
            {m.played ? <MatchCell ownerState={blueOwnerState}>
              <span>{m.blue_score}</span>
            </MatchCell>: null}
            {!m.played ? <MatchCell colSpan={2}>
              <span>Awaiting results</span>
            </MatchCell>: null}
          </TableRow>
        </Hidden>
      ];
    })];
  }));

  return <Table key={1} size="small">
    <TableHead>
      <TableRow style={rowStyle}>
        <MatchCell>Match</MatchCell>
        <Hidden smDown>
          {team ? <MatchCell>Result</MatchCell> : null}
        </Hidden>
        <MatchCell>Red Alliance</MatchCell>
        <MatchCell>Blue Alliance</MatchCell>
        <Hidden smDown>
          <MatchCell colSpan={2} >Scores</MatchCell>
        </Hidden>
      </TableRow>
    </TableHead>
    <TableBody>
      {groupedMatches['interfinal'] ? <TableRow style={rowStyle}>
        <MatchCell colSpan={5}>Inter-division Finals</MatchCell>
      </TableRow> : null}
      {groupedMatches['interfinal'] ? groupedMatches['interfinal'] : null}
      {groupedMatches['final'] ? <TableRow style={rowStyle}>
        <MatchCell colSpan={5}>Finals</MatchCell>
      </TableRow> : null}
      {groupedMatches['final'] ? groupedMatches['final'] : null}
      {groupedMatches['semi'] ? <TableRow style={rowStyle}>
        <MatchCell colSpan={5}>Semi-Finals</MatchCell>
      </TableRow> : null}
      {groupedMatches['semi'] ? groupedMatches['semi'] : null}
      {groupedMatches['qual'] ? <TableRow style={rowStyle}>
        <MatchCell colSpan={5}>Qualifications</MatchCell>
      </TableRow> : null}
      {groupedMatches['qual'] ? groupedMatches['qual'] : null}
    </TableBody>
  </Table>;
}

function RemoteMatchTable({matches, team, showMatchDetail}: {
  matches: components['schemas']['remoteMatch'][],
  showMatchDetail: (name: string) => void,
  team?: number
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
        const RowElement = m.no_show ? DisabledRow : TableRow;
        return <RowElement key={m.id} style={rowStyle}>
          {team ? null : <MatchCell>
            <TextLink to={`/teams/${m.team}`}>{m.team}</TextLink>
          </MatchCell>
          }
          <MatchCell>
            {m.played ? <TextLink onClick={() => showMatchDetail(m.name)}>#{m.number}</TextLink> : `#${m.number}`}
          </MatchCell>
          <MatchCell>
            <span>{!m.played ? 'Awaiting results' : m.score}</span>
          </MatchCell>
        </RowElement>;
      })}
    </TableBody>
  </Table>;
}

export default function MatchTable({event, matches, team}: {
  matches?: (components['schemas']['match'] | components['schemas']['remoteMatch'])[],
  event?: components['schemas']['event'],
  team?: number
}) {
  const navigate = useNavigate();
  const search = useSearch({strict: false});
  const showMatchDetail = (match?: string) => navigate({ search: { ...search, match, event_id: team && match ? event?.id : undefined } });

  if (!event || !matches || matches.length === 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>No matches are currently available</Typography>;
  }

  return <>
    {event.remote ?
        <RemoteMatchTable matches={matches as components['schemas']['remoteMatch'][]} team={team} showMatchDetail={showMatchDetail} /> :
        <TraditionalMatchTable matches={matches as components['schemas']['match'][]} team={team} showMatchDetail={showMatchDetail} />}
    <MatchDetailsDialog event={event} matchName={'match' in search && (!team || ('event_id' in search && search.event_id == event.id)) ? search.match : undefined} onClose={() => showMatchDetail()}/>
  </>;
}

