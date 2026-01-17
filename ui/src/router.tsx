// Global styles

import DefaultLayout from './components/layout/DefaultLayout';
import {createRootRoute, createRoute, createRouter, redirect} from '@tanstack/react-router';
import {queryClient} from "./index";
import { eventQueryOpts, GOV_CUP_CODE, GOV_CUP_SEASON, teamQueryOpts } from './api.ts';
import { abbrevToState } from './components/util.ts';


function NotFoundComponent() {
  return <div>404 – Page Not Found</div>;
}

const rootRoute = createRootRoute({
  component: DefaultLayout,
  notFoundComponent: NotFoundComponent
});

const teamSummary = createRoute({ path: '/teams/$number',
  validateSearch: (search: Record<string, unknown>) => {
    return {
      match: search.match ? (search.match as string) : undefined,
      event_id: search.event_id ? parseInt(search.event_id as string) : undefined
    };
  }, beforeLoad: async({params}) => {
      const teamInfo = await queryClient.fetchQuery(teamQueryOpts(GOV_CUP_SEASON, params.number))
      return {title: `Team ${abbrevToState(teamInfo?.stateProv)}`}
    }, getParentRoute: () => rootRoute })
    .lazy(() => import('./components/TeamSummary.tsx').then((d) => d.Route));

const eventSummary = createRoute({
          id: 'eventSummary',
          validateSearch: (search: Record<string, unknown>) => {
            return {
              division: search.division ? (search.division as string) : undefined
            };
          }, beforeLoad: async ({params}) => ({ title:
              (await queryClient.fetchQuery(eventQueryOpts(GOV_CUP_SEASON, GOV_CUP_CODE)))?.name || 'Event Summary' }), getParentRoute: () => rootRoute
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
