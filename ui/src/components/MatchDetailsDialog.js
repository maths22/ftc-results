import React, {Component, Suspense} from 'react';
import {connect} from 'react-redux';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import CloseIcon from '@mui/icons-material/Close';

import {getMatchDetails} from '../actions/api';
import IconButton from '@mui/material/IconButton';

// FIXME checkout https://mui.com/components/use-media-query/#using-material-uis-breakpoint-helpers
const withMobileDialog = () => (WrappedComponent) => (props) => <WrappedComponent {...props} maxWidth="xl" fullWidth />;

class MatchDetailsErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
  }

  render() {
    if (this.state.hasError) {
      return <div>Details could not be loaded for this match</div>;
    }

    return this.props.children;
  }
}

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


    const ScoreTable = React.lazy(() => import(/* webpackChunkName: "scoreTable-[request]" */ `./scoreTables/${match.season_score_type}Table`));

    const prefixes = {'qual': 'Q-', 'semi': 'SF-', 'final': 'F-'};
    const matchDisplay = prefixes[match.phase] + (match.series ? (match.series + '-') : '') + match.number;
    return (
      <Dialog
          fullScreen={fullScreen}
          open={match !== null}
          onClose={this.props.onClose}
          aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title" style={{display: 'flex', alignItems: 'center'}}>
          <Typography variant="h6" style={{flexGrow: 1}}>Results for {event.name} - Match {matchDisplay}</Typography>
          <IconButton onClick={this.props.onClose} size="large"><CloseIcon/></IconButton>
        </DialogTitle>
        <DialogContent>
          <MatchDetailsErrorBoundary>
            <Suspense fallback={<div>Loading...</div>}>
              <ScoreTable match={match}/>
            </Suspense>
          </MatchDetailsErrorBoundary>
        </DialogContent>
      </Dialog>
    );
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