import {Link as RouterLink, useParams} from '@tanstack/react-router';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import router from '../router';

import ChevronRight from '@mui/icons-material/ChevronRight';
import LoadingSpinner from './LoadingSpinner';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import SeasonSelector from './SeasonSelector';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import {PaddedCell} from './util';
import {useGlobalRankings, useLeague, useLeagueRankings, useSeason, useTeam} from "../api";
import {components} from "../api/v1";

function RankingRow({ season, ranking, displayRank, type, slug }: {
  season: string,
  displayRank: number,
  ranking: components["schemas"]["ranking"],
  type: 'league' | 'all',
  slug?: string
}) {
  const { data: team } = useTeam(ranking.team)
  const { data: league } = useLeague(season, ranking.league);
  const { data: parentLeague} = useLeague(season, league?.parent_league);
  return (
      <TableRow key={ranking.team} style={{ height: '2rem' }}>
        <PaddedCell>{displayRank}</PaddedCell>
        <PaddedCell><TextLink to={`/teams/${ranking.team}`}>{ranking.team}</TextLink></PaddedCell>
        <PaddedCell>{team?.name}</PaddedCell>
        { ['all'].includes(type) && parentLeague ?
            <PaddedCell><TextLink to={`/${season}/leagues/rankings/${parentLeague.slug}`}>{parentLeague.name}</TextLink></PaddedCell>
            : null }
        { ['all', 'league'].includes(type) && league && league.slug != slug ?
            <PaddedCell><TextLink to={`/${season}/leagues/rankings/${league.slug}`}>{league.name}</TextLink></PaddedCell>
            : null }
        { ['all'].includes(type) && !parentLeague ? <PaddedCell /> : null }
        <PaddedCell>{Number(ranking.sort_order1).toFixed(2)}</PaddedCell>
        <PaddedCell>{Number(ranking.sort_order2).toFixed(2)}</PaddedCell>
        <PaddedCell>{Number(ranking.sort_order3).toFixed(2)}</PaddedCell>
        <PaddedCell>{ranking.matches_played}</PaddedCell>
        <PaddedCell>{ranking.matches_counted}</PaddedCell>
      </TableRow>
  );
}

function LeagueRankings({selectedSeason, slug, rankings, type}: {
  selectedSeason: string,
  type: 'league' | 'all',
  rankings?: components["schemas"]["ranking"][],
  slug?: string
}){
  const { data: season } = useSeason(selectedSeason);
  const { data: league } = useLeague(selectedSeason, slug);
  const { data: parentLeague} = useLeague(selectedSeason, league?.parent_league);


  if(!rankings) {
    return <LoadingSpinner/>;
  }


  return <>
    {type === 'all' ? <SeasonSelector onChange={v => router.navigate({ to: `/${v}/teams/rankings` })} selectedSeason={selectedSeason} /> : (season ? <Typography variant="h6">Season: {season.name} ({season.year})</Typography> : '')}
    <div style={{width: '100%', overflowX: 'auto'}}>
      <Breadcrumbs sx={{
        display: 'flex',
        height: '2em',
        alignItems: 'center',
        padding: '1em 1em 1em 0',
      }} aria-label="breadcrumb" separator={<ChevronRight/>}>
        {['league'].includes(type) ?
            <Link component={RouterLink} color="inherit" to={`/${selectedSeason}/teams/rankings`}>Statewide</Link>
            : null}
        {['all'].includes(type) ? <Typography color="textPrimary">Statewide</Typography> : null}
        {['league'].includes(type) && parentLeague ?
            <Link component={RouterLink} color="inherit" to={`/${selectedSeason}/leagues/rankings/${parentLeague.slug}`}>{parentLeague.name}</Link>
            : null}
        {['league'].includes(type) && league ? <Typography color="textPrimary">{league.name}</Typography> : null}
      </Breadcrumbs>
      <Table sx={{minWidth: '20em'}} size="small">
        <TableHead>
          <TableRow style={{ height: '2rem' }}>
            <PaddedCell>Rank</PaddedCell>
            <PaddedCell>Number</PaddedCell>
            <PaddedCell>Name</PaddedCell>
            { ['all'].includes(type) ? <PaddedCell>League</PaddedCell> : null }
            { ['all', 'league'].includes(type) && (!league || !parentLeague) ? <PaddedCell>Child League</PaddedCell> : null }
            <PaddedCell>RP</PaddedCell>
            <PaddedCell>TBP1</PaddedCell>
            <PaddedCell>TBP2</PaddedCell>
            <PaddedCell>Matches Played</PaddedCell>
            <PaddedCell>Matches Counted</PaddedCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rankings.map((r, idx) => <RankingRow key={r.team} ranking={r} type={type} season={selectedSeason} displayRank={idx + 1} slug={slug} />)}
        </TableBody>
      </Table>
    </div>
  </>;
}

export function RoutableAllRankings() {
  const { season } = useParams({ from: '/$season/teams/rankings' });
  const { data: rankings } = useGlobalRankings(season);
  return <LeagueRankings selectedSeason={season} rankings={rankings} type={'all'} />;
}
export function RoutableLeagueRankings() {
  const { season, slug } = useParams({ from: '/$season/leagues/rankings/$slug' });
  const { data: rankings } = useLeagueRankings(season, slug);
  return <LeagueRankings selectedSeason={season} rankings={rankings} slug={slug} type={'league'} />;
}