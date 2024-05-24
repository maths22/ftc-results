import React, {lazy, Component, Suspense} from 'react';

// Global styles

import DefaultLayout from './components/layout/DefaultLayout';
import {createRootRoute, createRoute, createRouter, NotFoundRoute, Route} from '@tanstack/react-router';
import { RoutableHome, RoutableSeasonHome } from './App';
import UpdateAccount from './components/users/UpdateAccount';
import ConfirmAccount from './components/users/ConfirmAccount';
import RoutableLeaguesSummary from './components/LeaguesSummary';
import { RoutableAllRankings, RoutableLeagueRankings } from './components/LeagueRankings';
import RoutableEventsSummary from './components/EventsSummary';
import RoutableEventSummary from './components/EventSummary.js';
import RoutableUploader from './components/localScoring/Uploader';
import RoutableTeamSummary from './components/TeamSummary';

function NotFoundComponent() {
  return <div>404 – Page Not Found</div>;
}

const rootRoute = createRootRoute({
  component: DefaultLayout,
  notFoundComponent: NotFoundComponent
});

const routes = [
  { path: '/', component: RoutableHome },
  { path: '/account', component: UpdateAccount, beforeLoad: () => ({title: 'Update Account'}) },
  { path: '/account/confirm', component: ConfirmAccount },
  { path: '/$season', component: RoutableSeasonHome },
  { path: '/$season/leagues/summary', component: RoutableLeaguesSummary, beforeLoad: () => ({title: 'Leagues'}) },
  { path: '/$season/leagues/rankings/$slug', component: RoutableLeagueRankings, beforeLoad: () => ({title: 'TODO leaguename League Rankings'}) },
  { path: '/$season/teams/rankings', component: RoutableAllRankings, beforeLoad: () => ({title: 'Statewide Rankings'}) },
  { path: '/$season/events/all', component: RoutableEventsSummary, beforeLoad: () => ({title: 'Events'}) },
  {
    path: '/$season/events/$slug', component: RoutableEventSummary,
    validateSearch: (search) => {
      return {
        tab: search.tab,
        division: search.division
      };
    }, beforeLoad: () => ({title: 'TODO: eventname'})
  },
  { path: '/$season/events/$slug/uploader', component: RoutableUploader, beforeLoad: () => ({title: 'TODO eventname Uploader'}) },
  { path: '/teams/$number', component: RoutableTeamSummary, beforeLoad: ({params}) => ({title: `Team ${params.number}`}) }
].map(desc => createRoute({
  ...desc,
  getParentRoute: () => rootRoute
}));

const router = createRouter({
  routeTree: rootRoute.addChildren(routes)
});
export default router;
