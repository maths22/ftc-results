import React, {Component} from 'react';
import {connect} from 'react-redux';
import { push } from 'connected-react-router';
import queryString from 'query-string';
import invert from 'lodash/invert';

import Paper from '@material-ui/core/Paper';

import {
  getDivisions,
  getEventMatches, getEventRankings, getEventTeams, getEventAwards,
  getEvents,
  getLeagues, getTeams,
} from '../actions/api';
import {setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import {withStyles} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import MatchTable from './MatchTable';
import TextLink from './TextLink';
import AwardsTable from './AwardsTable';
import RankingsTable from './RankingsTable';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SwipeableViews from 'react-swipeable-views';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import EventChip from './EventChip';
import TeamsTable from './TeamsTable';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

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
  },
  h5: theme.typography.h5,
});

function Wrapper(props) {
  return <div style={props.style}/>;
}

class EventSummary extends Component {

  constructor(props) {
    super(props);
    this.state = {selectedTab: 1, selectedDivision: 0};
  }

  updateTabs = () => {
    const values = queryString.parse(window.location.search);
    const curTab = this.tabNameToId()[values['tab']];
    if(curTab && this.state.selectedTab !== curTab) {
      this.setState({selectedTab: curTab});
    }
    const curDivision = parseInt(values['division']);
    if((curDivision || curDivision === 0) && this.state.selectedDivision !== curDivision) {
      this.setState({selectedDivision: curDivision});
    }
    if(values['tab'] && !curTab) {
      this.selectTab(1);
    }
  };

  componentDidMount() {
    this.updateTabs();
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
    this.updateTabs();
    if (!this.props.event && !oldProps.event) return;
    if((!!this.props.event === !oldProps.event) || (oldProps.event.id !== this.props.event.id)) {
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
    this.props.getEventTeams(this.props.id);
    this.props.getEventMatches(this.props.id);
    this.props.getEventRankings(this.props.id);
    this.props.getEventAwards(this.props.id);
  };

  setTitle() {
    this.props.setTitle(this.props.event ? this.props.event.name : 'Event');
  }

  componentWillUnmount() {
    this.props.setTitle(null);
    clearInterval(this.interval);
  }

  selectTab = (selectedTab) => {
    const values = queryString.parse(window.location.search);
    values['tab'] = this.tabIdToName()[selectedTab];
    this.props.push({ search: queryString.stringify(values) });
    if(this.props.event.status === 'in_progress') {
      this.refresh();
    }
  };

  selectDivision = (div) => {
    const values = queryString.parse(window.location.search);
    values['division'] = div;
    this.props.push({ search: queryString.stringify(values) });
    if(this.props.event.status === 'in_progress') {
      this.refresh();
    }
  };

  hasDivisions = () => {
    const { event } = this.props;
    if(!event) return false;
    return !(!event.divisions || event.divisions.length === 0);
  };

  renderDivisionPicker = () => {
    const { event } = this.props;
    if(!this.hasDivisions()) return null;
    console.log(this.state.selectedDivision);
    return <div>
        <Select value={this.state.selectedDivision} onChange={(evt) => this.selectDivision(evt.target.value)} classes={{root: this.props.classes.h5}}>
          <MenuItem value={0}>Finals Division</MenuItem>
          {event.divisions.map((d) => {
            return <MenuItem value={d.number}>{d.name} Division</MenuItem>;
          })}
        </Select>
    </div>;

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


  tabNameToId() {
    if(this.hasDivisions() && this.state.selectedDivision === 0) {
      return {
        'teams': 1,
        'matches': 2,
        'awards': 3
      };
    } else if(this.hasDivisions() || (this.props.event && this.props.event.context_type === 'Division')) {
      return {
        'teams': 1,
        'rankings': 2,
        'matches': 3,
      };
    }
    return {
      'teams': 1,
      'rankings': 2,
      'matches': 3,
      'awards': 4
    };
  }


  tabIdToName() {
    return invert(this.tabNameToId());
  }

  render () {
    if(!this.props.event) {
      return <LoadingSpinner/>;
    }

    const { classes, event, league, division, matches, rankings, awards, teams } = this.props;
    const { selectedDivision, selectedTab } = this.state;

    const showRankings = !this.hasDivisions() || selectedDivision !== 0;
    const showAwards = (!this.hasDivisions() && event.context_type !== 'Division') || selectedDivision === 0;
    const showDivisionAssignments = this.hasDivisions() && selectedDivision === 0;
    const google_location = event.location + ', ' + event.address + ', ' + event.city + ', ' + event.state + ', ' + event.country;
    const maps_url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(google_location);

    const tabs = [
      <div className={classes.tabPanel}>
        <TeamsTable
          teams={teams && teams.filter(t => selectedDivision === 0 ? true : selectedDivision === t.division)}
          showDivisionAssignments={showDivisionAssignments}
          divisions={event.divisions}
          onClickDivision={this.selectDivision}
        />
      </div>,
      showRankings ? <div className={classes.tabPanel}>
        <RankingsTable
            rankings={rankings && rankings.filter(r => selectedDivision === 0 ? !r.division : selectedDivision === r.division)}
            showRecord
            onRefresh={this.refresh}/>
        </div> : null,
      <div className={classes.tabPanel}>
        <MatchTable
            matches={matches && matches.filter(m => selectedDivision === 0 ? !m.division : selectedDivision === m.division)}
        />
      </div>,
      showAwards ? <div className={classes.tabPanel}>
        <AwardsTable
            awards={awards}
            onRefresh={this.refresh}/>
      </div>: null
    ].filter(e => e);

    return <Paper className={classes.root}>
      <div className={classes.heading}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.35em'}}><Typography variant="h4">{event.name}</Typography> <EventChip event={event}/></div>
        {this.renderDivisionPicker()}
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
          <Tab label="Teams" style={{marginLeft: 'auto'}}/>
          { showRankings ? <Tab label="Rankings" /> : null }
          <Tab label="Matches" />
          { showAwards ? <Tab label="Awards" /> : null }
          {event.aasm_state === 'in_progress' ?
              <IconButton onClick={this.refresh} style={{marginLeft: 'auto', width: '48px'}}><RefreshIcon/></IconButton>
              : <Wrapper style={{marginLeft: 'auto', width: '48px'}}/> }
        </Tabs>
      </div>

      <SwipeableViews index={selectedTab - 1}
                      onChangeIndex={(tab) => this.selectTab(tab + 1)}>
        {tabs}
      </SwipeableViews>
    </Paper>;
  }
}




const mapStateToProps = (state, props) => {
  const ret = {};
  const id = parseInt(props.id);
  if (state.events) {
    ret.event = state.events[id];
    if(!ret.event.id) ret.event = null;
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
    ret.awards = Object.values(state.awards).filter((m) => m.event_id === id)
        .sort((a, b) => {
          return b.id - a.id;
        })
        .map((a) => Object.assign({}, a, {
          finalists: a.finalists.map((f) => Object.assign({}, f, {team: state.teams[f.team_id]}))
        }));
    if(ret.event && ret.event.teams) {
      ret.teams = ret.event.teams.map((td) => ({team: state.teams[td.team], division: td.division}));
    }
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
  getEventTeams,
  getEventAwards,
  getLeagues,
  getTeams,
  setTitle,
  push,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventSummary));