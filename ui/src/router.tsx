// Global styles

import DefaultLayout from './components/layout/DefaultLayout';
import {createRootRoute, createRoute, createRouter, redirect} from '@tanstack/react-router';
import {queryClient} from "./index";
import { eventQueryOpts } from './api.ts';

function NotFoundComponent() {
  return <div>404 – Page Not Found</div>;
}

const rootRoute = createRootRoute({
  component: DefaultLayout,
  notFoundComponent: NotFoundComponent
});

const home = createRoute({ path: '/', getParentRoute: () => rootRoute })
    .lazy(() => import('./App.tsx').then((d) => d.Route));
const seasonHome = createRoute({ path: '/$season', getParentRoute: () => rootRoute })
    .lazy(() => import('./App.tsx').then((d) => d.SeasonRoute));
const eventsSummary = createRoute({ path: '/$season/events/all', beforeLoad: () => ({title: 'Events'}), getParentRoute: () => rootRoute })
    .lazy(() => import('./components/EventsSummary.tsx').then((d) => d.Route));
const teamSummary = createRoute({ path: '/$season/teams/$number',
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
    seasonHome,
    eventsSummary,
    teamSummary,
    eventSummary.addChildren([
      eventAlliances,
      eventAwards,
      eventIndex,
      eventMatches,
      eventRankings,
      eventTeams,
      createRoute({
        path: '/playoffs',
        getParentRoute: () => eventSummary,
        loader: () => {
          throw redirect({
            to: '../matches'
          })
        }
      }),
      createRoute({
        path: '/qualifications/$number',
        getParentRoute: () => eventSummary,
        loader: ({params}) => {
          throw redirect({
            to: `../../matches?match=Q-${params.number}`
          })
        }
      }),
      createRoute({
        path: '/playoff/0/$number',
        getParentRoute: () => eventSummary,
        loader: ({params}) => {
          throw redirect({
            to: `../../../matches?match=P-${params.number}`
          })
        }
      }),
      createRoute({
        path: '/finals/0/$number',
        getParentRoute: () => eventSummary,
        loader: ({params}) => {
          throw redirect({
            to: `../../../matches?match=F-${params.number}`
          })
        }
      })
    ])
  ])
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default router;
