import React, {Component} from 'react';
import {connect} from 'react-redux';

import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid/Grid';
import CircularProgress from '@material-ui/core/es/CircularProgress/CircularProgress';
import {pickBy} from 'lodash';
import {Autocomplete} from '@dccs/react-autocomplete-mui/lib';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import DeleteIcon from '@material-ui/icons/Delete';

import withConfirm from 'material-ui-confirm';

import {addOwner, getEvents, getUsers, removeOwner, requestAccess, searchUsers} from '../actions/api';

class ManageOwnersDialog extends Component {

  constructor(props) {
    super(props);
    this.state = {error: null, accessMessage: '', inProgress: false};
  }

  addOwner = async () => {
    this.setState({inProgress: true});
    try {
      const results = await this.props.addOwner(this.props.event.id, this.state.newOwnerUid);
      if(results.error) {
        this.setState({error: results.payload.response.error});
      } else {
        this.setState({error: null});
      }
    } catch (ex) {
      console.log(ex);
    }
    this.setState({inProgress: false});
  };

  removeOwner = async (uid) => {
    try {
      const results = await this.props.removeOwner(this.props.event.id, uid);
      if(results.error) {
        this.setState({error: results.payload.response.error});
      } else {
        this.setState({error: null});
      }
    } catch (ex) {
      console.log(ex);
    }
  };

  componentDidUpdate(prevProps) {
    if(!prevProps.event && this.props.event) {
      const users = Object.keys(pickBy(this.props.owners, (o) => !o));
      this.props.getUsers(users);
    }
  }

  render () {
    if(this.props.event == null) return null;
    const {error} = this.state;
    const {onClose, event, owners, confirm} = this.props;
    return <Dialog
        open={event !== null}
        onClose={onClose}
        aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Manage Owners for {event.name}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Current owners:
        </DialogContentText>
        <List dense={true}>
          {event.owners.map((uid) =>
            <ListItem>
              <ListItemText
                primary={owners && owners[uid] && owners[uid].name ? owners[uid].name : uid}
                secondary={owners && owners[uid] && owners[uid].name ? uid : null}
              />
              <ListItemSecondaryAction>
                <IconButton onClick={confirm(() => this.removeOwner(uid),
                  {
                    title: 'Are you sure you want to remove this owner?',
                    description: (owners && owners[uid] && owners[uid].name ? `${owners[uid].name} (${uid})` : uid)
                  }
                )} edge="end" aria-label="delete">
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          )}
        </List>
        <DialogContentText>
          Add owner:
        </DialogContentText>
        <Autocomplete
          label="Owner"
          value={this.state.newOwnerUid}
          onOptionSelected={(object) => this.setState({newOwnerUid: object})}
          onLoadOptions={async (q) => (await this.props.searchUsers(q)).payload }
          valueProp={option => option && option.uid}
          textProp={option => option && (option.name ? `${option.name} (${option.uid})` : option.uid)}
        />


        { this.state.inProgress ?
          <CircularProgress size="1.5em"/> :
          <Button onClick={this.addOwner} color="primary" disabled={!this.state.newOwnerUid}>
            Add Owner
          </Button> }


        {error && <Grid item xs={12}>
          <Typography color="error">Error: {error}</Typography>
        </Grid> }

      </DialogContent>
      <DialogActions>
        <Button onClick={this.props.onClose} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>;
  }
}



const mapStateToProps = (state, ownProps) => {
  const ret = {};
  if (state.events && ownProps.id) {
    ret.event = state.events[ownProps.id];
  }
  if (state.users && ret.event) {
    ret.owners = Object.fromEntries(ret.event.owners.map((u) => [u, state.users[u]]));
  }
  return ret;
};

const mapDispatchToProps = {
  addOwner,
  removeOwner,
  getEvents,
  getUsers,
  searchUsers,
  requestAccess
};

export default connect(mapStateToProps, mapDispatchToProps)(withConfirm(ManageOwnersDialog));