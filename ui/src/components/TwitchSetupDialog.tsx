import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import Grid from '@mui/material/Grid/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import TextLink from './TextLink';
import type {components} from "../api/v1";
import {useTwitchMutation} from "../api";

export default function TwitchSetupDialog({event, onClose}: {
  event?: components['schemas']['event'],
  onClose: () => void
}) {
  const mutation = useTwitchMutation(event?.season, event?.slug)
  function toggleStreaming() {
    if(!event) {
      return
    }
    mutation.mutate(!event.channel)
  }

  function close() {
    mutation.reset();
    onClose();
  }

  if(!event) {
    return null;
  }

  const streamingEnabled = !!event.channel;
  return <Dialog
      open={true}
      onClose={close}
      aria-labelledby="form-dialog-title"
  >
    <DialogTitle id="form-dialog-title">Live Streaming Setup for {event.name}</DialogTitle>
    <DialogContent>
      <p>
        FTC Results supports live streaming via Twitch.
      </p>

      {streamingEnabled ? <div>
        <p>
          Live streaming is currently <b>enabled</b>. Your event will be streamed on channel <TextLink target="_blank"
                                                                                                       href={`https://twitch.tv/${event.channel}`}>{event.channel}</TextLink>.
          You should have received stream key information by email.
        </p>
        <p>
          To disable live streaming, click 'Disable'. If you later decide to re-enable live streaming, you may be
          assigned a different channel.
        </p>
      </div> : <div>
        <p>
          Live streaming is currently <b>disabled</b>.
        </p>
        <p>
          To enable live streaming, click 'Enable'. You will be assigned a channel, and will receive additional
          information concerning your stream key via email.
        </p>
      </div>}

      {mutation.error && <Grid item xs={12}>
        <Typography color="error">Error: {mutation.error.message}</Typography>
      </Grid>}

    </DialogContent>
    <DialogActions>
      <Button onClick={close} color="primary">
        Close
      </Button>
      {mutation.isPending ?
          <CircularProgress size="1.5em"/> :
          <Button onClick={toggleStreaming} color="primary">
            {streamingEnabled ? 'disable' : 'enable'}
      </Button> }
    </DialogActions>
  </Dialog>;
}
