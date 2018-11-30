import React, {Component} from 'react';
import {connect} from 'react-redux';

import Paper from '@material-ui/core/Paper';

import {getDivisions, getEvents, getLeagues, getTeamDetails} from '../actions/api';
import {setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import {withStyles} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import MatchTable from './MatchTable';
import TextLink from './TextLink';

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit,
    overflowX: 'auto',
  },
  heading: {
    padding: 2 * theme.spacing.unit,
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

  componentDidUpdate(oldProps) {
    if(oldProps.id !== this.props.id) {
      if(!this.props.team || !this.props.matches) {
        this.props.getTeamDetails(this.props.id);
      }
    }
  }

  componentWillUnmount() {
    this.props.setTitle(null);
  }

  renderEvents = () => {
    const {events, matches} = this.props;

    return events.sort((a, b) => {
      const diff = a.start_date.localeCompare(b.start_date);
      if(diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    } ).map((evt) => (<div key={evt.id}>
      <div className={this.props.classes.heading}>
        <Typography variant="h6" gutterBottom><TextLink to={`/events/summary/${evt.id}`}>{evt.name}</TextLink></Typography>
      </div>
      <MatchTable team={this.props.team.number} matches={matches.filter((m) => m.event_id === evt.id)}/>
    </div>));
  };

  render () {
    if(!this.props.team) {
      return <LoadingSpinner/>;
    }

    const {team, league, division} = this.props;

    return <Paper className={this.props.classes.root}>
      <div className={this.props.classes.heading}>
        <Typography variant="h4" gutterBottom>Team {team.number} – {team.name}</Typography>
        <b>Organization:</b> {team.organization}<br/>
        <b>Location:</b> {team.city}, {team.state}, {team.country}<br/>
        {division ?
            <span><b>League:</b> <TextLink to={`/leagues/rankings/${league.id}`}>{league.name}</TextLink>
              {' – '}<TextLink to={`/divisions/rankings/${division.id}`}>{division.name}</TextLink></span> : null }
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