import React, {Component} from 'react';
import {connect} from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/CheckCircle';

import {API_HOST, getDivisions, getEvents, getLeagues, getTeamDetails, scoring_download_url} from '../actions/api';
import {Link} from 'react-router-dom';
import {setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import {withStyles} from '@material-ui/core';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import mapValues from 'lodash/mapValues';
import classNames from 'classnames';
import Typography from '@material-ui/core/Typography';

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit,
    overflowX: 'auto',
  },
  heading: {
    padding: 2 * theme.spacing.unit,
  },
  table: {
    minWidth: '30em',
  },
  tableCell: {
    paddingLeft: 2 * theme.spacing.unit,
    paddingRight: 2 * theme.spacing.unit,
    textAlign: 'center',
    '&:last-child': {
      paddingRight: 2 * theme.spacing.unit,
    }
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
  ownCell: {
    textDecoration: 'underline',
  },
  surrogateCell: {
    opacity: '0.6'
  }
});

class EventsSummary extends Component {

  constructor(props) {
    super(props);
    this.state = {importEvent: null};
  }

  componentDidMount() {
    if(!this.props.team || !this.props.matches) {
      this.props.getTeamDetails(this.props.id);
    }
    if(!this.props.events) {
      this.props.getEvents();
      this.props.getDivisions();
      this.props.getLeagues();
    }
    this.props.setTitle('Team ' + this.props.id);
  }

  componentWillUnmount() {
    this.props.setTitle(null);
  }

  renderMatches = (matches) => {
    if(matches.length === 0) return null;

    const {classes} = this.props;

    const rowStyle = { height: '2rem' };

    const prefixes = {'qual': 'Q-', 'semi': 'SF-', 'final': 'F-'};
    const groupedMatches = mapValues(groupBy(sortBy(matches, ['phase', 'series', 'number']), 'phase'), (matches) => {
      return matches.map((m) => {
        const matchDisp = prefixes[m.phase] + (m.series ? (m.series + '-') : '') + m.number;
        const teamSpan = m.blue_alliance.length === 3 ? 2 : 3;
        const teamNo = this.props.team.number;
        const isRedTeam = m.red_alliance.includes(teamNo);
        const idx = isRedTeam ? m.red_alliance.indexOf(teamNo) : m.blue_alliance.indexOf(teamNo);
        const isSurrogate = isRedTeam ? m.red_surrogate[idx] : m.blue_surrogate[idx];

        const redClassnames = classNames(classes.tableCell, classes.redCell, {
          [classes.redWinningCell]: m.red_score > m.blue_score,
          [classes.allianceCell]: isRedTeam,
          [classes.surrogateCell]: isSurrogate,
        });
        const blueClassnames = classNames(classes.tableCell, classes.blueCell, {
          [classes.blueWinningCell]: m.red_score < m.blue_score,
          [classes.allianceCell]: !isRedTeam,
          [classes.surrogateCell]: isSurrogate,
        });

        return <TableRow key={m.id} style={rowStyle}>
          <TableCell className={classNames(classes.tableCell, {[classes.surrogateCell]: isSurrogate})}>{matchDisp}</TableCell>
          {m.red_alliance.map((t, idx) => <TableCell key={t} colSpan={teamSpan} className={redClassnames}>
            <span className={t === this.props.team.number ? classes.ownCell : ''}>{t}
              {m.red_surrogate[idx] ? '*' : ''}</span>
            </TableCell>)}
          {m.blue_alliance.map((t, idx) => <TableCell key={t} colSpan={teamSpan} className={blueClassnames}>
            <span className={t === this.props.team.number ? classes.ownCell : ''}>{t}
              {m.blue_surrogate[idx] ? '*' : ''}</span>
            </TableCell>)}
          <TableCell className={redClassnames}>
            <span className={isRedTeam ? classes.ownCell : ''}>{m.red_score}</span>
          </TableCell>
          <TableCell className={blueClassnames}>
            <span className={!isRedTeam ? classes.ownCell : ''}>{m.blue_score}</span>
          </TableCell>
        </TableRow>
      });
    });

    return <Table className={this.props.classes.table}>
      <TableHead>
        <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell}>Match</TableCell>
          <TableCell className={classes.tableCell} colSpan={6}>Red Alliance</TableCell>
          <TableCell className={classes.tableCell} colSpan={6}>Blue Alliance</TableCell>
          <TableCell className={classes.tableCell} colSpan={2}>Scores</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        { groupedMatches['qual'] ? <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell} colSpan={15}>Qualifications</TableCell>
        </TableRow> : null}
        { groupedMatches['qual'] ? groupedMatches['qual'] : null}
        { groupedMatches['semi'] ? <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell} colSpan={15}>Semi-Finals</TableCell>
        </TableRow> : null}
        { groupedMatches['semi'] ? groupedMatches['qual'] : null}
        { groupedMatches['final'] ? <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell}colSpan={15}>Finals</TableCell>
        </TableRow> : null}
        { groupedMatches['final'] ? groupedMatches['qual'] : null}
      </TableBody>
    </Table>
  };

  renderEvents = () => {
    const {events, matches} = this.props;
    return events.map((evt) => (<div key={evt.id}>
      <div className={this.props.classes.heading}>
        <Typography variant="h6" gutterBottom>{evt.name}</Typography>
      </div>
      {this.renderMatches(matches.filter((m) => m.event_id === evt.id))}
    </div>));
  };

  render () {
    if(!this.props.team) {
      return <LoadingSpinner/>;
    }
    const vals = [...this.props.events].sort((a, b) => {
      const diff = a.start_date.localeCompare(b.start_date);
      if(diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    } );

    const rowStyle = { height: '2rem' };
    const {team, league, division} = this.props;

    return <Paper className={this.props.classes.root}>
      <div className={this.props.classes.heading}>
        <Typography variant="h4" gutterBottom>Team {team.number} — {team.name}</Typography>
        <b>Organization:</b> {team.organization}<br/>
        <b>Location:</b> {team.city}, {team.state}, {team.country}<br/>
        {division ?
            <span><b>League:</b> <Link to={`/leagues/rankings/${league.id}`}>{league.name}</Link>
              — <Link to={`/divisions/rankings/${division.id}`}>{division.name}</Link></span> : null }
      </div>

      {this.renderEvents()}
    </Paper>;
  }
}




const mapStateToProps = (state, props) => {
  const ret = {};
  const id = parseInt(props.id);
  ret.team = state.teamDetails[id];
  if (ret.team && state.events) {
    ret.events = ret.team.events.map((e) => state.events[e]);
  }
  if(ret.team) {
    ret.matches = Object.values(state.matches).filter((m) => m.red_alliance.includes(id) || m.blue_alliance.includes(id))
  }
  if(ret.team && ret.team.division_id && state.divisions && state.leagues) {
    ret.division = state.divisions[ret.team.division_id];
    ret.league = state.leagues[ret.division.league_id];
  }
  return ret;
};

const mapDispatchToProps = {
  getDivisions,
  getEvents,
  getLeagues,
  getTeamDetails,
  setTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventsSummary));