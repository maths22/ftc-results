import React, {Component} from 'react';
import {connect} from 'react-redux';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import {getEvents, importEventResults} from '../actions/api';
import activeStorageUpload from '../actions/upload';
import Grid from '@mui/material/Grid/Grid';
import {invalidateRankings} from '../actions/util';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

class DivisionsSummary extends Component {

  constructor(props) {
    super(props);
    this.fileInput = React.createRef();
    this.state = {error: null, inProgress: false, selectedDivision: 0};
  }

  import = async () => {
    if(this.fileInput.current.files.length === 0) return;
    this.setState({inProgress: true});
    const file = this.fileInput.current.files[0];
    try {
      const results = await this.props.importEventResults(this.props.event.id, file, this.state.selectedDivision);
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

  hasDivisions = () => {
    const { event } = this.props;
    if(!event) return false;
    return !(!event.divisions || event.divisions.length === 0);
  };


  render () {
    if(this.props.event == null) return null;
    const {error} = this.state;
    const {event} = this.props;
    return <Dialog
        open={event !== null}
        onClose={this.props.onClose}
        aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Import Results for {event.name}</DialogTitle>
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

        {this.hasDivisions() ?
        <Select value={this.state.selectedDivision} onChange={(evt) => this.setState({selectedDivision: evt.target.value})}>
          <MenuItem value={0}>Finals Division</MenuItem>
          {event.divisions.map((d) => {
            return <MenuItem value={d.number}>{d.name} Division</MenuItem>;
          })}
        </Select> : null}

      </DialogContent>
      <DialogActions>
        <Button onClick={this.props.onClose} color="primary">
          Cancel
        </Button>
        { this.state.inProgress ?
           <CircularProgress size="1.5em"/> :
           <Button onClick={this.import} color="primary" disabled={this.fileInput.current && this.fileInput.current.files.length === 0}>
          Import
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
  activeStorageUpload,
  importEventResults,
  invalidateRankings
};

export default connect(mapStateToProps, mapDispatchToProps)(DivisionsSummary);