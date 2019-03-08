import { combineReducers } from 'redux';
import eventsReducer from './eventsReducer';
import serverReducer from './serverReducer';

export default combineReducers({
  events: eventsReducer,
  server: serverReducer
});