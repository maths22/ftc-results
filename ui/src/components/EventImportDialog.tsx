import React, {useRef, useState} from 'react';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';

import Grid from '@mui/material/Grid/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import type {components} from "../api/v1";
import {useImportDbMutation, useTransformDbMutation} from "../api";

export default function eventImportDialog({event, onClose}: {
  event?: components['schemas']['event'],
  onClose: () => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [files, setFiles] = useState<FileList | null>(null);
  const [selectedDivision, setSelectedDivision] = useState<string>('parent')

  const mutation = useImportDbMutation(event?.season, event?.slug)

  function importDb() {
    if(!files || files.length === 0) return;

    mutation.mutate({ file: files[0], division: selectedDivision })
  }

  function close() {
    mutation.reset();
    onClose();
  }

  if(!event) {
    return null;
  }

  const hasDivisions = event.divisions.length > 0
  const hasFile = files && files.length > 0

  return <Dialog
      open={true}
      onClose={close}
      aria-labelledby="form-dialog-title"
  >
    <DialogTitle id="form-dialog-title">Import Results for {event.name}</DialogTitle>
    <DialogContent>
      <DialogContentText>
        Upload the event DB here

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

      {hasDivisions ?
      <Select value={selectedDivision} onChange={(evt) => setSelectedDivision(evt.target.value)}>
        <MenuItem value={'parent'}>Finals Division</MenuItem>
        {event.divisions.map((d) => {
          return <MenuItem value={d.slug}>{d.name} Division</MenuItem>;
        })}
      </Select> : null}

    </DialogContent>
    <DialogActions>
      <Button onClick={close} color="primary">
        Cancel
      </Button>
      { mutation.isPending ?
         <CircularProgress size="1.5em"/> :
         <Button onClick={importDb} color="primary" disabled={!hasFile}>
        Import
      </Button> }
    </DialogActions>
  </Dialog>;
}