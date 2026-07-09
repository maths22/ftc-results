import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import EventCards from './components/EventCards';
import SeasonSelector from './components/SeasonSelector';
import Button from '@mui/material/Button';
import {createLazyRoute, Link, useParams, useRouter} from '@tanstack/react-router';
import {useSeason, useSeasons} from './api';
import LoadingSpinner from './components/LoadingSpinner';

function App({selectedSeason}: {
    selectedSeason: string
}) {
  const router = useRouter();
  const { data: season} = useSeason(selectedSeason);

  const today = Temporal.Now.plainDateISO();
  const oneWeek = today.add({ days: 7 });

  return (
      <div>
        <SeasonSelector onChange={v => router.navigate({ to: `/${v}` })} selectedSeason={selectedSeason} />

        {season && season.offseason ? null :
          <div style={{padding: '1em 0'}}>
            <Typography variant={'h5'}>League results</Typography>
            <List component="nav">
              <ListItemButton component={Link} to={`/${selectedSeason}/teams/rankings`}>
                <ListItemText primary="All Team Rankings" />
              </ListItemButton>
              <ListItemButton component={Link} to={`/${selectedSeason}/leagues/summary`}>
                <ListItemText primary="Rankings By League" />
              </ListItemButton>
            </List>
          </div>
        }


        <EventCards heading="This week's Events" selectedSeason={selectedSeason} filter={(e) => {
            return Temporal.PlainDate.compare(Temporal.PlainDate.from(e.end_date), today) >= 0 && Temporal.PlainDate.compare(Temporal.PlainDate.from(e.start_date), oneWeek) < 0;
        }}/>

        { season && season.offseason ? <EventCards heading="Upcoming Events" selectedSeason={selectedSeason} filter={(e) => {
            return Temporal.PlainDate.compare(Temporal.PlainDate.from(e.start_date), today) > 0;
        }} limit={9} /> : null}

        <EventCards heading="Recent Events" selectedSeason={selectedSeason} filter={(e) => {
            return Temporal.PlainDate.compare(Temporal.PlainDate.from(e.start_date), today) < 0;
        }} reverse limit={9} showNone />

        <div style={{padding: '1em 0'}}>
          <Button variant="contained" to={`/${selectedSeason}/events/all`} component={Link}>
            See All Events
          </Button>
        </div>

        <footer style={{marginTop: '3em', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
            <small style={{marginRight: '1em'}}>Illinois/Chicago Robotics Invitational <i>FIRST</i> Tech Challenge Event Results</small>
            <small><a href={"/api-docs.html"} target={"_blank"}>API Documentation</a></small>
        </footer>
      </div>
  );
}

export function RoutableHome() {
  const { isLoading, data: seasons} = useSeasons();
  if(isLoading || !seasons) {
    return <LoadingSpinner />;
  }
  const defaultSeason = (seasons.find((s) => s.active) || seasons[0]).year;
  return <App selectedSeason={defaultSeason} />;
}
export function RoutableSeasonHome() {
  const {season} = useParams({ from: '/$season' });
  return <App selectedSeason={season} />;
}

export const Route = createLazyRoute("/")({
    component: RoutableHome
})

export const SeasonRoute = createLazyRoute("/$season")({
    component: RoutableSeasonHome
})
