// Global styles

import DefaultLayout from './components/layout/DefaultLayout';
import {createRootRoute, createRoute, createRouter} from '@tanstack/react-router';
import {queryClient} from "./index";
import {eventQueryOpts, leagueQueryOpts} from "./api";

function NotFoundComponent() {
  return <div>404 – Page Not Found</div>;
}

const rootRoute = createRootRoute({
  component: DefaultLayout,
  notFoundComponent: NotFoundComponent
});

const home = createRoute({ path: '/', getParentRoute: () => rootRoute })
    .lazy(() => import('./App.tsx').then((d) => d.Route));
const updateAccount = createRoute({ path: '/account',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      reset_password_token: search.reset_password_token ? (search.reset_password_token as string) : undefined,
      invitation_token: search.invitation_token ? (search.invitation_token as string) : undefined
    };
  }, beforeLoad: () => ({title: 'Update Account'}), getParentRoute: () => rootRoute })
    .lazy(() => import('./components/users/UpdateAccount.tsx').then((d) => d.Route));
const confirmAccount = createRoute({ path: '/account/confirm', getParentRoute: () => rootRoute })
    .lazy(() => import('./components/users/ConfirmAccount.tsx').then((d) => d.Route));
const seasonHome = createRoute({ path: '/$season', getParentRoute: () => rootRoute })
    .lazy(() => import('./App.tsx').then((d) => d.SeasonRoute));
const leaguesSummary = createRoute({ path: '/$season/leagues/summary', beforeLoad: () => ({title: 'Leagues'}), getParentRoute: () => rootRoute })
    .lazy(() => import('./components/LeaguesSummary.tsx').then((d) => d.Route));
const leagueRankings = createRoute({ path: '/$season/leagues/rankings/$slug', beforeLoad: async ({params}) => ({ title:
        `${(await queryClient.fetchQuery(leagueQueryOpts(params.season, params.slug)))?.name} League Rankings` }), getParentRoute: () => rootRoute })
    .lazy(() => import('./components/LeagueRankings.tsx').then((d) => d.LeagueRoute));
const allRankings = createRoute({ path: '/$season/teams/rankings', beforeLoad: () => ({title: 'Statewide Rankings'}), getParentRoute: () => rootRoute })
    .lazy(() => import('./components/LeagueRankings.tsx').then((d) => d.AllRoute));
const eventsSummary = createRoute({ path: '/$season/events/all', beforeLoad: () => ({title: 'Events'}), getParentRoute: () => rootRoute })
    .lazy(() => import('./components/EventsSummary.tsx').then((d) => d.Route));
const uploader = createRoute({ path: '/$season/events/$slug/uploader', beforeLoad: async ({params}) => ({ title:
        (await queryClient.fetchQuery(eventQueryOpts(params.season, params.slug)))?.name + ' Local Uploader' || 'Event Local Uploader' }), getParentRoute: () => rootRoute })
    .lazy(() => import('./components/localScoring/LocalUploader.tsx').then((d) => d.Route));
const teamSummary = createRoute({ path: '/teams/$number',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      match: search.match ? (search.match as string) : undefined,
      event_id: search.event_id ? parseInt(search.event_id as string) : undefined
    };
  }, beforeLoad: ({params}) => ({title: `Team ${params.number}`}), getParentRoute: () => rootRoute })
    .lazy(() => import('./components/TeamSummary.tsx').then((d) => d.Route));

const eventSummary = createRoute({
          path: '/$season/events/$slug',
          validateSearch: (search: Record<string, unknown>) => {
            return {
              division: search.division ? (search.division as string) : undefined
            };
          }, beforeLoad: async ({params}) => ({ title:
              (await queryClient.fetchQuery(eventQueryOpts(params.season, params.slug)))?.name || 'Event Summary' }), getParentRoute: () => rootRoute
        })
    .lazy(() => import('./components/EventSummary.tsx').then((d) => d.Route));
const eventIndex = createRoute({
  path: '/',
  getParentRoute: () => eventSummary
}).lazy(() => import('./components/TeamsTable.tsx').then((d) => d.IndexRoute))
const eventAlliances = createRoute({
  path: '/alliances',
  getParentRoute: () => eventSummary
}).lazy(() => import('./components/AlliancesTab.tsx').then((d) => d.Route))
const eventAwards = createRoute({
  path: '/awards',
  getParentRoute: () => eventSummary
}).lazy(() => import('./components/AwardsTable.tsx').then((d) => d.Route))
const eventMatches = createRoute({
  path: '/matches',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      match: search.match ? (search.match as string) : undefined
    };
  },
  getParentRoute: () => eventSummary
}).lazy(() => import('./components/MatchTab.tsx').then((d) => d.Route))
const eventRankings = createRoute({
  path: '/rankings',
  getParentRoute: () => eventSummary
}).lazy(() => import('./components/RankingsTab.tsx').then((d) => d.Route))
const eventTeams = createRoute({
  path: '/teams',
  getParentRoute: () => eventSummary
}).lazy(() => import('./components/TeamsTable.tsx').then((d) => d.Route))

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
