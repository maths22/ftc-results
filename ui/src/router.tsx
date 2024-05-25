// Global styles

import DefaultLayout from './components/layout/DefaultLayout';
import {createRootRoute, createRoute, createRouter} from '@tanstack/react-router';
import { RoutableHome, RoutableSeasonHome } from './App';
import UpdateAccount from './components/users/UpdateAccount';
import ConfirmAccount from './components/users/ConfirmAccount';
import RoutableLeaguesSummary from './components/LeaguesSummary';
import { RoutableAllRankings, RoutableLeagueRankings } from './components/LeagueRankings';
import RoutableEventsSummary from './components/EventsSummary';
import EventSummary from './components/EventSummary.js';
import RoutableUploader from './components/localScoring/LocalUploader';
import RoutableTeamSummary from './components/TeamSummary';
import TeamsTable from './components/TeamsTable';
import AlliancesTab from "./components/AlliancesTab";
import RankingsTab from "./components/RankingsTab";
import AwardsTable from "./components/AwardsTable";
import MatchTab from './components/MatchTab';
import {queryClient} from "./index";
import {eventQueryOpts, leagueQueryOpts} from "./api";

function NotFoundComponent() {
  return <div>404 – Page Not Found</div>;
}

const rootRoute = createRootRoute({
  component: DefaultLayout,
  notFoundComponent: NotFoundComponent
});

const home = createRoute({ path: '/', component: RoutableHome, getParentRoute: () => rootRoute });
const updateAccount = createRoute({ path: '/account', component: UpdateAccount,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      reset_password_token: search.reset_password_token ? (search.reset_password_token as string) : undefined,
      invitation_token: search.invitation_token ? (search.invitation_token as string) : undefined
    };
  }, beforeLoad: () => ({title: 'Update Account'}), getParentRoute: () => rootRoute });
const confirmAccount = createRoute({ path: '/account/confirm', component: ConfirmAccount, getParentRoute: () => rootRoute });
const seasonHome = createRoute({ path: '/$season', component: RoutableSeasonHome, getParentRoute: () => rootRoute });
const leaguesSummary = createRoute({ path: '/$season/leagues/summary', component: RoutableLeaguesSummary, beforeLoad: () => ({title: 'Leagues'}), getParentRoute: () => rootRoute });
const leagueRankings = createRoute({ path: '/$season/leagues/rankings/$slug', component: RoutableLeagueRankings, beforeLoad: async ({params}) => ({ title:
        `${(await queryClient.fetchQuery(leagueQueryOpts(params.season, params.slug)))?.name} League Rankings` }), getParentRoute: () => rootRoute });
const allRankings = createRoute({ path: '/$season/teams/rankings', component: RoutableAllRankings, beforeLoad: () => ({title: 'Statewide Rankings'}), getParentRoute: () => rootRoute });
const eventsSummary = createRoute({ path: '/$season/events/all', component: RoutableEventsSummary, beforeLoad: () => ({title: 'Events'}), getParentRoute: () => rootRoute });
const uploader = createRoute({ path: '/$season/events/$slug/uploader', component: RoutableUploader, beforeLoad: async ({params}) => ({ title:
        (await queryClient.fetchQuery(eventQueryOpts(params.season, params.slug)))?.name + ' Local Uploader' || 'Event Local Uploader' }), getParentRoute: () => rootRoute });
const teamSummary = createRoute({ path: '/teams/$number', component: RoutableTeamSummary,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      match: search.match ? (search.match as string) : undefined,
      event_id: search.event_id ? parseInt(search.event_id as string) : undefined
    };
  }, beforeLoad: ({params}) => ({title: `Team ${params.number}`}), getParentRoute: () => rootRoute });

const eventSummary = createRoute({
          path: '/$season/events/$slug', component: EventSummary,
          validateSearch: (search: Record<string, unknown>) => {
            return {
              division: search.division ? (search.division as string) : undefined
            };
          }, beforeLoad: async ({params}) => ({ title:
              (await queryClient.fetchQuery(eventQueryOpts(params.season, params.slug)))?.name || 'Event Summary' }), getParentRoute: () => rootRoute
        });
const eventIndex = createRoute({
  path: '/',
  component: TeamsTable,
  getParentRoute: () => eventSummary
})
const eventAlliances = createRoute({
  path: '/alliances',
  component: AlliancesTab,
  getParentRoute: () => eventSummary
})
const eventAwards = createRoute({
  path: '/awards',
  component: AwardsTable,
  getParentRoute: () => eventSummary
})
const eventMatches = createRoute({
  path: '/matches',
  component: MatchTab,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      match: search.match ? (search.match as string) : undefined
    };
  },
  getParentRoute: () => eventSummary
})
const eventRankings = createRoute({
  path: '/rankings',
  component: RankingsTab,
  getParentRoute: () => eventSummary
})
const eventTeams = createRoute({
  path: '/teams',
  component: TeamsTable,
  getParentRoute: () => eventSummary
})

const router = createRouter({
  routeTree: rootRoute.addChildren([
    home,
    updateAccount,
    confirmAccount,
    seasonHome,
    leaguesSummary,
    leagueRankings,
    allRankings,
    eventsSummary,
    uploader,
    teamSummary,
    eventSummary.addChildren([
      eventAlliances,
      eventAwards,
      eventIndex,
      eventMatches,
      eventRankings,
      eventTeams
    ])
  ])
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router;
