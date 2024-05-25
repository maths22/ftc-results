import React, {useState} from 'react';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import type {components} from "../api/v1";
import {useAddOwnerMutation, useRemoveOwnerMutation, useUserSearch} from "../api";
import {useConfirm} from "material-ui-confirm";
import {Autocomplete} from "@mui/material";
import TextField from "@mui/material/TextField";

export default function ManageOwnersDialog({event, onClose}: {
  event?: components['schemas']['event'],
  onClose: () => void
}) {
  const confirm = useConfirm();
  const [uidInput, setUidInput] = useState<string>();
  const [newUser, setNewUser] = useState<{uid: string, name: string} | null>(null);

  const addMutation = useAddOwnerMutation(event?.season, event?.slug)
  const removeMutation = useRemoveOwnerMutation(event?.season, event?.slug)

  const { data: foundUsers, isLoading } = useUserSearch(uidInput)

  function addOwner() {
    if(!newUser) {
      return
    }
    addMutation.mutate(newUser.uid)
  }

  function removeOwner(uid: string) {
    removeMutation.mutate(uid)
  }

  function close() {
    addMutation.reset();
    removeMutation.reset();
    onClose();
  }

  if(!event || !event.owners) {
    return null;
  }

  return (
    <Dialog
        open={true}
        onClose={close}
        aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Manage Owners for {event.name}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Current owners:
        </DialogContentText>
        <List dense={true}>
          {event.owners.map(({uid, name}) =>
            <ListItem key={uid}>
              <ListItemText
                primary={name ? name : uid}
                secondary={name ? uid : null}
              />
              <ListItemSecondaryAction>
                <IconButton
                  onClick={() => confirm(
                    {
                      title: 'Are you sure you want to remove this owner?',
                      description: (name ? `${name} (${uid})` : uid)
                    }
                  ).then(() => removeOwner(uid))}
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
        <Autocomplete
          value={newUser}
          onChange={(_, object) => setNewUser(object)}
          inputValue={uidInput}
          onInputChange={(_, value) => setUidInput(value)}
          options={foundUsers || []}
          getOptionLabel={(option) => (option.name ? `${option.name} (${option.uid})` : option.uid)}
          loading={isLoading}
          renderInput={(params) => (
              <TextField
                  {...params}
                  label="Owner"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                        <React.Fragment>
                          {isLoading ? <CircularProgress color="inherit" size={20} /> : null}
                          {params.InputProps.endAdornment}
                        </React.Fragment>
                    ),
                  }}
              />
          )}
        />

        { addMutation.isPending ?
          <CircularProgress size="1.5em"/> :
          <Button onClick={addOwner} color="primary" disabled={!newUser}>
            Add Owner
          </Button> }


        {(addMutation.isError || removeMutation.isError) && <Grid item xs={12}>
          <Typography color="error">Error: {addMutation.error?.message} {removeMutation.error?.message}</Typography>
        </Grid> }

      </DialogContent>
      <DialogActions>
        <Button onClick={close} color="primary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
