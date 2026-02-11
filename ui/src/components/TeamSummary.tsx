import LoadingSpinner from './LoadingSpinner';
import Typography from '@mui/material/Typography';
import MatchTable from './MatchTable';
import TextLink from './TextLink';
import EventChip from './EventChip';

import Card from '@mui/material/Card';
import {styled} from '@mui/material/styles';
import {createLazyRoute, useParams} from '@tanstack/react-router';
import {GOV_CUP_SEASON, useSeason, useTeamDetails} from "../api";
import {components} from "../api/first-v3";
import { teamToStateName, isEventHappening } from './util';
import MatchDetailsDialog from './MatchDetailsDialog';
import { Temporal } from 'temporal-polyfill';

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
    {/* {season.record.win + season.record.tie + season.record.loss > 0 ?
        <><b>Season Record:</b> {`${season.record.win}-${season.record.loss}-${season.record.tie}`}</> : null } */}

    {events.map((evt) => {
          const startDate = Temporal.PlainDate.from(evt.event.startDate);
          const endDate = Temporal.PlainDate.from(evt.event.endDate);
          const isHappening = isEventHappening(evt.event.startDate, evt.event.endDate) && !evt.event.published;
          return <Card key={evt.event.code} style={{margin: '1em 0'}}>
            <Heading>
              <div style={{display: 'flex'}}>
                <Typography variant="h6" gutterBottom><TextLink to={`/${season.cmpYear}/events/${evt.event.code}`}>{evt.event.name}</TextLink></Typography>
                <EventChip event={evt.event}/>
              </div>
              <p>
                {startDate.year == 9999 ? 'TBA' : startDate === endDate ? startDate.toLocaleString() : (startDate.toLocaleString() + ' - ' + endDate.toLocaleString())}<br/>
              </p>

              {evt.matches.filter((m) => m.matchResults).length > 0 && !(evt.event.format == 'REMOTE' && evt.event.type === 'LEAGUE_MEET' || !evt.ranking) ? <p style={{marginBottom: 0, marginTop: 0}}>
                Team {teamToStateName(team)} {evt.event.type === 'LEAGUE_MEET' ? null : <>{isHappening ? 'is' : 'was'} <b>Rank {evt.ranking.rank}</b></>}
                {evt.event.format == 'REMOTE' ? null : <>{evt.event.type === 'LEAGUE_MEET' ? ' ' + (isHappening ? 'has' : 'had') + ' a record of ' : ' with a record of '}
                <b style={{whiteSpace: 'nowrap'}}>{`${evt.ranking.wins}-${evt.ranking.losses}-${evt.ranking.ties}`}</b></>}
              </p> : null}
            </Heading>
            <MatchTable seasonYear={season.cmpYear.toString()} team={team.number} matches={evt.matches} event={evt.event} />
          </Card>;})}
  </div>;
}

export default function TeamSummary() {
  const season = GOV_CUP_SEASON;
  const {number} = useParams({ from: '/teams/$number' });
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
    <link rel="stylesheet" href={`https://ftc-api.firstinspires.org/avatars/composed/${season}.css`} />
    <Heading>
      <Typography variant="h4" sx={{display: 'flex', alignItems: 'center'}}>
        <div className={`team-avatar team-${team?.stateProv}`} style={{marginRight: '0.25em', '--avatar-size': 50}}></div>
        Team {teamToStateName(team)}
      </Typography>
      <p>
        <b>Also known as:</b> FTC Team {team.displayNumber} - {team.name}<br/>
        <b>Affiliations:</b> {team.affiliations}<br/>
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
