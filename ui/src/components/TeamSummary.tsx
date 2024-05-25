import LoadingSpinner from './LoadingSpinner';
import Typography from '@mui/material/Typography';
import MatchTable from './MatchTable';
import TextLink from './TextLink';
import EventChip from './EventChip';

import Card from '@mui/material/Card';
import {styled} from '@mui/material/styles';
import {useParams} from '@tanstack/react-router';
import {useLeague, useSeason, useTeamDetails} from "../api";
import {components} from "../api/v1";

const Heading = styled('div')(({theme}) => ({
  padding: theme.spacing(2)
}));

function TeamSeason({team, season} : {
  team: components["schemas"]["team"],
  season: {
    season: string;
    league?: string;
    record: components["schemas"]["winRecord"];
    events: {
      data: components["schemas"]["event"];
      ranking?: components["schemas"]["ranking"];
      matches: components["schemas"]["match"][];
    }[];
  }
}) {
  const { data: seasonData } = useSeason(season.season)
  const { data: league } = useLeague(season.season, season.league);
  const { data: parentLeague } = useLeague(season.season, league?.parent_league);

  if(!seasonData) {
    return null;
  }

  return <div style={{paddingBottom: '2em'}}>
    <Typography variant="h5">{seasonData.name} ({seasonData.year}) Season</Typography>

    {league ?
        <><span><b>League:</b> {parentLeague ? <><TextLink to={`/${season.season}/leagues/rankings/${parentLeague.slug}`}>{parentLeague.name}</TextLink>{' – '}</> : null }
          <TextLink to={`/${season.season}/leagues/rankings/${league.slug}`}>{league.name}</TextLink></span><br/></> : null }
    {season.record.win + season.record.tie + season.record.loss > 0 ?
        <><b>Season Record:</b> {`${season.record.win}-${season.record.loss}-${season.record.tie}`}</> : null }

    {season.events.sort((a, b) => {
          let diff;
          diff = a.data.start_date.localeCompare(b.data.start_date);
          if(diff !== 0) return diff;
          return a.data.name.localeCompare(b.data.name);
        } ).map((evt) => {
          return <Card key={evt.data.id} style={{margin: '1em 0'}}>
            <Heading>
              <div style={{display: 'flex'}}>
                <Typography variant="h6" gutterBottom><TextLink to={`/${seasonData.year}/events/${evt.data.slug}`}>{evt.data.name}</TextLink></Typography>
                <EventChip event={evt.data}/>
              </div>

              {evt.matches.filter((m) => m.played).length > 0 && !(evt.data.remote && evt.data.type === 'league_meet' || !evt.ranking) ? <p style={{marginBottom: 0, marginTop: 0}}>
                Team {team.number} {evt.data.type === 'league_meet' ? null : <>{evt.data.aasm_state === 'in_progress' ? 'is' : 'was'} <b>Rank {evt.ranking.ranking}</b></>}
                {evt.data.remote ? null : <>{evt.data.type === 'league_meet' ? ' ' + (evt.data.aasm_state === 'in_progress' ? 'has' : 'had') + ' a record of ' : ' with a record of '}
                <b style={{whiteSpace: 'nowrap'}}>{`${evt.ranking.record.win}-${evt.ranking.record.loss}-${evt.ranking.record.tie}`}</b></>}
              </p> : null}
            </Heading>
            <MatchTable team={team.number} matches={evt.matches} event={evt.data} />
          </Card>;})}
  </div>;
}

export default function TeamSummary() {
  const {number} = useParams({ from: '/teams/$number' });
  const {data, isLoading, isError} = useTeamDetails(parseInt(number))

  if(isLoading) {
    return <LoadingSpinner/>;
  }

  if(isError || !data) {
    return <div>Error loading team details</div>;
  }

  const { team, seasons } = data;


  return <div style={{width: '100%', overflowX: 'auto'}}>
    <Heading>
      <Typography variant="h4">Team {team.number} – {team.name}</Typography>
      <p>
        <b>Organization:</b> {team.organization}<br/>
        <b>Location:</b> {team.city}, {team.state}, {team.country}<br/>
      </p>

      { seasons.map((season) => <TeamSeason team={team} season={season} key={season.season} />) }
    </Heading>
  </div>;
}
