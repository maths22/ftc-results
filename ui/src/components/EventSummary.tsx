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
import type {components} from "../api/v1";
import {stringToDate} from "./util";
import {refreshEvent, useEvent, useEvents, useLeague, useSeason} from "../api";

const Heading = styled('div')(({theme}) => ({
  padding: theme.spacing(2)
}));


function EventVideo({event}: {
  event: components['schemas']['event']
}) {
  const [showVideo, setShowVideo] = useState(true);
  const today = new Date();
  today.setHours(0,0,0,0);
  const isHappening = stringToDate(event.start_date) <= today
      && stringToDate(event.end_date) >= today;
  if(!event.channel || !isHappening) return null;

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
          src={`https://player.twitch.tv/?channel=${event.channel}&parent=${window.location.hostname}`}
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
  const navigate = useNavigate({ from: '/$season/events/$slug' });
  const childMatches = useChildMatches();
  let tab = 'teams';
  if(childMatches.length > 0) {
    const matchParts = childMatches[0].id.split("/")
    const lastPart = matchParts[matchParts.length - 1];
    tab = lastPart.length > 0 ? lastPart : 'teams';
  }

  const { isLoading, isError, data: event } = useEvent(seasonYear, slug);
  const { data: season } = useSeason(event?.season);
  const { data: league } = useLeague(seasonYear, event?.league);
  const { data: parentLeague } = useLeague(seasonYear, league?.parent_league);

  useEffect(() => {
    if(event?.aasm_state !== 'in_progress') {
      return
    }

    const interval = setInterval(() => refreshEvent(seasonYear, slug), 30 * 1000)
    return () => clearInterval(interval)
  }, [seasonYear, slug, event?.aasm_state])

  if(isLoading) {
    return <LoadingSpinner/>;
  }

  if(isError || !event) {
    return <div>Error loading event</div>;
  }

  function selectTab(selectedTab: string){
    navigate({ to: `/${seasonYear}/events/${slug}/${selectedTab}`, search: { division } });
  }

  function selectDivision(div?: string) {
    navigate({ search: { division: div } });
  }

  function refresh() {
    refreshEvent(seasonYear, slug)
  }

  const hasDivisions = !(!event.divisions || event.divisions.length === 0);

    if(!event) {
      return <LoadingSpinner/>;
    }

    const showRankings = event.type !== 'league_meet' && (!hasDivisions || division);
    const showAwards = !hasDivisions && event.type !== 'league_meet' || (hasDivisions && !division);
    const showAlliances = event.type !== 'league_meet';

    const google_location = event.location + ', ' + event.address + ', ' + event.city + ', ' + event.state + ', ' + event.country;
    const maps_url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(google_location);

    return <div style={{width: '100%', overflowX: 'auto'}}>
        <Heading>
          <div style={{display: 'flex', alignItems: 'center', marginBottom: '0.35em'}}><Typography variant="h4">{event.name}</Typography> <EventChip event={event}/></div>
          {event.divisions.length > 0 ? <div>
            <Select value={division || 'parent'} onChange={(evt) => selectDivision(evt.target.value == 'parent' ? undefined : evt.target.value)}>
              <MenuItem value={'parent'}>Finals Division</MenuItem>
              {event.divisions.map((d) => {
                return <MenuItem key={d.slug} value={d.slug}>{d.name} Division</MenuItem>;
              })}
            </Select>
          </div> : null}
          {season ? <><b>Season:</b> <span>{season.name} ({season.year})</span><br/></> : null}
          <b>Date:</b> {new Date(event.start_date).getUTCFullYear() === 9999 ? 'TBA' : event.start_date === event.end_date ? event.start_date : (event.start_date + ' - ' + event.end_date)}<br/>
          <b>Location:</b>
          {event.location && event.location.trim() !== '-' ? <>
            <TextLink href={maps_url} target="_blank"> {event.location}{event.location && ', '}
          {event.city}{event.city && ', '}
          {event.state}{event.state && ', '}
          {event.country}</TextLink>
          </> : ' TBA' }
          <br/>
          {parentLeague ?
            <><span><b>League:</b> <TextLink to={`/${seasonYear}/leagues/rankings/${parentLeague.slug}`}>{parentLeague.name}</TextLink></span><br/></> : null }
          {league ?
            <span><b>{league ? 'Child ' : null} League:</b> <TextLink to={`/${seasonYear}/leagues/rankings/${league.slug}`}>{league.name}</TextLink></span> : null }<br/>

        </Heading>

        <EventVideo event={event} />

        <div>
          <Tabs
              value={tab}
              onChange={(_, tab) => selectTab(tab)}
              indicatorColor="primary"
              textColor="primary"
          >
            <div style={{width: '48px'}}/>
            <Tab value="teams" label="Teams" style={{marginLeft: 'auto'}}/>
            { showRankings ? <Tab value="rankings" label={event.type !== 'league_meet' ? 'Rankings' : 'League Rankings'} /> : null }
            { showAlliances ? <Tab value="alliances" label="Alliances" /> : null }
            <Tab value="matches" label="Matches" />
            { showAwards ? <Tab value="awards" label="Awards" /> : null }
            {event.aasm_state === 'in_progress' ?
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