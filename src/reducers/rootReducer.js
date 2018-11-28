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

export default (history) => combineReducers({
  divisions: divisionsReducer,
  events: eventsReducer,
  form: formReducer,
  leagueRankings: leagueRankingsReducer,
  leagues: leaguesReducer,
  promises: promisesReducer,
  router: connectRouter(history),
  teams: teamsReducer,
  token: tokenReducer,
  ui: uiReducer
});