import {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import LoadingSpinner from '../LoadingSpinner';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ScoringServerPicker from './ScoringServerPicker.js';
import {useParams} from "@tanstack/react-router";
import {useEvent} from "../../api";
import {useQuery} from "@tanstack/react-query";
import ScoringUploader from "./uploader/index"

type UploadStatus ={
  success: true,
  date: Date
} | {
  success: false,
  date: Date,
  error: Error
}

export default function Uploader() {
  const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug/uploader' });
  const { data: event } = useEvent(seasonYear, slug);

  const [localServerHost, setLocalServerHost] = useState('localhost');
  const [localServerPort, setLocalServerPort] = useState(80);
  const [localServerConfirmed, setLocalServerConfirmed] = useState(false);
  const [localEvent, setLocalEvent] = useState('');


  const [uploadRunning, setUploadRunning] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>()

  useEffect(() => {
    (async () => {
      setLocalServerConfirmed(false)
      setLocalEvent('')
      const whoAmI = await fetch(`http://${localServerHost}:${localServerPort}/whoami/`)
      setLocalServerConfirmed(whoAmI.ok && await whoAmI.text() == 'FIRST_TECH_CHALLENGE_SCORING_SOFTWARE')
    })()
  }, [localServerHost, localServerPort])

  useEffect(() => {
    if(!uploadRunning) {
      return
    }

    const uploader = new ScoringUploader(
        localServerHost,
        localServerPort,
        localEvent,
        seasonYear,
        slug,
        "/api/v1",
        setUploadStatus
    )
    uploader.startUpload()

    return () => uploader.stopUpload()
  }, [uploadRunning]);

  const { data: eventCodes } = useQuery({
    queryKey: ['localEvents', localServerHost, localServerPort],
    enabled: localServerConfirmed,
    queryFn: async () => {
      const events = await fetch(`http://${localServerHost}:${localServerPort}/api/v1/events/`)
      return (await events.json())['eventCodes'] as string[]
    }
  })

  async function resetEvent(){
    if(event && window.confirm(`Are you sure you want to reset ${event.name}?\n(THIS WILL CLEAR ALL DATA FOR ALL DIVISIONS)`)) {
      const wasRunning = uploadRunning;
      if(wasRunning) {
        setUploadRunning(false)
      }
      // TODO reset event here
      if(wasRunning) {
        setUploadRunning(true);
      }
    }
  }

  if(!event) {
    return <LoadingSpinner/>;
  }

  return (
    <Paper sx={{
      marginTop: 1,
      padding: 2,
      width: '100%',
      overflowX: 'auto'
    }}>
      <ScoringServerPicker
          disabled={uploadRunning}
      />
      {eventCodes ? <div>
        <Select
            value={localEvent}
            displayEmpty
            disabled={uploadRunning}
            onChange={(e) => setLocalEvent(e.target.value)}
        >
          <MenuItem value="">
            <em>Event</em>
          </MenuItem>
          {eventCodes.map((e) => <MenuItem key={e} value={e}>{e}</MenuItem>)}
        </Select>
      </div> : null}
      {localEvent !== '' ?
          <Button onClick={() => setUploadRunning((was) => !was)} variant="contained">{uploadRunning ? 'Stop' : 'Start'}</Button>
      : null}

      {uploadRunning ? <div>
        Upload running!<br/>
        Last attempt: {uploadStatus?.success === true ? ('success at ' + uploadStatus.date.toLocaleString()) : null} {uploadStatus?.success === false ? ('failure at ' + uploadStatus.date.toLocaleString()) : null}
      </div> : null}

      <Button onClick={resetEvent} variant="contained">Reset Event</Button>
    </Paper>
  );
}
