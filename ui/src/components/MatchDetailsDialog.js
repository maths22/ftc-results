import React, {Component} from 'react';
import {connect} from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';

import CloseIcon from '@material-ui/icons/Close';

import {getMatchDetails} from '../actions/api';
import RoverRuckusScoreTable from './RoverRuckusScoreTable';
import withMobileDialog from '@material-ui/core/withMobileDialog';
import IconButton from '@material-ui/core/IconButton';

class MatchDetailsDialog extends Component {

  componentDidMount() {
    if (this.props.id !== null) {
      this.props.getMatchDetails(this.props.id);
    }
  }

  componentDidUpdate(oldProps) {
    if(oldProps.id !== this.props.id && this.props.id !== null) {
      this.props.getMatchDetails(this.props.id);
    }
  }

  render () {
    if(this.props.match == null) return null;

    const {event, match, fullScreen} = this.props;

    const tableForSeason = {
      'RoverRuckusScore': RoverRuckusScoreTable
    };
    const ScoreTable = tableForSeason[match.season_score_type];

    const prefixes = {'qual': 'Q-', 'semi': 'SF-', 'final': 'F-'};
    const matchDisplay = prefixes[match.phase] + (match.series ? (match.series + '-') : '') + match.number;
    return <Dialog
        fullScreen={fullScreen}
        open={match !== null}
        onClose={this.props.onClose}
        aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title" disableTypography style={{display: 'flex', alignItems: 'center'}}>
        <Typography variant="h6" style={{flexGrow: 1}}>Results for {event.name} - Match {matchDisplay}</Typography>
        <IconButton onClick={this.props.onClose}><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent>
        <ScoreTable match={match}/>
        <DialogContentText>
          <Typography variant="caption">
            Note: penalty points are listed for the alliance which incurred the penalty. Points are awarded to the opposing alliance.
          </Typography>
        </DialogContentText>
      </DialogContent>
    </Dialog>;
  }
}



const mapStateToProps = (state, ownProps) => {
  const ret = {};
  if (ownProps.id) {
    ret.match = state.matchDetails[ownProps.id];
    if(ret.match) {
      ret.event = state.events[ret.match.event_id];

    }
  }
  return ret;
};

const mapDispatchToProps = {
  getMatchDetails
};

export default connect(mapStateToProps, mapDispatchToProps)(withMobileDialog()(MatchDetailsDialog));