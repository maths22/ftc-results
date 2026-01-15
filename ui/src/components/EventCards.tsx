import LoadingSpinner from './LoadingSpinner';
import TextLink from './TextLink';
import EventChip from './EventChip';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import {useEvents} from '../api';
import {useRouter} from "@tanstack/react-router";
import type {components} from "../api/first-v3";

function EventCard({event, season}: { event: components['schemas']['ApiV3Event'], season: string }) {
  const router = useRouter();

  return <Card>
    <CardActionArea onClick={() => router.navigate({ to: `/${season}/events/${event.code}` })}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {event.name} <EventChip event={event}/>
        </Typography>
        <Typography variant="subtitle1" component="h3">
          {event.startDate == event.endDate ? event.startDate : (event.startDate + ' - ' + event.endDate)}
        </Typography>
        <Typography gutterBottom variant="subtitle2" component="h3">

        </Typography>
        <Typography component="p">
          {event.venue}<br/>{event.city}, {event.state}, {event.country}
        </Typography>
      </CardContent>
    </CardActionArea>
  </Card>
}

export default function EventCards({filter, selectedSeason, limit, heading, showNone, reverse}: {
  filter?: (event: components['schemas']['ApiV3Event']) => boolean,
  selectedSeason: string,
  limit?: number,
  heading: string,
  showNone?: boolean,
  reverse?: boolean
}) {
  const { isLoading, isError, data: events } = useEvents(selectedSeason);

  if(isLoading) {
    return <LoadingSpinner/>;
  }

  if(isError || !events) {
    return <div>Error loading events</div>;
  }

  let vals = [...events];
  if(filter) {
    vals = vals.filter(filter)
  }
  vals.sort((a, b) => {
    const diff = a.startDate.localeCompare(b.startDate);
    if(diff !== 0) return diff;
    return a.name.localeCompare(b.name);
  } );
  if(reverse) {
    vals = vals.reverse();
  }
  vals = vals.slice(0, limit);

  if(vals.length === 0) {
    if(showNone) {
      return <div style={{padding: '1em 0'}}>
        <Typography variant="h5" gutterBottom>No {heading}</Typography>
      </div>;
    } else {
      return null;
    }
  }

  return <div>
      <Typography variant="h5" gutterBottom>{heading}</Typography>
      <Grid container spacing={3}>
        {vals.map(e => <Grid size={{md: 4}} key={e.code}>
          <EventCard season={selectedSeason} event={e} />
        </Grid>)}
      </Grid>
    </div>;
}
