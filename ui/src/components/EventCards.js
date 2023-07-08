import React, {Component} from 'react';
import {connect} from 'react-redux';
import { push } from 'connected-react-router';


import {getEvents, getLeagues} from '../actions/api';
import LoadingSpinner from './LoadingSpinner';
import withStyles from '@mui/styles/withStyles';
import TextLink from './TextLink';
import EventChip from './EventChip';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(1),
    overflowX: 'auto',
    padding: theme.spacing(2)
  },
});

class EventCards extends Component {

  constructor(props) {
    super(props);
    this.state = {isLoading: false};
  }

  componentDidMount() {
    if(this.props.selectedSeason) {
      this.props.getEvents(this.props.selectedSeason);
      this.props.getLeagues(this.props.selectedSeason);
    }
  }

  componentDidUpdate(prevProps) {
    if(!this.props.events || (this.props.selectedSeason !== prevProps.selectedSeason)) {
      this.props.getEvents(this.props.selectedSeason);
      this.props.getLeagues(this.props.selectedSeason);
    }
  }

  render () {
    if(!this.props.events) {
      return <LoadingSpinner/>;
    }
    const { classes, limit, heading, showNone } = this.props;
    let vals = [...this.props.events].sort((a, b) => {
      const diff = a.start_date.localeCompare(b.start_date);
      if(diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    } );
    if(this.props.reverse) {
      vals = vals.reverse();
    }
    vals = vals.slice(0, limit);

    if(vals.length === 0) {
      if(showNone) {
        return <div style={{padding: '1em 0'}}>
          <Typography variant="h5" gutterBottom>No {heading}</Typography>
        </div>;
      } else {
        return null;
      }
    }

    return <div>
        <Typography variant="h5" gutterBottom>{heading}</Typography>
        <Grid container spacing={3}>
          {vals.map(e => <Grid item md={4} key={e.id}>
              <Card className={classes.card}>
              <CardActionArea onClick={() => this.props.push(`/${this.props.selectedSeason}/events/summary/${e.slug}`)}>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="h2">
                    {e.name} <EventChip event={e}/>
                  </Typography>
                  <Typography variant="subtitle1" component="h3">
                    { e.league && e.league.league ?
                        <TextLink to={`/${this.props.selectedSeason}/leagues/rankings/${e.league.league.slug}`}>{e.league.league.name}</TextLink>
                        : null }
                    { e.league && e.league.league ? ' - ' : null}
                    { e.league ?
                        <TextLink to={`/${this.props.selectedSeason}/leagues/rankings/${e.league.slug}`}>{e.league.name}</TextLink>
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
  const ret = {};
  if (state.events && state.leagues) {
    ret.events = Object.values(state.events)
        .filter((e) => e.season === props.selectedSeason)
        .filter(props.filter || (() => true))
        .map((evt) => {
          const extra = {};
          if (evt.context_type === 'League') {
            extra.league = state.leagues[evt.context_id];
          }
          return Object.assign({}, evt, extra);
        }
      );
  }
  return ret;
};

const mapDispatchToProps = {
  getEvents,
  getLeagues,
  push
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventCards));