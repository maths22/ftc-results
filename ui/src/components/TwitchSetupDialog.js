import React, {Component} from 'react';
import {connect} from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import {getEvents} from '../actions/api';
import Grid from '@material-ui/core/Grid/Grid';
import CircularProgress from '@material-ui/core/es/CircularProgress/CircularProgress';
import {setupTwitch, removeTwitch} from '../actions/uploaderApi';
import TextLink from './TextLink';

class TwitchSetupDialog extends Component {

  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
    this.state = {error: null, inProgress: false};
  }

  toggleStreaming = async () => {
    this.setState({inProgress: true});
    try {
      const action = this.props.event.channel ? this.props.removeTwitch : this.props.setupTwitch;
      const results = await action(this.props.event.id);
      if(results.error) {
        this.setState({error: results.payload.response.error});
      } else {
        this.setState({error: null});
        await this.props.getEvents();
      }
    } catch (ex) {
      console.log(ex);
    }
    this.setState({inProgress: false});
  };

  renderEnabledInfo = (channel) => {
    return <div>
      <p>
        Live streaming is currently <b>enabled</b>.  Your event will be streamed on channel <TextLink target="_blank" href={`https://twitch.tv/${channel}`}>{channel}</TextLink>.
        You should have received stream key information by email.
      </p>
      <p>
        To disable live streaming, click 'Disable'.  If you later decide to re-enable live streaming, you may be assigned a different channel.
      </p>
    </div>;
  };

  renderDisabledInfo = () => {
    return <div>
      <p>
        Live streaming is currently <b>disabled</b>.
      </p>
      <p>
        To enable live streaming, click 'Enable'.  You will be assigned a channel, and will receive additional information concerning your stream key via email.
      </p>
    </div>;
  };

  onClose = () => {
    this.setState({error: null});
    this.props.onClose();
  };

  render () {
    if(this.props.event == null) return null;
    const {error} = this.state;

    //TODO dynamic
    const streamingEnabled = !!this.props.event.channel;
    return <Dialog
        open={this.props.event !== null}
        onClose={this.onClose}
        aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Live Streaming Setup for {this.props.event.name}</DialogTitle>
      <DialogContent>
        <p>
          FTC Results supports live streaming via Twitch.
        </p>

        {streamingEnabled ? this.renderEnabledInfo(this.props.event.channel) : this.renderDisabledInfo()}

        {error && <Grid item xs={12}>
          <Typography color="error">Error: {error}</Typography>
        </Grid> }

      </DialogContent>
      <DialogActions>
        <Button onClick={this.onClose} color="primary">
          Close
        </Button>
        { this.state.inProgress ?
           <CircularProgress size="1.5em"/> :
           <Button onClick={this.toggleStreaming} color="primary">
          {streamingEnabled ? 'disable' : 'enable'}
        </Button> }
      </DialogActions>
    </Dialog>;
  }
}



const mapStateToProps = (state, ownProps) => {
  if (state.events && ownProps.id) {
    return {
      event: state.events[ownProps.id]
    };
  }
  return {
    event: null
  };
};

const mapDispatchToProps = {
  getEvents,
  setupTwitch,
  removeTwitch
};

export default connect(mapStateToProps, mapDispatchToProps)(TwitchSetupDialog);