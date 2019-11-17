import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import awardsReducer from './awardsReducer';
import divisionsReducer from './divisionsReducer';
import tokenReducer from './tokenReducer';
import leaguesReducer from './leaguesReducer';
import leagueRankingsReducer from './leagueRankingsReducer';
import teamsReducer from './teamsReducer';
import eventsReducer from './eventsReducer';
import seasonsReducer from './seasonsReducer';
import promisesReducer from './promisesReducer';
import { reducer as formReducer } from 'redux-form';
import uiReducer from './uiReducer';
import matchesReducer from './matchesReducer';
import teamDetailsReducer from './teamDetailsReducer';
import rankingsReducer from './rankingsReducer';
import matchDetailsReducer from './matchDetailsReducer';

import localScoringReducer from './localScoring/rootReducer';
import usersReducer from './usersReducer';
import alliancesReducer from './alliancesReducer';

export default (history) => combineReducers({
  alliances: alliancesReducer,
  awards: awardsReducer,
  divisions: divisionsReducer,
  events: eventsReducer,
  form: formReducer,
  leagueRankings: leagueRankingsReducer,
  leagues: leaguesReducer,
  matchDetails: matchDetailsReducer,
  matches: matchesReducer,
  promises: promisesReducer,
  rankings: rankingsReducer,
  router: connectRouter(history),
  seasons: seasonsReducer,
  teamDetails: teamDetailsReducer,
  teams: teamsReducer,
  token: tokenReducer,
  ui: uiReducer,
  users: usersReducer,

  localScoring: localScoringReducer
});