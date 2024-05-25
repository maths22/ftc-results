import React, {Component, useRef, useState} from 'react';
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
import type {components} from "../api/v1";
import {useAddOwnerMutation, useTransformDbMutation} from "../api";

export default function EventTransformDialog({event, onClose}: {
  event?: components['schemas']['event'],
  onClose: () => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileList | null>(null);

  const mutation = useTransformDbMutation(event?.season, event?.slug)

  function transformDb() {
    if(!files || files.length === 0) return;

    mutation.mutate(files[0])
  }

  function close() {
    mutation.reset();
    onClose();
  }

  if(!event || !event.owners) {
    return null;
  }

  const hasFile = files && files.length > 0
  return <Dialog
      open={true}
      onClose={close}
      aria-labelledby="form-dialog-title"
  >
    <DialogTitle id="form-dialog-title">Configure DB for {event.name}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Upload the DB generated by the scoring system here

        {mutation.isError && <Grid item xs={12}>
          <Typography color="error">Error: {mutation.error.message}</Typography>
        </Grid> }
      </DialogContentText>
      <input
          ref={fileInput}
          type='file'
          hidden
          accept='.db'
          onChange={(e) => setFiles(e.target.files)}
      />
      <Button
          onClick={() => {
            fileInput.current?.click();
          }}
      >
        Choose File <Typography variant="caption" style={{'marginLeft': '0.5em', 'textTransform': 'none'}}>
        { hasFile ? files[0].name : 'No file chosen'}
        </Typography>
      </Button>

    </DialogContent>
    <DialogActions>
      <Button onClick={close} color="primary">
        Cancel
      </Button>
      { mutation.isPending ?
         <CircularProgress size="1.5em"/> :
         <Button onClick={transformDb} color="primary" disabled={!hasFile}>
        Configure
      </Button> }
    </DialogActions>
  </Dialog>;
}
