import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import LoadingSpinner from './LoadingSpinner';
import TextLink from './TextLink';
import SeasonSelector from './SeasonSelector';
import {createLazyRoute, Link, useParams, useRouter} from '@tanstack/react-router';
import {PaddedCell} from './util';
import {useEvents} from "../api";

function EventsSummary({selectedSeason}: {
  selectedSeason: string
}) {
  const { isLoading, isError, data: events } = useEvents(selectedSeason);
  const router = useRouter();

  if(isLoading) {
    return <LoadingSpinner/>;
  }

  if(isError || !events) {
    return <div>Error loading events</div>;
  }

    const vals = [...events].sort((a, b) => {
      const diff = a.startDate.localeCompare(b.endDate);
      if(diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    } );
    return <>
      <SeasonSelector onChange={(v) => router.navigate({ to: `/${v}/events/all` })} selectedSeason={selectedSeason} />
      <div style={{width: '100%', overflowX: 'auto'}}>
      <Table sx={{minWidth: '30em'}} size="small">
        <TableHead>
          <TableRow style={{height: '2rem'}}>
            <PaddedCell>Name</PaddedCell>
            <PaddedCell>Location</PaddedCell>
            <PaddedCell>Date</PaddedCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vals.map(event => <TableRow style={{height: '2rem'}} key={event.code}>
              <PaddedCell><TextLink to={`/${selectedSeason}/events/${event.code}`}>{event.name}</TextLink></PaddedCell>
              <PaddedCell>{event.venue && event.venue.trim() !== '-' ? <>{event.venue}<br/>{event.city}, {event.state}, {event.country}</> : 'TBA' }</PaddedCell>
              <PaddedCell>{new Date(event.startDate).getUTCFullYear() === 9999 ? 'TBA' : event.startDate === event.endDate ? event.startDate : <>{event.startDate}<wbr/>{' - ' + event.endDate}</>}</PaddedCell>
          </TableRow>)}
        </TableBody>
      </Table>
    </div>
  </>;
}

export default function RoutableEventsSummary() {
  const {season} = useParams({ from: '/$season/events/all' });
  return <EventsSummary selectedSeason={season} />;
}

export const Route = createLazyRoute("/$season/events/all")({
  component: RoutableEventsSummary
})