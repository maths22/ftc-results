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
import {stringToDate} from "./util";
import {refreshEvent, useEvent, useEvents, useSeason} from "../api";

const Heading = styled('div')(({theme}) => ({
  padding: theme.spacing(2)
}));


function EventVideo({event}: {
  event: components['schemas']['ApiV3Event']
}) {
  const [showVideo, setShowVideo] = useState(true);
  const today = new Date();
  today.setHours(0,0,0,0);
  const isHappening = stringToDate(event.startDate) <= today
      && stringToDate(event.endDate) >= today;
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
  const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
  const { division } = useSearch({ from: '/$season/events/$slug' });
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

  const today = new Date();
  today.setHours(0,0,0,0);
  const isHappening = event && stringToDate(event.startDate) <= today
    && stringToDate(event.endDate) >= today && !event.published;

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
    navigate({ to: `/${seasonYear}/events/${slug}/${selectedTab}`, search: { division } });
  }

  function selectDivision(div?: string) {
    // @ts-expect-error TODO maybe make this happy one day
    navigate({ search: { division: div } });
  }

  function refresh() {
    refreshEvent(seasonYear, slug)
  }

  const hasDivisions = !(!event.divisions || event.divisions.length === 0);

    if(!event) {
      return <LoadingSpinner/>;
    }

    const showRankings = event.type !== 'LEAGUE_MEET' && (!hasDivisions || division);
    const showAwards = !hasDivisions && event.type !== 'LEAGUE_MEET' || (hasDivisions && !division);
    const showAlliances = event.type !== 'LEAGUE_MEET';
    // TODO can we derive this in a more useful way?
    const showPractice = true // event.has_practice

    const google_location = event.venue + ', ' + event.streetAddress + ', ' + event.city + ', ' + event.state + ', ' + event.country;
    const maps_url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(google_location);

    return <div style={{width: '100%', overflowX: 'auto'}}>
        <Heading>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.35em'}}><Typography variant="h4">{event.name}</Typography> <EventChip event={event}/></div>
          {event.divisions.length > 0 ? <div>
            <Select value={division || 'parent'} onChange={(evt) => selectDivision(evt.target.value == 'parent' ? undefined : evt.target.value)}>
              <MenuItem value={'parent'}>Finals Division</MenuItem>
              {event.divisions.map((d) => {
                return <MenuItem key={d.eventCode} value={d.eventCode}>{d.name} Division</MenuItem>;
              })}
            </Select>
          </div> : null}
          {season ? <><b>Season:</b> <span>{season.gameName} ({season.cmpYear - 1} - {season.cmpYear})</span><br/></> : null}
          <b>Date:</b> {new Date(event.startDate).getUTCFullYear() === 9999 ? 'TBA' : event.startDate === event.endDate ? event.startDate : (event.startDate + ' - ' + event.endDate)}<br/>
          <b>Location:</b>
          {event.venue && event.venue.trim() !== '-' ? <>
            <TextLink href={maps_url} target="_blank"> {event.venue}{event.venue && ', '}
          {event.city}{event.city && ', '}
          {event.state}{event.state && ', '}
          {event.country}</TextLink>
          </> : ' TBA' }
        </Heading>

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
            <Tab value="teams" label="Teams" style={{marginLeft: 'auto'}}/>
            { showRankings ? <Tab value="rankings" label={'Rankings'} /> : null }
            { showPractice ? <Tab value="practice" label="Practice Matches" /> : null }
            <Tab value="matches" label="Matches" />
            { showAlliances ? <Tab value="alliances" label="Alliances" /> : null }
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

export const Route = createLazyRoute("/$season/events/$slug")({
  component: EventSummary
})