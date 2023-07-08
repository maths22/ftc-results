import React, {Component} from 'react';
import {connect} from 'react-redux';

import {getTeamDetails, getLeagues, getSeasons} from '../actions/api';
import {setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import withStyles from '@mui/styles/withStyles';
import Typography from '@mui/material/Typography';
import MatchTable from './MatchTable';
import TextLink from './TextLink';
import EventChip from './EventChip';

import WarningIcon from '@mui/icons-material/WarningRounded';
import Card from '@mui/material/Card';

const styles = (theme) => ({
  root: {
    width: '100%',
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
      return <Card key={evt.id} style={{margin: '1em 0'}}>
        <div className={this.props.classes.heading}>
          <div className={this.props.classes.eventHeader}>
            <Typography variant="h6" gutterBottom><TextLink to={`/${season.year}/events/summary/${evt.slug}`}>{evt.name}</TextLink></Typography>
            <EventChip event={evt}/>
          </div>

          {theMatches.filter((m) => m.played).length > 0 && !(evt.remote && evt.type === 'league_meet') ? <p style={{marginBottom: 0, marginTop: 0}}>
            Team {team.number} {evt.type === 'league_meet' ? null : <>{evt.aasm_state === 'in_progress' ? 'is' : 'was'} <b>Rank {team.rankings[evt.id]}</b></>}
            {evt.remote ? null : <>{evt.type === 'league_meet' ? ' ' + (evt.aasm_state === 'in_progress' ? 'has' : 'had') + ' a record of ' : ' with a record of '}
            <b style={{whiteSpace: 'nowrap'}}>{`${team.event_records[evt.id].win}-${team.event_records[evt.id].loss}-${team.event_records[evt.id].tie}`}</b></>}
          </p> : null}
        </div>
        <MatchTable team={this.props.team.number} matches={theMatches} remote={evt.remote} />
      </Card>;});
  };

  render () {
    if(!this.props.team) {
      return <LoadingSpinner/>;
    }

    const {team, leagues, seasons} = this.props;

    return <div className={this.props.classes.root}>
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

            {leagues[season.id] ?
              <><span><b>League:</b> {leagues[season.id].league ? <><TextLink to={`/${season.year}/leagues/rankings/${leagues[season.id].league.slug}`}>{leagues[season.id].league.name}</TextLink>{' – '}</> : null }
                <TextLink to={`/${season.year}/leagues/rankings/${leagues[season.id].slug}`}>{leagues[season.id].name}</TextLink></span><br/></> : null }
            {team.season_records[season.id] ?
              <><b>Season Record:</b> {`${team.season_records[season.id].win}-${team.season_records[season.id].loss}-${team.season_records[season.id].tie}`}</> : null }

            {this.renderEvents(season)}
          </div>;
        })}

      </div>


    </div>;
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
    ret.matches = Object.values(state.matches).filter((m) => m.team ? m.team.includes(id) : (m.red_alliance.includes(id) || m.blue_alliance.includes(id)));
  }
  if(ret.team && ret.team.league_ids && state.leagues) {
    ret.leagues = Object.fromEntries(ret.team.league_ids.map((id) => {
      const league = state.leagues[id];
      return [league.season_id, league];
    }));
  }
  if(ret.team && state.seasons) {
    let allTeamSeasons = Object.keys(ret.team.season_records).map(i => parseInt(i));
    if(ret.leagues) {
      allTeamSeasons += Object.keys(ret.leagues);
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
  getSeasons
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventsSummary));