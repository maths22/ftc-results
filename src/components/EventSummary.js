import React, {Component} from 'react';
import {connect} from 'react-redux';

import Paper from '@material-ui/core/Paper';

import {
  getDivisions,
  getEventMatches, getEventRankings,
  getEvents,
  getLeagues, getTeams,
} from '../actions/api';
import {setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import {withStyles} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import Chip from '@material-ui/core/Chip';
import MatchTable from './MatchTable';
import TextLink from './TextLink';
import RankingsTable from './RankingsTable';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SwipeableViews from 'react-swipeable-views';

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit,
    overflowX: 'auto',
  },
  heading: {
    padding: 2 * theme.spacing.unit,
  },
  tabPanel: {
    width: '100%',
    overflow: 'auto'
  }
});

class EventSummary extends Component {

  constructor(props) {
    super(props);
    this.state = {selectedTab: 0};
  }

  componentDidMount() {
    if(!this.props.event || !this.props.matches) {
      this.props.getEvents();
      //TODO only load these if relevant
      this.props.getLeagues();
      this.props.getDivisions();
    }
    if(!this.teams) {
      this.props.getTeams();
    }

    this.props.getEventMatches(this.props.id);
    this.props.getEventRankings(this.props.id);
    this.setTitle();
  }

  componentDidUpdate(oldProps) {
    if(oldProps.event !== this.props.event) {
      this.setTitle();

      this.props.getEventMatches(this.props.id);
      this.props.getEventRankings(this.props.id);
    }
  }

  setTitle() {
    this.props.setTitle(this.props.event ? this.props.event.name : 'Event');
  }

  componentWillUnmount() {
    this.props.setTitle(null);
  }

  selectTab = (selectedTab) => {
    this.setState({ selectedTab });
  };

  render () {
    if(!this.props.event) {
      return <LoadingSpinner/>;
    }

    const { classes, event, league, division, matches, rankings } = this.props;
    const { selectedTab } = this.state;

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

    const google_location = event.location + ', ' + event.address + ', ' + event.city + ', ' + event.state + ', ' + event.country;
    const maps_url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(google_location);

    return <Paper className={classes.root}>
      <div className={classes.heading}>
        <Typography variant="h4" gutterBottom>{event.name} <Chip {...stateTag[event.aasm_state]}/></Typography>
        <b>Date:</b> {event.start_date === event.end_date ? event.start_date : (event.start_date + ' - ' + event.end_date)}<br/>
        <b>Location:</b> <TextLink href={maps_url} target="_blank">{event.location}{event.location && ', '}
        {event.city}{event.city && ', '}
        {event.state}{event.state && ', '}
        {event.country}</TextLink><br/>{league ?
          <span><b>League:</b> <TextLink to={`/leagues/rankings/${league.id}`}>{league.name}</TextLink></span> : null }<br/>
        {division ?
          <span><b>Division:</b> <TextLink to={`/divisions/rankings/${division.id}`}>{division.name}</TextLink></span> : null }<br/>

      </div>

      <Tabs
          value={selectedTab}
          onChange={(_, tab) => this.selectTab(tab)}
          indicatorColor="primary"
          textColor="primary"
          centered
      >
        <Tab label="Rankings"/>
        <Tab label="Matches" />
      </Tabs>

      <SwipeableViews index={selectedTab}
                      onChangeIndex={this.selectTab}>
        <div className={classes.tabPanel}><RankingsTable rankings={rankings}/></div>
        <div className={classes.tabPanel}><MatchTable matches={matches}/></div>
      </SwipeableViews>
    </Paper>;
  }
}




const mapStateToProps = (state, props) => {
  const ret = {};
  const id = parseInt(props.id);
  if (state.events) {
    ret.event = state.events[id];
  }
  ret.matches = Object.values(state.matches).filter((m) => m.event_id === id);
  if(state.teams) {
    ret.rankings = Object.values(state.rankings).filter((m) => m.event_id === id)
        .sort((a, b) => a.ranking - b.ranking)
        .map((r) => Object.assign({}, r, {team: state.teams[r.team_id]}));
  }
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
  getEventRankings,
  getLeagues,
  getTeams,
  setTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventSummary));