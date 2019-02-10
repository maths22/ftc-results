import React, {Component} from 'react';
import {connect} from 'react-redux';
import { push } from 'connected-react-router';
import queryString from 'query-string';
import invert from 'lodash/invert';

import Paper from '@material-ui/core/Paper';

import {
  getDivisions,
  getEventMatches, getEventRankings,
  getEvents,
  getLeagues, getTeams,
} from '../../actions/api';
import {setTitle} from '../../actions/ui';
import LoadingSpinner from './../LoadingSpinner';
import {withStyles} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import MatchTable from '../MatchTable';
import TextLink from '../TextLink';
import AwardsTable from '../AwardsTable';
import RankingsTable from '../RankingsTable';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import SwipeableViews from 'react-swipeable-views';
import IconButton from '@material-ui/core/IconButton';
import RefreshIcon from '@material-ui/icons/Refresh';
import EventChip from '../EventChip';
import TeamsTable from '../TeamsTable';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Grid from '@material-ui/core/Grid';

import Image from './season-background.png';

const styles = (theme) => ({
  root: {
    width: '100vw',
    height: '100vh',
    overflowX: 'hidden',
    backgroundImage: `url(${Image})`
  },
  heading: {
    position: 'fixed',
    top: '0',
    left: '0',
    width: 'calc(100% - ' + (6 * theme.spacing.unit) + 'px)',
    boxSizing: 'border-box',
    borderColor: '#fdfdfd',
    borderWidth: '0.25em',
    borderStyle: 'solid',
    borderRadius: '1em',
    background: '#444',
    padding: 2 * theme.spacing.unit,
    margin: 3 * theme.spacing.unit,
  },
  tables: {
    position: 'fixed',
    top: 13.5 * theme.spacing.unit,
    bottom: '0',
    left: '0',
    width: 'calc(100% - ' + (6 * theme.spacing.unit) + 'px)',
    boxSizing: 'border-box',

    borderColor: '#fdfdfd',
    borderWidth: '0.25em',
    borderStyle: 'solid',
    borderRadius: '1em',
    background: '#444',
    padding: 2 * theme.spacing.unit,
    paddingLeft: 4 * theme.spacing.unit,
    paddingRight: 4 * theme.spacing.unit,
    margin: 3 * theme.spacing.unit,
    // overflowY: 'hidden',

    '& td': {
      fontSize: '1.5em',
      background: '#fdfdfd',
      borderColor: '#222',
      borderWidth: '2px',
      borderStyle: 'solid'
    },
    '& .tableRowDiv span' : {
      boxSizing: 'border-box',
      fontSize: '1.5em',
      background: '#fdfdfd',
      padding: '4px 8px',

      borderColor: '#222',
      borderWidth: '1px',
      borderStyle: 'solid'
    },
    '& .tableRowDiv span:first-child' : {
      borderLeftWidth: '2px'
    },
    '& .tableRowDiv span:last-child' : {
      borderRightWidth: '2px'
    },
    '& .tableHeadDiv span' : {
      boxSizing: 'border-box',

      fontSize: '1.7em',
      fontWeight: 'bold',
      background: '#444',

      color: '#fdfdfd',
      borderColor: '#222',
      borderWidth: '2px 1px',
      borderStyle: 'solid'
    },
    '& .tableHeadDiv span:first-child' : {
      borderLeftWidth: '2px'
    },
    '& .tableHeadDiv span:last-child' : {
      borderRightWidth: '2px'
    },
    '& th': {
      fontSize: '1.7em',
      background: '#444',

      color: '#fdfdfd',
      borderColor: '#222',
      borderWidth: '2px',
      borderStyle: 'solid'
    },
  },

  h5: theme.typography.h5,
});


class EventRankings extends Component {

  constructor(props) {
    super(props);
    this.state = {selectedDivision: 0};
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
    if (!this.props.event && !oldProps.event) return;
    if((!!this.props.event === !oldProps.event) || (oldProps.event.id !== this.props.event.id)) {
      this.setTitle();

      this.refresh();
      this.enablePersistentRefresh();
    }
  }

  enablePersistentRefresh() {
    if(this.props.event && this.props.event.aasm_state !== 'completed') {
      this.interval = setInterval(this.refresh, 15000);
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

  hasDivisions = () => {
    const { event } = this.props;
    if(!event) return false;
    return !(!event.divisions || event.divisions.length === 0);
  };

  render () {
    if(!this.props.event) {
      return <LoadingSpinner/>;
    }

    const { classes, event, league, division, matches, rankings, awards, teams } = this.props;
    const { selectedDivision, selectedTab } = this.state;

    return <div className={classes.root}>
      <div className={classes.heading}>
        <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.35em'}}>
          <Typography variant="h4" style={{fontWeight: 'bold', color: '#fdfdfd'}}>{event.name} Pit Display</Typography>
        </div>

      </div>

      <div  className={classes.tables}>
        <Grid container spacing={32} style={{height: 'calc(100% + 16px)'}}>
          <Grid item xs={6} style={{height: '100%', overflowY: 'hidden'}}>
            <RankingsTable
                height
                rankings={rankings && rankings.filter(r => selectedDivision === 0 ? !r.division : selectedDivision === r.division)}
                pitDisplay
                onRefresh={this.refresh}/>
          </Grid>

          <Grid item xs={6} style={{height: '100%', overflowY: 'hidden'}}>
            <MatchTable
                matches={matches && matches.filter(m => selectedDivision === 0 ? !m.division : selectedDivision === m.division)}
                pitDisplay
            />
          </Grid>
        </Grid>
      </div>
    </div>;
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
  getLeagues,
  getTeams,
  setTitle,
  push,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventRankings));