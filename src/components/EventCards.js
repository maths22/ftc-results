import React, {Component} from 'react';
import {connect} from 'react-redux';
import { push } from 'connected-react-router';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/CheckCircle';

import {API_HOST, getDivisions, getEvents, getLeagues, scoring_download_url} from '../actions/api';
import EventImportDialog from './EventImportDialog';
import LoadingSpinner from './LoadingSpinner';
import {withStyles} from '@material-ui/core';
import TextLink from './TextLink';
import RequestAccessDialog from './RequestAccessDialog';
import TwitchSetupDialog from './TwitchSetupDialog';
import EventChip from './EventChip';
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit,
    overflowX: 'auto',
    padding: theme.spacing.unit * 2
  },
});

class EventCards extends Component {

  constructor(props) {
    super(props);
    this.state = {importEvent: null, accessEvent: null, streamEvent: null};
  }

  componentDidMount() {
    if(!this.props.events) {
      this.props.getEvents();
      this.props.getDivisions();
      this.props.getLeagues();
    }
  }

  componentDidUpdate() {
    if(!this.props.events) {
      this.props.getEvents();
      this.props.getDivisions();
      this.props.getLeagues();
    }
  }

  render () {
    if(!this.props.events) {
      return <LoadingSpinner/>;
    }
    const { classes, uid, limit, heading } = this.props;
    let vals = [...this.props.events].sort((a, b) => {
      const diff = a.start_date.localeCompare(b.start_date);
      if(diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    } );
    if(this.props.reverse) {
      vals = vals.reverse();
    }
    vals = vals.slice(0, limit);


    const rowStyle = { height: '2rem' };
    const isLoggedIn = !!uid;

    if(vals.length == 0) return null;

    return <div>
        <Typography variant="h5" gutterBottom>{heading}</Typography>
        <Grid container spacing={24}>
          {vals.map(e => <Grid item md={4}>
              <Card className={classes.card}>
              <CardActionArea onClick={() => this.props.push(`/events/summary/${e.id}`)}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {e.name} <EventChip event={e}/>
                  </Typography>
                  <Typography variant="subtitle1" component="h3">
                    { e.league ?
                        <TextLink to={`/leagues/rankings/${e.league.id}`}>{e.league.name}</TextLink>
                        : null }
                    { e.division ? ' - ' : null}
                    { e.division ?
                        <TextLink to={`/divisions/rankings/${e.division.id}`}>{e.division.name}</TextLink>
                        : null }
                    { ' ' }
                    {e.start_date === e.end_date ? e.start_date : (e.start_date + ' - ' + e.end_date)}
                  </Typography>
                  <Typography gutterBottom variant="subtitle2" component="h3">

                  </Typography>
                  <Typography component="p">
                    {e.location}<br/>{e.city}, {e.state}, {e.country}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>)}

        </Grid>

      </div>;
  }
}




const mapStateToProps = (state, props) => {
  if (state.events && state.divisions && state.leagues) {
    return {
      events: Object.values(state.events)
          .filter(props.filter || (() => true))
          .map((evt) => {
            const extra = {};
            if (evt.context_type === 'Division') {
              extra.division = state.divisions[evt.context_id];
              extra.league = state.leagues[extra.division.league_id];
            } else if (evt.context_type === 'League') {
              extra.league = state.leagues[evt.context_id];

            }
            return Object.assign({}, evt, extra);
          }
      ),
      uid: state.token['x-uid']
    };
  }
  return {
    events: null
  };
};

const mapDispatchToProps = {
  getDivisions,
  getEvents,
  getLeagues,
  push
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventCards));