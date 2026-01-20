import {useEffect, useState} from 'react';

import LoadingSpinner from './LoadingSpinner';
import Typography from '@mui/material/Typography';
import TextLink from './TextLink';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import IconButton from '@mui/material/IconButton';
import RefreshIcon from '@mui/icons-material/Refresh';
import EventChip from './EventChip';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import {styled} from '@mui/material/styles';
import {createLazyRoute, Outlet, useChildMatches, useNavigate, useParams, useSearch} from '@tanstack/react-router';
import type {components} from "../api/first-v3";
import {GOV_CUP_CODE, GOV_CUP_SEASON, refreshEvent, useEvent, useEventMatches, useEvents, useEventTeams, useSeason} from "../api";
import Grid from '@mui/material/Grid';

import govCupLogo from '../logos/gov-cup.svg'
import Stack from '@mui/material/Stack';
import { Box } from '@mui/material';
import { isEventHappening } from './util';
import { Temporal } from 'temporal-polyfill';

const Heading = styled('div')(({theme}) => ({
  padding: theme.spacing(2)
}));


function EventVideo({event}: {
  event: components['schemas']['ApiV3Event']
}) {
  const [showVideo, setShowVideo] = useState(true);
  const isHappening = isEventHappening(event.startDate, event.endDate);
  if(!event.liveStreamUrl || !isHappening || true) return null;

  // TODO parse twitch and youtube urls maybe
  return <div style={{maxWidth: '50em', margin: '0 auto'}}>
    <FormControlLabel
        control={
          <Switch checked={showVideo} onChange={(_, checked) => setShowVideo(checked)} />
        }
        label="Show Video"
    />
    { showVideo ? <div style={{position:'relative', paddingTop: '56%'}}>
      <iframe
          title="Twitch Player"
          style={{position:'absolute',top:0,left:0,width:'100%', height:'100%'}}
          src={`https://player.twitch.tv/?channel=${event.liveStreamUrl}&parent=${window.location.hostname}`}
          frameBorder="0"
          scrolling="no"
          allowFullScreen>
      </iframe>
    </div> : null }
  </div>;
}

export default function EventSummary() {
  const seasonYear = GOV_CUP_SEASON;
  const slug = GOV_CUP_CODE;
  const { division } = useSearch({ from: '/eventSummary' });
  const navigate = useNavigate();
  const childMatches = useChildMatches();
  let tab = 'teams';
  if(childMatches.length > 0) {
    const matchParts = childMatches[0].id.split("/")
    const lastPart = matchParts[matchParts.length - 1];
    tab = lastPart.length > 0 ? lastPart : 'teams';
  }

  const { isLoading, isError, data: event } = useEvent(seasonYear, slug);
  const { data: season } = useSeason(seasonYear);
  // Ensure we load the team list for all tabs to reduce individual team fetches
  useEventTeams(seasonYear, slug);
  const { data: matches } = useEventMatches(seasonYear, division || slug);

  const isHappening = event && isEventHappening(event.startDate, event.endDate) && !event.published;

  useEffect(() => {
    if(!isHappening) {
      return
    }

    const interval = setInterval(() => refreshEvent(seasonYear, slug), 30 * 1000)
    return () => clearInterval(interval)
  }, [seasonYear, slug, isHappening]);

  if(isLoading) {
    return <LoadingSpinner/>;
  }

  if(isError || !event) {
    return <div>Error loading event</div>;
  }

  function selectTab(selectedTab: string) {
    navigate({ to: `/${selectedTab}`, search: { division } });
  }

  function selectDivision(div?: string) {
    // @ts-expect-error TODO maybe make this happy one day
    navigate({ search: { division: div } });
  }

  function refresh() {
    refreshEvent(seasonYear, slug)
  }

  const hasDivisions = !(!event.divisions || event.divisions.length === 0);
  const hasPracticeMatches = matches?.some((m) => m.tournamentLevel === 'PRACTICE');

    if(!event) {
      return <LoadingSpinner/>;
    }

    const showRankings = event.type !== 'LEAGUE_MEET' && (!hasDivisions || division);
    const showAwards = false;//!hasDivisions && event.type !== 'LEAGUE_MEET' || (hasDivisions && !division);
    const showQuals = !hasDivisions || division;
    const showPlayoffs = event.type !== 'LEAGUE_MEET';

    const google_location = event.venue + ', ' + event.streetAddress + ', ' + event.city + ', ' + event.state + ', ' + event.country;
    const maps_url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(google_location);

    const startDate = Temporal.PlainDate.from(event.startDate);
    const endDate = Temporal.PlainDate.from(event.endDate);

    return <div style={{width: '100%', overflowX: 'auto'}}>
        <link rel="stylesheet" href={`https://ftc-api.firstinspires.org/avatars/composed/${seasonYear}.css`} />
        <Stack spacing={2} direction={{ xs: 'column', sm: 'row' }} sx={{alignItems: 'center'}}>
          <div style={{maxWidth: '120px'}}>
            <img src={govCupLogo} style={{maxHeight: '100%', maxWidth: '100%'}} />
          </div>
          <Heading style={{flex: 1}}>
            <Box sx={{display: { xs: 'none', sm: 'flex' }, alignItems: 'center', marginBottom: '0.35em'}}><Typography variant="h4">{event.name}</Typography> <EventChip event={event}/></Box>
            {event.divisions.length > 0 ? <div>
              <Select value={division || 'parent'} onChange={(evt) => selectDivision(evt.target.value == 'parent' ? undefined : evt.target.value)}>
                <MenuItem value={'parent'}>Finals Division</MenuItem>
                {event.divisions.map((d) => {
                  return <MenuItem key={d.eventCode} value={d.eventCode}>{d.name} Division</MenuItem>;
                })}
              </Select>
            </div> : null}
            <b>Date:</b> {startDate.year == 9999 ? 'TBA' : startDate === endDate ? startDate.toLocaleString() : (startDate.toLocaleString() + ' - ' + endDate.toLocaleString())}<br/>
            <b>Location:</b>
            {event.venue && event.venue.trim() !== '-' ? <>
              <TextLink href={maps_url} target="_blank"> {event.venue}{event.venue && ', '}
            {event.city}{event.city && ', '}
            {event.state && !event.city?.endsWith(event.state) ? `${event.state}, ` : ''}
            {event.country}</TextLink>
            </> : ' TBA' }
          </Heading>
        </Stack>

        <EventVideo event={event} />

        <div>
          <Tabs
              value={tab}
              onChange={(_, tab) => selectTab(tab)}
              indicatorColor="primary"
              textColor="primary"
              variant={"scrollable"}
              scrollButtons
              allowScrollButtonsMobile
          >
            <div style={{width: '48px'}}/>
            <Tab value="teams" label="Participants" style={{marginLeft: 'auto'}}/>
            { showRankings ? <Tab value="rankings" label="Rankings" /> : null }
            { hasPracticeMatches ? <Tab value="practice" label="Practice" /> : null }
            { showQuals ? <Tab value="quals" label="Qualification" /> : null }
            { showPlayoffs ? <Tab value="playoffs" label="Playoffs" /> : null }
            { showAwards ? <Tab value="awards" label="Awards" /> : null }
            {isHappening ?
                <IconButton
                  style={{marginLeft: 'auto', width: '48px'}}
                  onClick={refresh}
                  size="large"><RefreshIcon/></IconButton>
                : <div style={{marginLeft: 'auto', width: '48px'}}/> }
          </Tabs>
        </div>

        <Outlet />
      </div>
}

export const Route = createLazyRoute("/")({
  component: EventSummary
})