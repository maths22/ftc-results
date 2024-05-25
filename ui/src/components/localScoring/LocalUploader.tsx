import {useEffect, useState} from 'react';
import Button from '@mui/material/Button';
import LoadingSpinner from '../LoadingSpinner';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ScoringServerPicker from './ScoringServerPicker.js';
import {createLazyRoute, useParams} from "@tanstack/react-router";
import {useEvent} from "../../api";
import {useQuery} from "@tanstack/react-query";
import Uploader, {UploadStatus} from "./uploader"
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import {useConfirm} from "material-ui-confirm";

export default function LocalUploader() {
  const confirm = useConfirm();
  const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug/uploader' });
  const { data: event } = useEvent(seasonYear, slug);

  const [localServer, setLocalServer] = useState({ hostname: 'localhost', port: 80 });
  const [localServerConfirmed, setLocalServerConfirmed] = useState<boolean>();
  const [localEvent, setLocalEvent] = useState('');


  const [uploadRunning, setUploadRunning] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>()

  useEffect(() => {
    (async () => {
      setLocalServerConfirmed(false)
      setLocalEvent('')
      const whoAmI = await fetch(`http://${localServer.hostname}:${localServer.port}/whoami/`)
      setLocalServerConfirmed(whoAmI.ok && await whoAmI.text() == 'FIRST_TECH_CHALLENGE_SCORING_SOFTWARE')
    })()
  }, [localServer])

  useEffect(() => {
    if(!uploadRunning) {
      return
    }

    const uploader = new Uploader(
        localServer.hostname,
        localServer.port,
        localEvent,
        seasonYear,
        slug,
        "/api/v1",
        (arg: any) => Promise.reject("Not implemented"),
        setUploadStatus
    )
    uploader.startUpload()

    return () => uploader.stopUpload()
  }, [uploadRunning]);

  const { data: eventCodes } = useQuery({
    queryKey: ['localEvents', localServer.hostname, localServer.port],
    enabled: localServerConfirmed,
    queryFn: async () => {
      const events = await fetch(`http://${localServer.hostname}:${localServer.port}/api/v1/events/`)
      return (await events.json())['eventCodes'] as string[]
    }
  })

  async function resetEvent(){
    if(!event) {
      return
    }
    await confirm({
      title: `Reset ${event.name}`,
      description: <p>
        Are you sure you want to reset {event.name}?<br/>
        THIS WILL CLEAR ALL DATA FOR ALL DIVISIONS
      </p>
    });

    const wasRunning = uploadRunning;
    if(wasRunning) {
      setUploadRunning(false)
    }
    // TODO reset event here
    if(wasRunning) {
      setUploadRunning(true);
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
          setLocalServer={(server) => setLocalServer(server)}
      />
      {localServerConfirmed === false ? <Grid item xs={12}>
        <Typography color="error">{'Could not connect to scoring system at ' +
            `http://${localServer.hostname}:${localServer.port}`}</Typography>
      </Grid> : null}
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

export const Route = createLazyRoute("/$season/events/$slug/uploader")({
  component: LocalUploader
})