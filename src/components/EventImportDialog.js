import React, {Component} from 'react';
import {connect} from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

import {getEvents, importEventResults} from '../actions/api';
import activeStorageUpload from '../actions/upload';
import Grid from '@material-ui/core/Grid/Grid';
import {invalidateRankings} from '../actions/util';
import CircularProgress from '@material-ui/core/es/CircularProgress/CircularProgress';

class DivisionsSummary extends Component {

  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
    this.state = {error: null, inProgress: false};
  }

  import = async () => {
    if(this.fileInput.current.files.length === 0) return;
    this.setState({inProgress: true});
    try {
      const blob = await this.props.activeStorageUpload(this.fileInput.current.files[0]);
      const results = await this.props.importEventResults(this.props.event.id, blob['signed_id']);
      if(results.error) {
        this.setState({error: results.payload.response.error});
      } else {
        this.props.onClose();
        this.props.getEvents();
        this.props.invalidateRankings();
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
      <DialogTitle id="form-dialog-title">Import Results for {this.props.event.name}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Upload the event DB here

          {error && <Grid item xs={12}>
            <Typography color="error">Error: {error}</Typography>
          </Grid> }
        </DialogContentText>
        <input
            ref={this.fileInput}
            type='file'
            hidden
            accept='.db'
            onChange={() => this.forceUpdate()}
        />
        <Button
            type='file'
            onClick={() => {
              this.fileInput.current.click();
            }}
        >
          Choose File <Typography variant="caption" style={{'margin-left': '0.5em', 'text-transform': 'none'}}>
          { this.fileInput.current && this.fileInput.current.files.length > 0 ? this.fileInput.current.files[0].name : 'No file chosen'}
          </Typography>
        </Button>

      </DialogContent>
      <DialogActions>
        <Button onClick={this.props.onClose} color="primary">
          Cancel
        </Button>
        { this.state.inProgress ?
            <CircularProgress size="1.5em"/>
           : <Button onClick={this.import} color="primary" disabled={this.fileInput.current && this.fileInput.current.files.length === 0}>
          Import
        </Button>
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
  activeStorageUpload,
  importEventResults,
  invalidateRankings
};

export default connect(mapStateToProps, mapDispatchToProps)(DivisionsSummary);