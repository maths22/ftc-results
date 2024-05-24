import React, { Component } from 'react';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import EventCards from './components/EventCards.js';
import SeasonSelector from './components/SeasonSelector';
import Button from '@mui/material/Button';
import {Link, useParams} from '@tanstack/react-router';
import router from './router.jsx';
import {useSeason, useSeasons} from './api.js';
import LoadingSpinner from './components/LoadingSpinner.js';

function stringToDate(str) {
  const parts = str.split('-');
  return new Date(parts[0],parts[1]-1,parts[2]);
}

function App({selectedSeason}) {
  const { data: season} = useSeason(selectedSeason);

  const today = new Date();
  today.setHours(0,0,0,0);
  const oneWeek = new Date(today);
  oneWeek.setDate(oneWeek.getDate() + 7);
  const twoWeeksOld = new Date(today);
  twoWeeksOld.setDate(twoWeeksOld.getDate() - 14);
  return (
      <div>
        <SeasonSelector onChange={v => router.navigate({ to: `/${v}` })} selectedSeason={selectedSeason} />

        {season && season.offseason ? null :
          <div style={{padding: '1em 0'}}>
            <Typography variant={'h5'}>League results</Typography>
            <List component="nav">
              <ListItem  component={Link} to={`/${selectedSeason}/teams/rankings`} button>
                <ListItemText primary="All Team Rankings" />
              </ListItem>
              <ListItem  component={Link} to={`/${selectedSeason}/leagues/summary`} button>
                <ListItemText primary="Rankings By League" />
              </ListItem>
            </List>
          </div>
        }


        <EventCards heading="This week's Events" selectedSeason={selectedSeason} filter={(e) => {
          return stringToDate(e.end_date) >= today && stringToDate(e.start_date) < oneWeek;
        }}/>

        { season && season.offseason ? <EventCards heading="Upcoming Events" selectedSeason={selectedSeason} filter={(e) => {
          return stringToDate(e.start_date) >= oneWeek;
        }} limit={9} /> : null}

        <EventCards heading="Recent Events" selectedSeason={selectedSeason} filter={(e) => {
          return stringToDate(e.end_date) < today;
        }} reverse limit={9} showNone />

        <div style={{padding: '1em 0'}}>
          <Button variant="contained" to={`/${selectedSeason}/events/all`} component={Link}>
            See All Events
          </Button>
        </div>
      </div>
  );
}

export function RoutableHome() {
  const { isLoading, data: seasons} = useSeasons();
  if(isLoading || !seasons) {
    return <LoadingSpinner />;
  }
  const defaultSeason = seasons.find((s) => s.active).year;
  return <App selectedSeason={defaultSeason} />;
}
export function RoutableSeasonHome() {
  const {season} = useParams({ from: '/$season' });
  return <App selectedSeason={season} />;
}
