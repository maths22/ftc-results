import React, {Component} from 'react';
import {connect} from 'react-redux';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import {getEvents, requestAccess} from '../actions/api';
import Grid from '@mui/material/Grid/Grid';
import CircularProgress from '@mui/material/CircularProgress';

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
    return (
      <Dialog
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
              maxRows={10}
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
            Submit Request
          </Button> }
        </DialogActions>
      </Dialog>
    );
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