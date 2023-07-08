import mapValues from 'lodash/mapValues';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import classNames from 'classnames';
import TableRow from '@mui/material/TableRow/TableRow';
import TableCell from '@mui/material/TableCell/TableCell';
import Table from '@mui/material/Table/Table';
import TableHead from '@mui/material/TableHead/TableHead';
import TableBody from '@mui/material/TableBody/TableBody';
import React from 'react';
import withStyles from '@mui/styles/withStyles';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography/Typography';
import MatchDetailsDialog from './MatchDetailsDialog';
import Hidden from '@mui/material/Hidden/Hidden';
import {push} from 'connected-react-router';
import {connect} from 'react-redux';
import queryString from 'query-string';

const styles = (theme) => ({
  table: {
    minWidth: '30em',
  },
  tableCell: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    textAlign: 'center',
    '&:last-child': {
      paddingRight: theme.spacing(1),
    }
  },
  flexCell: {
    display: 'flex'
  },
  teamNumber: {
    flex: 1
  },
  redCell: {
    background: '#fee',
  },
  blueCell: {
    background: '#eef',
  },
  redWinningCell: {
    background: '#fdd',
  },
  blueWinningCell: {
    background: '#ddf',
  },
  allianceCell: {
    fontWeight: 'bold',
  },
  surrogateCell: {
    opacity: '0.6'
  },
  disabledRow: {
    '& td': {
      textDecoration: 'line-through',
      color: 'rgba(0, 0, 0, 0.4)'
    },
    '& a': {
      textDecoration: 'line-through',
      color: 'rgba(0, 0, 0, 0.4)'
    }
  }
});

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
    const {matches, team, classes, search} = this.props;
    const values = queryString.parse(search);
    const matchNum = parseInt(values['match']);
    const selectedMatch = matchNum && (matches.some(m => m.id == matchNum)) ? matchNum : null;

    if (matches.length === 0) {
      return <Typography variant="body1" style={{textAlign: 'center'}}>No matches are currently available</Typography>;
    }

    const rowStyle = {height: '2rem'};

    return [<Table key={1} className={classes.table} size="small">
    <TableHead>
      <TableRow style={rowStyle}>
        {team ? null : <TableCell className={classes.tableCell}>Team</TableCell> }
        <TableCell className={classes.tableCell}>Match</TableCell>
        <TableCell className={classes.tableCell}>Score</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
    {sortBy(matches, ['team', 'number']).map((m) => {
      return <TableRow key={m.id} style={rowStyle} className={m.no_show ? classes.disabledRow : null}>
          {team ? null : <TableCell className={classes.tableCell}>
              <TextLink to={`/teams/summary/${m.team}`}>{m.team}</TextLink>
            </TableCell>
          }
          <TableCell className={classes.tableCell}>
            {m.played ? <TextLink onClick={() => this.showDetails(m.id)}>#{m.number}</TextLink> : `#${m.number}`}
          </TableCell>
          <TableCell className={classes.tableCell}>
            <span>{!m.played ? 'Awaiting results' : m.score}</span>
          </TableCell>
        </TableRow>;
    })}
    </TableBody>
  </Table>, <MatchDetailsDialog key={2} id={selectedMatch} onClose={() => this.hideDetails()}/>];

  }

  renderTraditional() {
    const {matches, team, classes, search} = this.props;
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

        const redClassnames = classNames(classes.tableCell, classes.redCell, {
          [classes.redWinningCell]: m.red_score > m.blue_score,
          [classes.allianceCell]: team && isRedTeam,
          [classes.surrogateCell]: isSurrogate,
        });
        const blueClassnames = classNames(classes.tableCell, classes.blueCell, {
          [classes.blueWinningCell]: m.red_score < m.blue_score,
          [classes.allianceCell]: team && !isRedTeam,
          [classes.surrogateCell]: isSurrogate,
        });

        return (
          <TableRow key={m.id} style={rowStyle}>
            <TableCell
                className={classNames(classes.tableCell, {[classes.surrogateCell]: isSurrogate})}>
              {m.played ? <TextLink onClick={() => this.showDetails(m.id)}>{matchDisp}</TextLink> : matchDisp}
            </TableCell>
            <Hidden smDown>
              {team ? <TableCell className={classNames(classes.tableCell, {[classes.surrogateCell]: isSurrogate})}>{m.played ? result : '-'}</TableCell> : null}
            </Hidden>
            <TableCell className={redClassnames}>
              <div className={classes.flexCell}>
                {m.red_alliance.map((t, idx) => {
                  const Component = t === team ? 'span' : TextLink;
                  return <Component key={t} to={`/teams/summary/${t}`} className={classes.teamNumber}>{t}
                      {m.red_surrogate[idx] ? '*' : ''}</Component>;
                })}
              </div>
            </TableCell>
            <TableCell className={blueClassnames}>
              <div className={classes.flexCell}>
                {m.blue_alliance.map((t, idx) => {
                  const Component = t === team ? 'span' : TextLink;
                  return <Component key={t} to={`/teams/summary/${t}`} className={classes.teamNumber}>{t}
                      {m.blue_surrogate[idx] ? '*' : ''}</Component>
                  ;
                })}
              </div>
            </TableCell>
            {m.played ? <TableCell className={redClassnames}>
              <span>{m.red_score}</span>
            </TableCell> : null}
            {m.played ? <TableCell className={blueClassnames}>
              <span>{m.blue_score}</span>
            </TableCell>: null}
            {!m.played ? <TableCell className={classes.tableCell} colSpan={2}>
              <span>Awaiting results</span>
            </TableCell>: null}
          </TableRow>
        );
      });
    });

    return [<Table key={1} className={classes.table} size="small">
      <TableHead>
        <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell}>Match</TableCell>
          <Hidden smDown>
            {team ? <TableCell className={classes.tableCell}>Result</TableCell> : null}
          </Hidden>
          <TableCell className={classes.tableCell}>Red Alliance</TableCell>
          <TableCell className={classes.tableCell}>Blue Alliance</TableCell>
          <TableCell className={classes.tableCell} colSpan={2}>Scores</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {groupedMatches['interfinal'] ? <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell} colSpan={5}>Inter-division Finals</TableCell>
        </TableRow> : null}
        {groupedMatches['interfinal'] ? groupedMatches['interfinal'] : null}
        {groupedMatches['final'] ? <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell} colSpan={5}>Finals</TableCell>
        </TableRow> : null}
        {groupedMatches['final'] ? groupedMatches['final'] : null}
        {groupedMatches['semi'] ? <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell} colSpan={5}>Semi-Finals</TableCell>
        </TableRow> : null}
        {groupedMatches['semi'] ? groupedMatches['semi'] : null}
        {groupedMatches['qual'] ? <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell} colSpan={5}>Qualifications</TableCell>
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


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(MatchTable));