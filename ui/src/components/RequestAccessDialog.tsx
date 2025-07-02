import {useState} from 'react';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';

import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import type {components} from "../api/v1";
import {useRequestAccessMutation} from "../api";

export default function RequestAccessDialog({event, onClose}: {
  event?: components['schemas']['event'],
  onClose: () => void
}) {
  const [accessMessage, setAccessMessage] = useState('');

  const mutation = useRequestAccessMutation(event?.season, event?.slug)
  function requestAccess() {
    mutation.mutate(accessMessage)
  }

  function close() {
    mutation.reset();
    onClose();
  }

  if(!event) {
    return null;
  }

  return <Dialog
      open={true}
      onClose={close}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Request Access for {event.name}</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Please only request access if you are the scorekeeper, FTA, or event coordinator for your event.

          {mutation.error && <Grid size={{xs: 12}}>
            <Typography color="error">Error: {mutation.error.message}</Typography>
          </Grid> }
        </DialogContentText>
        <TextField
            placeholder="Message"
            multiline={true}
            rows={4}
            maxRows={10}
            style={{width: '100%'}}
            value={accessMessage}
            onChange={(e) => setAccessMessage(e.target.value)}
        />

      </DialogContent>
      <DialogActions>
        <Button onClick={close} color="primary">
          Cancel
        </Button>
        {mutation.isPending ?
            <CircularProgress size="1.5em"/> :
            <Button onClick={requestAccess} color="primary" disabled={accessMessage.length === 0}>
              Submit Request
            </Button> }
      </DialogActions>
    </Dialog>
}
