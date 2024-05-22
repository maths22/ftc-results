import React, {Component} from 'react';
import Button from '@mui/material/Button';
import {getEvent} from '../../actions/api';
import {resetEvent} from '../../actions/uploaderApi';
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
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ScoringServerPicker from './ScoringServerPicker';
import InternalUploader from './InternalUploader';

class Uploader extends Component {
  componentDidMount() {
    if(!this.props.event) {
      this.props.getEvent(this.props.selectedSeason, this.props.id);
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

  resetEvent = () => {
    if(window.confirm(`Are you sure you want to reset ${this.props.event.name}?\n(THIS WILL CLEAR ALL DATA FOR ALL DIVISIONS)`)) {
      const wasRunning = this.props.localServer.uploadRunning;
      if(wasRunning) {
        this.props.setRunning(false);
      }
      this.props.resetEvent(this.props.event.id).then((arg) => {
        if(wasRunning && !arg.error) {
          this.props.setRunning(true);
        }
      });
    }
  };

  render() {
    if(!this.props.event) {
      return <LoadingSpinner/>;
    }

    const {localEvents, localServer} = this.props;

    return (
      <Paper sx={{
        marginTop: 1,
        padding: 2,
        width: '100%',
        overflowX: 'auto'
      }}>
        <ScoringServerPicker
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
            <Button onClick={this.toggleRunning} variant="contained">{localServer.uploadRunning ? 'Stop' : 'Start'}</Button>
        : null}
        <InternalUploader season={this.props.selectedSeason} event={this.props.id} /><br/>

        <Button onClick={this.resetEvent} variant="contained">Reset Event</Button>
      </Paper>
    );
  }
}

const mapStateToProps = (state, props) => {
  const ret = {};
  const id = parseInt(props.id);
  if (state.events) {
    ret.event = Object.values(state.events).find((e) => e.slug === props.id );
    if(!ret.event || !ret.event.id) ret.event = null;
  }
  ret.localServer = state.localScoring.server;
  ret.localEvents = state.localScoring.events;
  return ret;
};

const mapDispatchToProps = {
  getEvent,
  getLocalEvents,
  getLocalVersion,
  localReset,
  resetEvent,
  setEvent,
  setServer,
  setTitle,
  setRunning
};

export default connect(mapStateToProps, mapDispatchToProps)(Uploader);