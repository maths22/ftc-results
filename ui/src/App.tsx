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
import {stringToDate} from "./components/util";

function App({selectedSeason}: {
    selectedSeason: string
}) {
  const router = useRouter();
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

        <EventCards heading="This week's Events" selectedSeason={selectedSeason} filter={(e) => {
          return stringToDate(e.endDate) >= today && stringToDate(e.startDate) < oneWeek;
        }}/>

        <EventCards heading="Recent Events" selectedSeason={selectedSeason} filter={(e) => {
          return stringToDate(e.endDate) < today;
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
  const defaultSeason = (seasons.seasons.find((s) => s.cmpYear == seasons.currentSeasonCmpYear))?.cmpYear.toString() || '0';
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
