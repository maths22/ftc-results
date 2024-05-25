import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import {createLazyRoute, Link, useParams, useRouter} from '@tanstack/react-router';
import LoadingSpinner from './LoadingSpinner';
import SeasonSelector from './SeasonSelector';
import {useLeagues} from "../api";
import {RoutableHome} from "../App.tsx";

function LeaguesSummary({selectedSeason}: {selectedSeason: string}){
    const { isLoading, isError, data: leagues } = useLeagues(selectedSeason);
    const router = useRouter();

    if(isLoading) {
      return <LoadingSpinner/>;
    }

    if(isError || !leagues) {
      return <div>Error loading leagues</div>;
    }

    const enrichedLeagues = leagues.map(l => ({
      ...l,
      parent_league: l.parent_league ? leagues.find(l2 => l2.slug == l.parent_league) : undefined
    })).filter(l => {
      // Only include child leagues or parents without children
      return l.parent_league || !leagues.find(l2 => l2.parent_league == l.slug)
    })

    const vals = [...enrichedLeagues].sort((a, b) => {
      if(!a.parent_league && b.parent_league) {
        return -1;
      }
      if(a.parent_league && !b.parent_league) {
        return 1;
      }
      if(!a.parent_league || !b.parent_league) {
        return a.name.localeCompare(b.name);
      }
      const diff = a.parent_league.name.localeCompare(b.parent_league.name);
      if(diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    } );

    const rowStyle = { height: '2rem' };

    return <>
      <SeasonSelector onChange={v => router.navigate({ to: `/${v}/leagues/summary` })} selectedSeason={selectedSeason} />
      <div style={{width: '100%', overflowX: 'auto'}}>
        <Table sx={{minWidth: '30em'}}>
          <TableHead>
            <TableRow style={rowStyle}>
              <TableCell>League</TableCell>
              <TableCell>Child league</TableCell>
              <TableCell>Number of Teams</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vals.map(val => {
              return (
                  <TableRow key={val.id} style={rowStyle}>
                    {val.parent_league ? <TableCell><Link to={`/${selectedSeason}/leagues/rankings/${val.parent_league.slug}`}>{val.parent_league.name}</Link></TableCell> : null}
                    <TableCell><Link to={`/${selectedSeason}/leagues/rankings/${val.slug}`}>{val.name}</Link></TableCell>
                    {val.parent_league ? null : <TableCell />}
                    <TableCell>{val.team_count}</TableCell>
                  </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>;
}

export default function RoutableLeaguesSummary() {
  const {season} = useParams({ from: '/$season/leagues/summary' });
  return <LeaguesSummary selectedSeason={season} />;
}

export const Route = createLazyRoute("/$season/leagues/summary")({
    component: RoutableLeaguesSummary
})
