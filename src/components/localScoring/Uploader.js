import React, {Component} from 'react';
import {Field, reduxForm, SubmissionError} from 'redux-form';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core';
import {getDivisions, getEvents, getLeagues} from '../../actions/api';
import connect from 'react-redux/es/connect/connect';
import {
  getLocalEvents,
  getLocalVersion,
  localReset,
  setEvent,
  setRunning,
  setServer
} from '../../actions/localScoringApi';
import LoadingSpinner from '../LoadingSpinner';
import {setTitle} from '../../actions/ui';
import Paper from '@material-ui/core/Paper';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import ScoringServerPicker from './ScoringServerPicker';
import InternalUploader from './InternalUploader';


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    width: '100%',
  },
  root: {
    width: '100%',
    marginTop: theme.spacing.unit,
    overflowX: 'auto',
    padding: 2 * theme.spacing.unit
  },
  serverPicker: {
    width: '50em'
  }
});

class Uploader extends Component {
  componentDidMount() {
    if(!this.props.event) {
      this.props.getEvents();
    }
    if(this.props.localServer.verified && !this.props.localEvents) {
      this.props.getLocalEvents();
    }
    this.setTitle();
  }

  componentDidUpdate(oldProps) {
    if(oldProps.event !== this.props.event) {
      this.setTitle();
    }

    if(this.props.localServer.verified && !oldProps.localServer.verified) {
      this.props.getLocalEvents();
    }

    if(this.props.localEvent && !this.props.localEvents.includes(this.props.server.event) &&
        this.props.localServer.event !== '') {
      this.props.setEvent('');
    }
    if(this.props.localServer.event === '' && this.props.localEvents && this.props.event) {
      if(this.props.localEvents.includes(this.props.event.slug)) {
        this.props.setEvent(this.props.event.slug);
      }
    }
  }

  setTitle() {
    this.props.setTitle(this.props.event ? 'Uploader for ' + this.props.event.name : 'Uploader');
  }

  componentWillUnmount() {
    this.props.setTitle(null);
  }

  toggleRunning = () => {
    if(this.props.localServer.uploadRunning) {
      this.props.setRunning(false);
      //TODO stop cleanly
    } else {
      this.props.localReset();
      this.props.setRunning(true);
    }
  };

  render() {
    if(!this.props.event) {
      return <LoadingSpinner/>;
    }

    const {classes, localEvents, localServer} = this.props;
    console.log(localEvents);
    return (
      <Paper className={classes.root}>
        <ScoringServerPicker
            className={classes.serverPicker}
            disabled={localServer.uploadRunning}
        />
        {localEvents ? <div>
          <Select
              value={localServer.event}
              displayEmpty
              disabled={localServer.uploadRunning}
              onChange={(e) => this.props.setEvent(e.target.value)}
          >
            <MenuItem value="">
              <em>Event</em>
            </MenuItem>
            {localEvents.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
          </Select>
        </div> : null}
        {localServer.event !== '' ?
            <Button onClick={this.toggleRunning} >{localServer.uploadRunning ? 'Stop' : 'Start'}</Button>
        : null}
        <InternalUploader event={this.props.id} />
      </Paper>
    );
  }
}

const mapStateToProps = (state, props) => {
  const ret = {};
  const id = parseInt(props.id);
  if (state.events) {
    ret.event = state.events[id];
  }
  ret.localServer = state.localScoring.server;
  ret.localEvents = state.localScoring.events;
  return ret;
};

const mapDispatchToProps = {
  getEvents,
  getLocalEvents,
  getLocalVersion,
  localReset,
  setEvent,
  setServer,
  setTitle,
  setRunning
};

export default connect(mapStateToProps, mapDispatchToProps)
  (withStyles(styles)(Uploader));