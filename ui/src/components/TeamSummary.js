import React, {Component} from 'react';
import {connect} from 'react-redux';

import Paper from '@material-ui/core/Paper';

import {getTeamDetails, getLeagues, getDivisions, getSeasons} from '../actions/api';
import {setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import {withStyles} from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import MatchTable from './MatchTable';
import TextLink from './TextLink';
import EventChip from './EventChip';

import WarningIcon from '@material-ui/icons/WarningRounded';
import Card from '@material-ui/core/Card';

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(1),
    overflowX: 'auto',
  },
  heading: {
    padding: theme.spacing(2),
  },
  eventHeader: {
    display: 'flex'
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
    if(!this.props.divisions) {
      this.props.getDivisions();
    }
    if(!this.props.leagues) {
      this.props.getLeagues();
    }
    if(!this.props.seasons) {
      this.props.getSeasons();
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

  renderEvents = (season) => {
    const {events, matches, team} = this.props;
    if(!events || !matches) {
      return <LoadingSpinner/>;
    }

    const seasonEvents = events.filter((e) => e.season_id === season.id);

    return seasonEvents.sort((a, b) => {
      let diff;
      diff = a.start_date.localeCompare(b.start_date);
      if(diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    } ).map((evt) => {
      const theMatches = matches.filter((m) => m.event_id === evt.id);
      return <div key={evt.id}>
        <div className={this.props.classes.heading}>
          <div className={this.props.classes.eventHeader}>
            <Typography variant="h6" gutterBottom><TextLink to={`/events/summary/${evt.id}`}>{evt.name}</TextLink></Typography>
            <EventChip event={evt}/>
          </div>

          {theMatches.filter((m) => m.played).length > 0 ? <p style={{marginBottom: 0, marginTop: 0}}>
            {`Team ${team.number} ${evt.aasm_state === 'in_progress' ? 'is' : 'was'} `}
            <b>Rank {team.rankings[evt.id]}</b>{' with a record of '}
            <b style={{whiteSpace: 'nowrap'}}>{`${team.event_records[evt.id].win}-${team.event_records[evt.id].loss}-${team.event_records[evt.id].tie}`}</b>
          </p> : null}
        </div>
        <MatchTable team={this.props.team.number} matches={theMatches}/>
      </div>;});
  };

  render () {
    if(!this.props.team) {
      return <LoadingSpinner/>;
    }

    const {team, divisions, matches, seasons} = this.props;

    return <Paper className={this.props.classes.root}>
      <div className={this.props.classes.heading}>
        <Typography variant="h4">Team {team.number} – {team.name}</Typography>
        { team.consent_missing ? <Card >
              <div width="100%" style={{background: 'red', color: 'white'}}><WarningIcon/></div>
              <p style={{paddingLeft: '1em', paddingRight: '1em'}}>
                This team has not submitted FIRST Illinois Robotics consent forms and will not be permitted to compete at the
                league championship unless these forms are submitted.
                Please contact <TextLink href="mailto:jweiland@firstillinoisrobotics.org">Jonathan Weiland</TextLink> with any questions.
              </p>
            </Card>
            : null}
        <p>
          <b>Organization:</b> {team.organization}<br/>
          <b>Location:</b> {team.city}, {team.state}, {team.country}<br/>
        </p>

        { seasons.map((season) => {
          return <div key={season.id} style={{paddingBottom: '2em'}}>
            <Typography variant="h5">{season.name} ({season.year}) Season</Typography>

            {divisions[season.id] ?
              <><span><b>League:</b> <TextLink to={`/leagues/rankings/${divisions[season.id].league.id}`}>{divisions[season.id].league.name}</TextLink>
                {' – '}<TextLink to={`/divisions/rankings/${divisions[season.id].division.id}`}>{divisions[season.id].division.name}</TextLink></span><br/></> : null }
            {team.season_records[season.id] ?
              <><b>Season Record:</b> {`${team.season_records[season.id].win}-${team.season_records[season.id].loss}-${team.season_records[season.id].tie}`}</> : null }

            {this.renderEvents(season)}
          </div>;
        })}

      </div>


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
    ret.matches = Object.values(state.matches).filter((m) => m.red_alliance.includes(id) || m.blue_alliance.includes(id));
  }
  if(ret.team && ret.team.division_ids && state.divisions && state.leagues) {
    ret.divisions = Object.fromEntries(ret.team.division_ids.map((div_id) => {
      const division = state.divisions[div_id];
      const league = state.leagues[division.league_id];
      return [league.season_id, {division, league}]
    }));
  }
  if(ret.team && state.seasons) {
    let allTeamSeasons = Object.keys(ret.team.season_records).map(i => parseInt(i));
    if(ret.divisions) {
      allTeamSeasons += Object.keys(ret.divisions);
    }
    ret.seasons = Object.values(state.seasons).filter((s) => allTeamSeasons.includes(s.id))
      .sort((a, b) => {
        const yearcomp = b.year.localeCompare(a.year);
        if(yearcomp === 0) {
          return b.id - a.id;
        }
        return yearcomp;
      });
  }
  return ret;
};

const mapDispatchToProps = {
  getTeamDetails,
  setTitle,
  getLeagues,
  getDivisions,
  getSeasons
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventsSummary));