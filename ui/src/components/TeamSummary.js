import React, {Component} from 'react';
import {connect} from 'react-redux';

import Paper from '@material-ui/core/Paper';

import {getTeamDetails} from '../actions/api';
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
    marginTop: theme.spacing.unit,
    overflowX: 'auto',
  },
  heading: {
    padding: 2 * theme.spacing.unit,
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
    const {events, matches, team} = this.props;
    if(!events || !matches) {
      return <LoadingSpinner/>;
    }

    return events.sort((a, b) => {
      const diff = a.start_date.localeCompare(b.start_date);
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
            <b style={{whiteSpace: 'nowrap'}}>{`${team.records[evt.id].win}-${team.records[evt.id].loss}-${team.records[evt.id].tie}`}</b>
          </p> : null}
        </div>
        <MatchTable team={this.props.team.number} matches={theMatches}/>
      </div>;});
  };

  render () {
    if(!this.props.team) {
      return <LoadingSpinner/>;
    }

    const {team, league, division, matches} = this.props;

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
          {division && league ?
              <span><b>League:</b> <TextLink to={`/leagues/rankings/${league.id}`}>{league.name}</TextLink>
                {' – '}<TextLink to={`/divisions/rankings/${division.id}`}>{division.name}</TextLink></span> : null }
        </p>

        {matches.length > 0 ? <p style={{marginBottom: 0}}>
          <b>Season Record:</b> {`${team.record.win}-${team.record.loss}-${team.record.tie}`}
        </p> : null}
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
    ret.matches = Object.values(state.matches).filter((m) => m.red_alliance.includes(id) || m.blue_alliance.includes(id));
  }
  if(ret.team && ret.team.division_id && state.divisions && state.leagues) {
    ret.division = state.divisions[ret.team.division_id];
    ret.league = state.leagues[ret.division.league_id];
  }
  return ret;
};

const mapDispatchToProps = {
  getTeamDetails,
  setTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventsSummary));