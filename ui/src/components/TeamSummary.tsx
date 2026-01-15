import LoadingSpinner from './LoadingSpinner';
import Typography from '@mui/material/Typography';
import MatchTable from './MatchTable';
import TextLink from './TextLink';
import EventChip from './EventChip';

import Card from '@mui/material/Card';
import {styled} from '@mui/material/styles';
import {createLazyRoute, useParams} from '@tanstack/react-router';
import {useSeason, useTeamDetails} from "../api";
import {components} from "../api/first-v3";
import { stringToDate } from './util';
import MatchDetailsDialog from './MatchDetailsDialog';

const Heading = styled('div')(({theme}) => ({
  padding: theme.spacing(2)
}));

function TeamSeason({team, events, season} : {
  team: components["schemas"]["ApiV3Team"],
  events: components["schemas"]["ApiV3TeamEventParticipationDetails"][],
  season: components["schemas"]["ApiV3Season"],
}) {
  // TODO do we want a season record?
  return <div style={{paddingBottom: '2em'}}>
    <Typography variant="h5">{season.gameName} ({season.cmpYear - 1} - {season.cmpYear}) Season</Typography>

    {/* {season.record.win + season.record.tie + season.record.loss > 0 ?
        <><b>Season Record:</b> {`${season.record.win}-${season.record.loss}-${season.record.tie}`}</> : null } */}

    {events.map((evt) => {
        const today = new Date();
        today.setHours(0,0,0,0);
        const isHappening = stringToDate(evt.event.startDate) <= today
            && stringToDate(evt.event.endDate) >= today && !evt.event.published;
          return <Card key={evt.event.code} style={{margin: '1em 0'}}>
            <Heading>
              <div style={{display: 'flex'}}>
                <Typography variant="h6" gutterBottom><TextLink to={`/${season.cmpYear}/events/${evt.event.code}`}>{evt.event.name}</TextLink></Typography>
                <EventChip event={evt.event}/>
              </div>
              <p>
                {evt.event.startDate == evt.event.endDate ? evt.event.startDate : (evt.event.startDate + ' - ' + evt.event.endDate)}
              </p>

              {evt.matches.filter((m) => m.matchResults).length > 0 && !(evt.event.format == 'REMOTE' && evt.event.type === 'LEAGUE_MEET' || !evt.ranking) ? <p style={{marginBottom: 0, marginTop: 0}}>
                Team {team.number} {evt.event.type === 'LEAGUE_MEET' ? null : <>{isHappening ? 'is' : 'was'} <b>Rank {evt.ranking.rank}</b></>}
                {evt.event.format == 'REMOTE' ? null : <>{evt.event.type === 'LEAGUE_MEET' ? ' ' + (isHappening ? 'has' : 'had') + ' a record of ' : ' with a record of '}
                <b style={{whiteSpace: 'nowrap'}}>{`${evt.ranking.wins}-${evt.ranking.losses}-${evt.ranking.ties}`}</b></>}
              </p> : null}
            </Heading>
            <MatchTable seasonYear={season.cmpYear.toString()} team={team.number} matches={evt.matches} event={evt.event} />
          </Card>;})}
  </div>;
}

export default function TeamSummary() {
  const {season, number} = useParams({ from: '/$season/teams/$number' });
  const {data, isLoading, isError} = useTeamDetails(season, number)
  const {data: seasonData} = useSeason(season);

  if(isLoading) {
    return <LoadingSpinner/>;
  }

  if(isError || !data || !seasonData) {
    return <div>Error loading team details</div>;
  }

  const { team, region, events, leagues } = data;


  return <div style={{width: '100%', overflowX: 'auto'}}>
    <Heading>
      <Typography variant="h4">Team {team.number} – {team.name}</Typography>
      <p>
        <b>Organization:</b> {team.affiliations}<br/>
        <b>Location:</b> {team.city}, {team.stateProv}, {team.country}<br/>
      </p>

      {/* { seasons.map((season) => <TeamSeason team={team} season={season} key={season.season} />) } */}
      <TeamSeason team={team} events={events} season={seasonData} />
    </Heading>
    <MatchDetailsDialog />
  </div>;
}

export const Route = createLazyRoute("/teams/$number")({
  component: TeamSummary
})
