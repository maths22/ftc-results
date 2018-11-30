import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';

import divisionsReducer from './divisionsReducer';
import tokenReducer from './tokenReducer';
import leaguesReducer from './leaguesReducer';
import leagueRankingsReducer from './leagueRankingsReducer';
import teamsReducer from './teamsReducer';
import eventsReducer from './eventsReducer';
import promisesReducer from './promisesReducer';
import { reducer as formReducer } from 'redux-form';
import uiReducer from './uiReducer';
import matchesReducer from './matchesReducer';
import teamDetailsReducer from './teamDetailsReducer';
import rankingsReducer from './rankingsReducer';

export default (history) => combineReducers({
  divisions: divisionsReducer,
  events: eventsReducer,
  form: formReducer,
  leagueRankings: leagueRankingsReducer,
  leagues: leaguesReducer,
  matches: matchesReducer,
  promises: promisesReducer,
  rankings: rankingsReducer,
  router: connectRouter(history),
  teamDetails: teamDetailsReducer,
  teams: teamsReducer,
  token: tokenReducer,
  ui: uiReducer
});