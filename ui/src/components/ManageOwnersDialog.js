import React, {Component} from 'react';
import {connect} from 'react-redux';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import {pickBy} from 'lodash';
import Autocomplete from '@mui/material/Autocomplete';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

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
    return (
      <Dialog
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
                  <IconButton
                    onClick={confirm(() => this.removeOwner(uid),
                      {
                        title: 'Are you sure you want to remove this owner?',
                        description: (owners && owners[uid] && owners[uid].name ? `${owners[uid].name} (${uid})` : uid)
                      }
                    )}
                    edge="end"
                    aria-label="delete"
                    size="large">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            )}
          </List>
          <DialogContentText>
            Add owner:
          </DialogContentText>
          {/*<Autocomplete*/}
          {/*  label="Owner"*/}
          {/*  value={this.state.newOwnerUid}*/}
          {/*  onOptionSelected={(object) => this.setState({newOwnerUid: object})}*/}
          {/*  onLoadOptions={async (q) => (await this.props.searchUsers(q)).payload }*/}
          {/*  valueProp={option => option && option.uid}*/}
          {/*  textProp={option => option && (option.name ? `${option.name} (${option.uid})` : option.uid)}*/}
          {/*/>*/}


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
      </Dialog>
    );
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

export default connect(mapStateToProps, mapDispatchToProps)(ManageOwnersDialog);