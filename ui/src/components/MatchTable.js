import mapValues from 'lodash/mapValues';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import TableRow from '@mui/material/TableRow/TableRow';
import TableCell from '@mui/material/TableCell/TableCell';
import Table from '@mui/material/Table/Table';
import TableHead from '@mui/material/TableHead/TableHead';
import TableBody from '@mui/material/TableBody/TableBody';
import React from 'react';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography/Typography';
import MatchDetailsDialog from './MatchDetailsDialog';
import Hidden from '@mui/material/Hidden/Hidden';
import {push} from 'connected-react-router';
import {connect} from 'react-redux';
import queryString from 'query-string';
import {styled} from '@mui/material/styles';

const plainColors = {
  red: '#fee',
  blue: '#eef'
};

const winningColors = {
  red: '#fdd',
  blue: '#ddf'
};

const MatchCell = styled(TableCell)(({theme, ownerState = {}}) => ({
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

class MatchTable extends React.Component {
  showDetails = (id) => {
    const values = queryString.parse(this.props.search);
    values['match'] = id;
    this.props.push({ search: queryString.stringify(values) });
  };

  hideDetails = () => {
    const values = queryString.parse(this.props.search);
    delete values['match'];
    this.props.push({ search: queryString.stringify(values) });
  };

  render() {
    const {remote} = this.props;
    return remote ? this.renderRemote() : this.renderTraditional();
  }

  renderRemote() {
    const {matches, team, search} = this.props;
    const values = queryString.parse(search);
    const matchNum = parseInt(values['match']);
    const selectedMatch = matchNum && (matches.some(m => m.id == matchNum)) ? matchNum : null;

    if (matches.length === 0) {
      return <Typography variant="body1" style={{textAlign: 'center'}}>No matches are currently available</Typography>;
    }

    const rowStyle = {height: '2rem'};

    return [<Table key={1} sx={{minWidth: '30em'}} size="small">
    <TableHead>
      <TableRow style={rowStyle}>
        {team ? null : <MatchCell>Team</MatchCell> }
        <MatchCell>Match</MatchCell>
        <MatchCell>Score</MatchCell>
      </TableRow>
    </TableHead>
    <TableBody>
    {sortBy(matches, ['team', 'number']).map((m) => {
      const RowElement = m.no_show ? DisabledRow : TableRow;
      return <RowElement key={m.id} style={rowStyle}>
          {team ? null : <MatchCell>
              <TextLink to={`/teams/summary/${m.team}`}>{m.team}</TextLink>
            </MatchCell>
          }
          <MatchCell>
            {m.played ? <TextLink onClick={() => this.showDetails(m.id)}>#{m.number}</TextLink> : `#${m.number}`}
          </MatchCell>
          <MatchCell>
            <span>{!m.played ? 'Awaiting results' : m.score}</span>
          </MatchCell>
        </RowElement>;
    })}
    </TableBody>
  </Table>, <MatchDetailsDialog key={2} id={selectedMatch} onClose={() => this.hideDetails()}/>];

  }

  renderTraditional() {
    const {matches, team, search} = this.props;
    const values = queryString.parse(search);
    const matchNum = parseInt(values['match']);
    const selectedMatch = matchNum && (matches.some(m => m.id == matchNum)) ? matchNum : null;
    if (matches.length === 0) {
      return <Typography variant="body1" style={{textAlign: 'center'}}>No matches are currently available</Typography>;
    }

    const rowStyle = {height: '2rem'};

    const prefixes = {'qual': 'Q-', 'semi': 'SF-', 'final': 'F-', 'interfinal': 'IF-'};

    const groupedMatches = mapValues(groupBy(sortBy(matches, ['phase', 'series', 'number']), 'phase'), (matches) => {
      return matches.map((m) => {
        const matchDisp = prefixes[m.phase] + (m.series ? (m.series + '-') : '') + m.number;

        let isRedTeam, isSurrogate = false, idx = -1, result;
        if (team) {
          isRedTeam = m.red_alliance.includes(team);
          idx = isRedTeam ? m.red_alliance.indexOf(team) : m.blue_alliance.indexOf(team);
          isSurrogate = isRedTeam ? m.red_surrogate[idx] : m.blue_surrogate[idx];
          if(m.red_score === m.blue_score) {
            result = 'T';
          } else if((isRedTeam && m.red_score > m.blue_score) || (!isRedTeam && m.red_score < m.blue_score)) {
            result = 'W';
          } else {
            result = 'L';
          }
        }

        const redOwnerState = {
          color: 'red',
          win: m.red_score > m.blue_score,
          alliance: team && isRedTeam,
          surrogate: isSurrogate
        };
        const blueOwnerState = {
          color: 'blue',
          win: m.red_score < m.blue_score,
          alliance: team && !isRedTeam,
          surrogate: isSurrogate
        };

        return [
          <TableRow key={m.id} style={rowStyle}>
            <MatchCell ownerState={{surrogate: isSurrogate}}>
              {m.played ? <TextLink onClick={() => this.showDetails(m.id)}>{matchDisp}</TextLink> : matchDisp}
            </MatchCell>
            <Hidden smDown>
              {team ? <MatchCell ownerState={{surrogate: isSurrogate}}>{m.played ? result : '-'}</MatchCell> : null}
            </Hidden>
            <MatchCell ownerState={redOwnerState}>
              <div style={{display: 'flex'}}>
                {m.red_alliance.map((t, idx) => {
                  const Component = t === team ? 'span' : TextLink;
                  return <Component key={t} to={`/teams/summary/${t}`} style={{flex: 1}}>{t}
                      {m.red_surrogate[idx] ? '*' : ''}</Component>;
                })}
              </div>
            </MatchCell>
            <MatchCell ownerState={blueOwnerState}>
              <div style={{display: 'flex'}}>
                {m.blue_alliance.map((t, idx) => {
                  const Component = t === team ? 'span' : TextLink;
                  return <Component key={t} to={`/teams/summary/${t}`} style={{flex: 1}}>{t}
                      {m.blue_surrogate[idx] ? '*' : ''}</Component>
                  ;
                })}
              </div>
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
          <Hidden mdUp>
            <TableRow key={m.id + '_results'} style={rowStyle}>
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
      });
    });

    return [<Table key={1} sx={{minWidth: '30em'}} size="small">
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
    </Table>, <MatchDetailsDialog key={2} id={selectedMatch} onClose={() => this.hideDetails()}/>];
  }
}

const mapStateToProps = (state) => ({
  search: state.router.location.search,
});

const mapDispatchToProps = {
  push,
};


export default connect(mapStateToProps, mapDispatchToProps)(MatchTable);