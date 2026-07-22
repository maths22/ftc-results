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
import {refreshEvent, useEvent, useLeague, useSeason} from "../api";
import {isEventHappening} from "./util.ts";

const Heading = styled('div')(({theme}) => ({
  padding: theme.spacing(2)
}));

const twitchRegex = /https?:\/\/(?:(?:(?:www|go|m)\.)?twitch\.tv\/|player\.twitch\.tv\/\?.*?\bchannel=)(?<channel>\w+)[^\s/]*/
const youtubeRegex = /(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)(?<video_id>[\w\-_]+)\&?/

function VideoPlayer({url}: {url: string}) {
  if(url.match(twitchRegex)) {
    const channel = url.match(twitchRegex)!.groups!.channel;
    return <iframe
        title="Twitch Player"
        style={{position:'absolute',top:0,left:0,width:'100%', height:'100%'}}
        src={`https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}`}
        frameBorder="0"
        scrolling="no"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen>
    </iframe>
  } else if(url.match(youtubeRegex)) {
    const videoId = url.match(youtubeRegex)!.groups!.video_id;
    return <iframe
        title="YouTube Player"
        style={{position:'absolute',top:0,left:0,width:'100%', height:'100%'}}
        src={`https://www.youtube.com/embed/${videoId}?playsinline=1&autoplay=1&mute=1`}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen>
    </iframe>
  } else {
    return <span>Unsupported video URL (<a href={url} target="_blank" rel="noopener noreferrer">{url}</a>)</span>
  }
}

function EventVideo({event}: {
  event: components['schemas']['event']
}) {
  const [showVideo, setShowVideo] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0)
  const isHappening = isEventHappening(event.start_date, event.end_date);
  const legacyVideoEnabled = event.channel && isHappening

  const today = Temporal.Now.plainDateISO(event.timezone)
  const availableChannels = [...event.live_streams.filter(ls =>
      Temporal.PlainDate.compare(ls.start_date, today) <= 0 && Temporal.PlainDate.compare(ls.end_date, today) >= 0
  )]
  if(legacyVideoEnabled) {
    availableChannels.push({
      url: `https://twitch.tv/${event.channel}`,
      label: 'Stream',
      start_date: event.start_date,
      end_date: event.end_date
    })
  }
  availableChannels.sort((a, b) => {
    const dateCompare = Temporal.PlainDate.compare(a.start_date, b.start_date)
    if(dateCompare != 0) {
      return dateCompare
    }
    return a.label.localeCompare(b.label);
  });

  if(availableChannels.length === 0) return null;

  return <div style={{maxWidth: '50em', margin: '0 auto'}}>
    <div style={{display: 'flex', marginBottom: '5px' }}>
      <FormControlLabel
          control={
            <Switch checked={showVideo} onChange={(_, checked) => setShowVideo(checked)} />
          }
          label="Show Video"
      />
      {availableChannels.length > 1 && showVideo ? <div>
        <Select value={videoIndex} onChange={(evt) => setVideoIndex(evt.target.value)}>
          {availableChannels.map((v, index) => {
            return <MenuItem key={index} value={index}>{v.label}</MenuItem>;
          })}
        </Select>
      </div> : null}
    </div>
    { showVideo && availableChannels[videoIndex] ? <div style={{position:'relative', paddingTop: '56%'}}>
      <VideoPlayer url={availableChannels[videoIndex].url} />
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
    const showPractice = event.has_practice && (!hasDivisions || division)
    const showQuals = !hasDivisions || division;
    const showPlayoffs = event.type !== 'league_meet';

    const google_location = event.location + ', ' + event.address + ', ' + event.city + ', ' + event.state + ', ' + event.country;
    const maps_url = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(google_location);

    const startDate = Temporal.PlainDate.from(event.start_date);
    const endDate = Temporal.PlainDate.from(event.end_date);

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
          <b>Date:</b> {startDate.year == 9999 ? 'TBA' : Temporal.PlainDate.compare(startDate, endDate) == 0 ? startDate.toLocaleString() : (startDate.toLocaleString() + ' - ' + endDate.toLocaleString())}<br/>
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
              variant={"scrollable"}
              scrollButtons
              allowScrollButtonsMobile
          >
            <div style={{width: '48px'}}/>
            <Tab value="teams" label="Teams" style={{marginLeft: 'auto'}}/>
            { showRankings ? <Tab value="rankings" label="Rankings" /> : null }
            { showPractice ? <Tab value="practice" label="Practice" /> : null }
            { showQuals ? <Tab value="quals" label="Qualification" /> : null }
            { showPlayoffs ? <Tab value="playoffs" label="Playoffs" /> : null }
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