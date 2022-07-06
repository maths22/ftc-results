import React, {Component} from 'react';
import {connect} from 'react-redux';
import { push } from 'connected-react-router';
import queryString from 'query-string';
import invert from 'lodash/invert';

import {
  getEventMatches, getEventRankings, getEventTeamsWithTeams, getEventAwards,
  getEvent,
  getLeagues, getEventAlliances,
} from '../actions/api';
import {hideVideo, setTitle} from '../actions/ui';
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
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import AlliancesTable from './AlliancesTable';

const styles = (theme) => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  heading: {
    padding: theme.spacing(2),
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
    this.refresh();
    this.enablePersistentRefresh();
    this.setTitle();
  }

  componentDidUpdate(oldProps) {
    if (!this.props.event && !oldProps.event) return;
    this.updateTabs();
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
    if(!this.props.event) {
      this.props.getEvent(this.props.selectedSeason, this.props.id);
      //TODO only load these if relevant
      this.props.getLeagues(this.props.selectedSeason);
    } else {
      this.updateTabs();
    }
    this.props.getEventTeamsWithTeams(this.props.selectedSeason, this.props.id);
    this.props.getEventMatches(this.props.selectedSeason, this.props.id);
    this.props.getEventRankings(this.props.selectedSeason, this.props.id);
    this.props.getEventAwards(this.props.selectedSeason, this.props.id);
    this.props.getEventAlliances(this.props.selectedSeason, this.props.id);
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
    const { event, uiHideVideo } = this.props;
    const startDateParts = event.start_date.split('-');
    const endDateParts = event.end_date.split('-');
    const today = new Date();
    today.setHours(0,0,0,0);
    const isHappening = new Date(startDateParts[0],startDateParts[1]-1,startDateParts[2]) <= today
        && new Date(endDateParts[0],endDateParts[1]-1,endDateParts[2]) >= today;
    if(!event.channel || !isHappening) return null;

    return <div style={{maxWidth: '50em', margin: '0 auto'}}>
        <FormControlLabel
          control={
            <Switch checked={!uiHideVideo} onChange={() => this.props.hideVideo(!uiHideVideo)} />
          }
          label="Show Video"
        />
        { uiHideVideo ? null : <div style={{position:'relative', paddingTop: '56%'}}>
          <iframe
              title="Twitch Player"
              style={{position:'absolute',top:0,left:0,width:'100%', height:'100%'}}
              src={`https://player.twitch.tv/?channel=${event.channel}`}
              frameBorder="0"
              scrolling="no"
              allowFullScreen>
          </iframe>
        </div> }
      </div>;
  };


  tabNameToId() {
    return [
        'teams',
        this.showRankings() ? 'rankings' : null,
        this.showAlliances() ? 'alliances' : null,
        'matches',
        this.showAwards() ? 'awards' : null
    ].filter((t) => t)
      .reduce(function(obj, cur, i) {
        obj[cur] = i + 1;
        return obj;
      }, {});
  }


  tabIdToName() {
    return invert(this.tabNameToId());
  }

  showRankings() {
    return !this.hasDivisions() || this.state.selectedDivision !== 0;
  }

  showAwards() {
    return (!this.hasDivisions() && this.props.event.type !== 'league_meet') || (this.hasDivisions() && this.state.selectedDivision === 0);
  }

  showAlliances() {
    return this.props.event.type !== 'league_meet';
  }

  render () {
    if(!this.props.event) {
      return <LoadingSpinner/>;
    }

    const { classes, event, league, matches, rankings, elimsRankings, alliances, awards, teams } = this.props;
    const { selectedDivision, selectedTab } = this.state;


    const showDivisionAssignments = this.hasDivisions() && selectedDivision === 0;
    const google_location = event.location + ', ' + event.address + ', ' + event.city + ', ' + event.state + ', ' + event.country;
    const maps_url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(google_location);

    const tabs = [
      <div className={classes.tabPanel} key="teams">
        <TeamsTable
          teams={teams && teams.filter(t => selectedDivision === 0 ? true : selectedDivision === t.division)}
          showDivisionAssignments={showDivisionAssignments}
          divisions={event.divisions}
          onClickDivision={this.selectDivision}
        />
      </div>,
      this.showRankings() ? <div className={classes.tabPanel} key="rankings">
        <RankingsTable
            rankings={rankings && rankings.filter(r => selectedDivision === 0 ? !r.division : selectedDivision === r.division)}
            showRecord={!this.props.event.remote}
            onRefresh={this.refresh}/>
        </div> : null,
      this.showAlliances() ? <div className={classes.tabPanel} key="alliances">
        <RankingsTable elims
                       rankings={elimsRankings && elimsRankings.filter(r => selectedDivision === 0 ? !r.division : selectedDivision === r.division)}
                       showRecord={!this.props.event.remote}
                       onRefresh={this.refresh}/>
        <AlliancesTable
          alliances={alliances && alliances.filter(a => selectedDivision === 0 ? !a.division : selectedDivision === a.division)}
          onRefresh={this.refresh}/>
        </div> : null,
      <div className={classes.tabPanel} key="matches">
        <MatchTable remote={event.remote}
            matches={matches && matches.filter(m => selectedDivision === 0 ? !m.division : selectedDivision === m.division)}
        />
      </div>,
      this.showAwards() ? <div className={classes.tabPanel} key="awards">
        <AwardsTable
            awards={awards}
            onRefresh={this.refresh}/>
      </div>: null
    ].filter(e => e);

    const season = (this.props.seasons || []).find((s) => s.id === this.props.event.season_id);

    return <div className={classes.root}>
      <div className={classes.heading}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.35em'}}><Typography variant="h4">{event.name}</Typography> <EventChip event={event}/></div>
        {this.renderDivisionPicker()}
        {season ? <><b>Season:</b> <span>{season.name} ({season.year})</span><br/></> : null}
        <b>Date:</b> {new Date(event.start_date).getUTCFullYear() === 9999 ? 'TBA' : event.start_date === event.end_date ? event.start_date : (event.start_date + ' - ' + event.end_date)}<br/>
        <b>Location:</b>
        {event.location && event.location.trim() !== '-' ? <>
          <TextLink href={maps_url} target="_blank"> {event.location}{event.location && ', '}
        {event.city}{event.city && ', '}
        {event.state}{event.state && ', '}
        {event.country}</TextLink>
        </> : ' TBA' }
        <br/>
        {league && league.league ?
          <><span><b>League:</b> <TextLink to={`/${this.props.selectedSeason}/leagues/rankings/${league.league.slug}`}>{league.league.name}</TextLink></span><br/></> : null }
        {league ?
          <span><b>{league.league ? 'Child ' : null} League:</b> <TextLink to={`/${this.props.selectedSeason}/leagues/rankings/${league.slug}`}>{league.name}</TextLink></span> : null }<br/>

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
          { this.showRankings() ? <Tab label={this.props.event.type !== 'league_meet' ? 'Rankings' : 'League Rankings'} /> : null }
          { this.showAlliances() ? <Tab label="Alliances" /> : null }
          <Tab label="Matches" />
          { this.showAwards() ? <Tab label="Awards" /> : null }
          {event.aasm_state === 'in_progress' ?
              <IconButton onClick={this.refresh} style={{marginLeft: 'auto', width: '48px'}}><RefreshIcon/></IconButton>
              : <Wrapper style={{marginLeft: 'auto', width: '48px'}}/> }
        </Tabs>
      </div>

      <SwipeableViews index={selectedTab - 1}
                      onChangeIndex={(tab) => this.selectTab(tab + 1)}>
        {tabs}
      </SwipeableViews>
    </div>;
  }
}




const mapStateToProps = (state, props) => {
  const ret = {};
  ret.uiHideVideo = state.ui.hideVideo;
  ret.seasons = state.seasons;
  if (state.events) {
    ret.event = Object.values(state.events).find((e) => e.slug === props.id );
    if(!ret.event || !ret.event.id) ret.event = null;
  }
  const id = ret.event && ret.event.id;
  ret.matches = Object.values(state.matches).filter((m) => m.event_id === id);
  if(state.teams) {
    if(ret.event && ret.event.teams) {
      ret.teams = ret.event.teams.map((td) => ({team: state.teams[td.team], division: td.division}));

      if (ret.event.type === 'league_meet') {
        ret.rankings = Object.values(state.rankings).filter((m) => m.context_type === 'League' && m.context_id === ret.event.context_id)
          .sort((a, b) => {
            const ar = a.ranking < 0 ? 1000000 : a.ranking;
            const br = b.ranking < 0 ? 1000000 : b.ranking;
            return ar - br;
          })
          .map((r) => Object.assign({}, r, {team: state.teams[r.team]}));
      } else {
        ret.rankings = Object.values(state.rankings).filter((m) => m.context_type === 'Event' && m.context_id === id)
          .sort((a, b) => {
            const ar = a.ranking < 0 ? 1000000 : a.ranking;
            const br = b.ranking < 0 ? 1000000 : b.ranking;
            return ar - br;
          })
          .map((r) => Object.assign({}, r, {team: state.teams[r.team]}));
      }
      ret.awards = Object.values(state.awards).filter((m) => m.event_id === id)
        .sort((a, b) => {
          return b.id - a.id;
        })
        .map((a) => Object.assign({}, a, {
          finalists: a.finalists.map((f) => Object.assign({}, f, {team: state.teams[f.team_id]}))
        }));
      ret.alliances = Object.values(state.alliances).filter((m) => m.event_id === id)
        .sort((a, b) => {
          return a.seed - b.seed;
        })
        .map((a) => Object.assign({}, a, {
          teams: a.teams.map((t) => state.teams[t])
        }));
      ret.elimsRankings = Object.values(state.elimsRankings).filter((m) => m.context_type === 'Event' && m.context_id === id)
        .sort((a, b) => {
          const ar = a.ranking < 0 ? 1000000 : a.ranking;
          const br = b.ranking < 0 ? 1000000 : b.ranking;
          return ar - br;
        })
        .map((r) => Object.assign({}, r, {alliance: ret.alliances.find(a => r.alliance === a.id)}));
    }
  }
  if (state.leagues && ret.event && ret.event.context_type === 'League') {
    ret.league = state.leagues[ret.event.context_id];
  }
  return ret;
};

const mapDispatchToProps = {
  getEvent,
  getEventMatches,
  getEventRankings,
  getEventTeamsWithTeams,
  getEventAlliances,
  getEventAwards,
  getLeagues,
  setTitle,
  hideVideo,
  push,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventSummary));