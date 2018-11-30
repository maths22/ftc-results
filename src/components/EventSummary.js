import React, {Component} from 'react';
import {connect} from 'react-redux';

import Paper from '@material-ui/core/Paper';

import {
  getDivisions,
  getEventMatches,
  getEvents,
  getLeagues,
} from '../actions/api';
import {setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import {withStyles} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
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
    if(!this.props.event || !this.props.matches) {
      this.props.getEvents();
      //TODO only load these if relevant
      this.props.getLeagues();
      this.props.getDivisions();
    }

    this.props.getEventMatches(this.props.id);
    this.setTitle();
  }

  componentDidUpdate(oldProps) {
    if(oldProps.event !== this.props.event) {
      this.setTitle();

      this.props.getEventMatches(this.props.id);
    }
  }

  setTitle() {
    this.props.setTitle(this.props.event ? this.props.event.name : 'Event');
  }

  componentWillUnmount() {
    this.props.setTitle(null);
  }

  render () {
    if(!this.props.event) {
      return <LoadingSpinner/>;
    }

    const {event, league, division, matches} = this.props;

    const stateTag = {
      finalized: {
        label: 'Complete',
        color: 'primary'
      },
      in_progress: {
        label: 'In Progress',
        color: 'secondary'
      },
      not_started: {
        label: Date.parse(event.start_date) > new Date() ? 'Upcoming' : 'Awaiting results'
      },
    };

    return <Paper className={this.props.classes.root}>
      <div className={this.props.classes.heading}>
        <Typography variant="h4" gutterBottom>{event.name} <Chip {...stateTag[event.aasm_state]}/></Typography>
        <b>Date:</b> {event.start_date === event.end_date ? event.start_date : (event.start_date + ' - ' + event.end_date)}<br/>
        <b>Location:</b> {event.location}{event.location && <br/>}
        {event.city}{event.city && ', '}
        {event.state}{event.state && ', '}
        {event.country}<br/>{league ?
          <span><b>League:</b> <TextLink to={`/leagues/rankings/${league.id}`}>{league.name}</TextLink></span> : null }<br/>
        {division ?
          <span><b>Division:</b> <TextLink to={`/divisions/rankings/${division.id}`}>{division.name}</TextLink></span> : null }<br/>

      </div>

      <MatchTable matches={matches}/>
    </Paper>;
  }
}




const mapStateToProps = (state, props) => {
  const ret = {};
  const id = parseInt(props.id);
  if (state.events) {
    ret.event = state.events[id];
  }
  ret.matches = Object.values(state.matches).filter((m) => m.event_id === id)
  if (state.divisions && state.leagues && ret.event && ret.event.context_type === 'Division') {
    ret.division = state.divisions[ret.event.context_id];
    ret.league = state.leagues[ret.division.league_id];
  } else if (state.leagues && ret.event && ret.event.context_type === 'League') {
    ret.league = state.leagues[ret.event.context_id];
  }
  return ret;
};

const mapDispatchToProps = {
  getDivisions,
  getEvents,
  getEventMatches,
  getLeagues,
  setTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventsSummary));