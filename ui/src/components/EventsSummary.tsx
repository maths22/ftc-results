import {useState} from 'react';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/CheckCircle';

import EventImportDialog from './EventImportDialog';
import EventTransformDialog from './EventTransformDialog';
import LoadingSpinner from './LoadingSpinner';
import TextLink from './TextLink';
import RequestAccessDialog from './RequestAccessDialog';
import TwitchSetupDialog from './TwitchSetupDialog';
import SeasonSelector from './SeasonSelector';
import {Link, useParams, useRouter} from '@tanstack/react-router';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
// import ManageOwnersDialog from './ManageOwnersDialog';
import {PaddedCell} from './util';
import {styled} from '@mui/material/styles';
import {authorizationStore, useEvents, useLeague} from "../api";
import type {components} from "../api/v1";

import { useStore } from "@tanstack/react-store";
import ManageOwnersDialog from "./ManageOwnersDialog";

const CanceledRow = styled(TableRow)(() => ({
  '& td': {
    textDecoration: 'line-through',
    color: 'rgba(0, 0, 0, 0.4)'
  },
  '& a': {
    textDecoration: 'line-through',
    color: 'rgba(0, 0, 0, 0.4)'
  }
}));

function EventDbs({event} : {
  event: components['schemas']['event']
}) {
  const links = [];
  if(event.import) {
    links.push(<TextLink href={event.import} key={0}>{event.divisions.length > 0 ? 'Finals' : ''} Database</TextLink>);
  }
  if(event.divisions) {
    event.divisions.forEach((d) => {
      if(!d.import) return;
      links.push(<div><TextLink href={d.import} key={d.id}>{d.name} Database</TextLink></div>);
    });
  }
  return <PaddedCell>
    {links}
  </PaddedCell>;
}

function EventRow({isLoggedIn, event, importEvent, requestAccess, manageOwners, transformEvent, setupStream} : {
  isLoggedIn: boolean,
  event: components['schemas']['event'],
  importEvent: (id: number) => void,
  requestAccess: (id: number) => void,
  manageOwners: (id: number) => void,
  transformEvent: (id: number) => void,
  setupStream: (id: number) => void,
}) {
  const { data: league } = useLeague(event.season, event.league);
  const { data: parentLeague} = useLeague(event.season, league?.parent_league);
  const divFinalsLeft = event.divisions.some((d) => !d.import);
  const RowElement = event.aasm_state === 'canceled' ? CanceledRow : TableRow;
  return <RowElement style={{height: '2rem'}}>
        <PaddedCell><TextLink to={`/${event.season}/events/${event.slug}`}>{event.name}</TextLink></PaddedCell>
        <PaddedCell>
          { parentLeague ?
              <><TextLink to={`/${event.season}/leagues/rankings/${parentLeague.slug}`}>{parentLeague.name}</TextLink><wbr/>{' – '}</>
              : null }
          { league ?
              <TextLink to={`/${event.season}/leagues/rankings/${league.slug}`}>{league.name}</TextLink>
              : null }
        </PaddedCell>
        <PaddedCell>{event.location && event.location.trim() !== '-' ? <>{event.location}<br/>{event.city}, {event.state}, {event.country}</> : 'TBA' }</PaddedCell>
        <PaddedCell>{new Date(event.start_date).getUTCFullYear() === 9999 ? 'TBA' : event.start_date === event.end_date ? event.start_date : <>{event.start_date}<wbr/>{' - ' + event.end_date}</>}</PaddedCell>
        <PaddedCell>{event.aasm_state === 'finalized' && !divFinalsLeft ? <CheckIcon/> :
            (event.can_import ? <Button variant="contained" size="small" onClick={() => importEvent(event.id)}>Import</Button>: null)}</PaddedCell>
        {event.aasm_state === 'finalized'
            ? <EventDbs event={event} />
              : null }
              {isLoggedIn ? <PaddedCell>
                {event.can_import && event.aasm_state !== 'finalized' ? <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
                  <Button style={{margin: '0.5em 0'}} variant="contained" size="small" onClick={() => manageOwners(event.id)}>Owners ({event.owners?.length || 0})</Button>
                  <Button style={{margin: '0.5em 0'}} variant="contained" size="small" onClick={() => transformEvent(event.id)}>Configure DB</Button>
                  <Button component={Link} target="_blank" style={{margin: '0.5em 0'}} variant="contained" size="small" to={`/${event.season}/events/${event.slug}/uploader`}>Live Upload</Button>
                  <Button style={{margin: '0.5em 0'}} variant="contained" size="small" onClick={() => setupStream(event.id)}>{event.channel ? 'Configure Stream' : 'Enable Stream'}</Button>
                </div>: null}
                {!event.can_import && event.aasm_state !== 'finalized' ? <Button variant="contained" size="small" onClick={() => requestAccess(event.id)}>Request Access</Button> : null}
              </PaddedCell>: null}
    </RowElement>;
}

function EventsSummary({selectedSeason}: {
  selectedSeason: string
}) {
  const [importEvent, setImportEvent] = useState<number>();
  const [transformEvent, setTransformEvent] = useState<number>();
  const [requestAccessEvent, setRequestAccessEvent] = useState<number>();
  const [manageOwnersEvent, setManageOwnersEvent] = useState<number>();
  const [setupStreamEvent, setSetupStreamEvent] = useState<number>();
  const [showOnlyMyEvents, setShowOnlyMyEvents] = useState(false);

  const { isLoading, isError, data: events } = useEvents(selectedSeason);
  const router = useRouter();
  const uid = useStore(authorizationStore, val => val['uid'])

  if(isLoading) {
    return <LoadingSpinner/>;
  }

  if(isError || !events) {
    return <div>Error loading events</div>;
  }

    const vals = [...events].sort((a, b) => {
      const diff = a.start_date.localeCompare(b.start_date);
      if(diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    } );
    const isLoggedIn = !!uid;
    return <>
      <SeasonSelector onChange={(v) => router.navigate({ to: `/${v}/events/all` })} selectedSeason={selectedSeason} />
      <div style={{width: '100%', overflowX: 'auto'}}>
      { isLoggedIn ? <FormControlLabel
        style={{padding: '0.5em'}}
        control={
          <Switch checked={showOnlyMyEvents} onChange={() => setShowOnlyMyEvents((was) => !was)} />
        }
        label="Only Show Events I Manage"
      /> : null }
      <Table sx={{minWidth: '30em'}} size="small">
        <TableHead>
          <TableRow style={{height: '2rem'}}>
            <PaddedCell>Name</PaddedCell>
            <PaddedCell>League</PaddedCell>
            <PaddedCell>Location</PaddedCell>
            <PaddedCell>Date</PaddedCell>
            <PaddedCell>Imported</PaddedCell>
            <PaddedCell>Download</PaddedCell>
            {isLoggedIn ? <PaddedCell>Manage</PaddedCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {vals.filter(e => showOnlyMyEvents ? (!isLoggedIn || e.can_import) : true)
              .map(e => <EventRow key={e.id} event={e} isLoggedIn={isLoggedIn}
                                  importEvent={(id) => setImportEvent(id)}
                                  manageOwners={(id) => setManageOwnersEvent(id)}
                                  transformEvent={(id) => setTransformEvent(id)}
                                  requestAccess={(id) => setRequestAccessEvent(id)}
                                  setupStream={(id) => setSetupStreamEvent(id)}
              />)}
        </TableBody>
      </Table>
      <EventImportDialog event={events.find(e => e.id == importEvent)} onClose={() => setImportEvent(undefined)}/>
      <EventTransformDialog event={events.find(e => e.id == transformEvent)} onClose={() => setTransformEvent(undefined)}/>
      <RequestAccessDialog event={events.find(e => e.id == requestAccessEvent)} onClose={() => setRequestAccessEvent(undefined)}/>
      <TwitchSetupDialog event={events.find(e => e.id == setupStreamEvent)} onClose={() => setSetupStreamEvent(undefined)}/>
      <ManageOwnersDialog event={events.find(e => e.id == manageOwnersEvent)} onClose={() => setManageOwnersEvent(undefined)}/>
    </div>
  </>;
}

export default function RoutableEventsSummary() {
  const {season} = useParams({ from: '/$season/events/all' });
  return <EventsSummary selectedSeason={season} />;
}