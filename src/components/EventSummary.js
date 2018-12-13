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
import MatchTable from './MatchTable';
import TextLink from './TextLink';
import RankingsTable from './RankingsTable';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SwipeableViews from 'react-swipeable-views';
import IconButton from '@material-ui/core/es/IconButton/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import EventChip from './EventChip';

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

function Wrapper(props) {
  return <div style={props.style}/>;
}

class EventSummary extends Component {

  constructor(props) {
    super(props);
    this.state = {selectedTab: 1};
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

    this.refresh();
    this.enablePersistentRefresh();
    this.setTitle();
  }

  componentDidUpdate(oldProps) {
    if(oldProps.event !== this.props.event) {
      this.setTitle();

      this.refresh();
      this.enablePersistentRefresh();
    }
  }

  enablePersistentRefresh() {
    if(this.props.event && this.props.event.aasm_state === 'in_progress') {
      this.interval = setInterval(this.refresh, 30000);
    } else {
      clearInterval(this.interval);
    }
  }

  refresh = () => {
    this.props.getEventMatches(this.props.id);
    this.props.getEventRankings(this.props.id);
  };

  setTitle() {
    this.props.setTitle(this.props.event ? this.props.event.name : 'Event');
  }

  componentWillUnmount() {
    this.props.setTitle(null);
    clearInterval(this.interval);
  }

  selectTab = (selectedTab) => {
    this.setState({ selectedTab });
    if(this.props.event.status === 'in_progress') {
      this.refresh();
    }
  };

  renderVideo = () => {
    const { event } = this.props;
    const startDateParts = event.start_date.split('-');
    const endDateParts = event.end_date.split('-');
    const today = new Date();
    today.setHours(0,0,0,0);
    const isHappening = new Date(startDateParts[0],startDateParts[1]-1,startDateParts[2]) <= today
        && new Date(endDateParts[0],endDateParts[1]-1,endDateParts[2]) >= today;
    if(!event.channel || !isHappening) return null;

    return  <div style={{maxWidth: '50em', margin: '0 auto'}}>
        <div style={{position:'relative', paddingTop: '56%'}}>
          <iframe
              style={{position:'absolute',top:0,left:0,width:'100%', height:'100%'}}
              src={`https://player.twitch.tv/?channel=${event.channel}`}
              frameBorder="0"
              scrolling="no"
              allowFullScreen>
          </iframe>
        </div>
      </div>;
  };

  render () {
    if(!this.props.event) {
      return <LoadingSpinner/>;
    }

    const { classes, event, league, division, matches, rankings } = this.props;
    const { selectedTab } = this.state;



    const google_location = event.location + ', ' + event.address + ', ' + event.city + ', ' + event.state + ', ' + event.country;
    const maps_url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(google_location);

    return <Paper className={classes.root}>
      <div className={classes.heading}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.35em'}}><Typography variant="h4">{event.name}</Typography> <EventChip event={event}/></div>
        <b>Date:</b> {event.start_date === event.end_date ? event.start_date : (event.start_date + ' - ' + event.end_date)}<br/>
        <b>Location:</b> <TextLink href={maps_url} target="_blank">{event.location}{event.location && ', '}
        {event.city}{event.city && ', '}
        {event.state}{event.state && ', '}
        {event.country}</TextLink><br/>{league ?
          <span><b>League:</b> <TextLink to={`/leagues/rankings/${league.id}`}>{league.name}</TextLink></span> : null }<br/>
        {division ?
          <span><b>Division:</b> <TextLink to={`/divisions/rankings/${division.id}`}>{division.name}</TextLink></span> : null }<br/>

      </div>

      {this.renderVideo()}

      <div>
        <Tabs
            value={selectedTab}
            onChange={(_, tab) => this.selectTab(tab)}
            indicatorColor="primary"
            textColor="primary"
        >
          <Wrapper style={{width: '48px'}}/>
          <Tab label="Rankings" style={{marginLeft: 'auto'}}/>
          <Tab label="Matches" />
          {event.aasm_state === 'in_progress' ?
              <IconButton onClick={this.refresh} style={{marginLeft: 'auto', width: '48px'}}><RefreshIcon/></IconButton>
              : <Wrapper style={{marginLeft: 'auto', width: '48px'}}/> }
        </Tabs>
      </div>

      <SwipeableViews index={selectedTab - 1}
                      onChangeIndex={this.selectTab}>
        <div className={classes.tabPanel}><RankingsTable rankings={rankings} showRecord onRefresh={this.refresh}/></div>
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
        .sort((a, b) => {
          const ar = a.ranking < 0 ? 1000000 : a.ranking;
          const br = b.ranking < 0 ? 1000000 : b.ranking;
          return ar - br;
        })
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