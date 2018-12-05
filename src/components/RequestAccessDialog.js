import React, {Component} from 'react';
import {connect} from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

import {getEvents, requestAccess} from '../actions/api';
import Grid from '@material-ui/core/Grid/Grid';
import CircularProgress from '@material-ui/core/es/CircularProgress/CircularProgress';

class DivisionsSummary extends Component {

  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
    this.state = {error: null, accessMessage: '', inProgress: false};
  }

  requestAccess = async () => {
    this.setState({inProgress: true});
    try {
      const results = await this.props.requestAccess(this.props.event.id, this.props.uid, this.state.accessMessage);
      if(results.error) {
        this.setState({error: results.payload.response.error});
      } else {
        this.props.onClose();
      }
    } catch (ex) {
      console.log(ex);
    }
    this.setState({inProgress: false});
  };


  render () {
    if(this.props.event == null) return null;
    const {error} = this.state;
    return <Dialog
        open={this.props.event !== null}
        onClose={this.props.onClose}
        aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Request Access for {this.props.event.name}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please only request access if you are the scorekeeper, FTA, or event coordinator for your event.

          {error && <Grid item xs={12}>
            <Typography color="error">Error: {error}</Typography>
          </Grid> }
        </DialogContentText>
        <TextField
            placeholder="Message"
            multiline={true}
            rows={4}
            rowsMax={10}
            style={{width: '100%'}}
            value={this.state.accessMessage}
            onChange={(e) => this.setState({accessMessage: e.target.value})}
        />

      </DialogContent>
      <DialogActions>
        <Button onClick={this.props.onClose} color="primary">
          Cancel
        </Button>
        { this.state.inProgress ?
           <CircularProgress size="1.5em"/> :
           <Button onClick={this.requestAccess} color="primary" disabled={this.state.accessMessage.length === 0}>
          Import
        </Button> }
      </DialogActions>
    </Dialog>;
  }
}



const mapStateToProps = (state, ownProps) => {
  if (state.events && ownProps.id) {
    return {
      event: state.events[ownProps.id],
      uid: state.token['x-uid']
    };
  }
  return {
    event: null
  };
};

const mapDispatchToProps = {
  getEvents,
  requestAccess
};

export default connect(mapStateToProps, mapDispatchToProps)(DivisionsSummary);