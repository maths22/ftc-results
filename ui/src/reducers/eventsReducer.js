import {GET_EVENT_SUCCESS, GET_EVENT_TEAMS_SUCCESS, GET_EVENTS_SUCCESS, GET_TEAM_DETAILS_SUCCESS, ADD_OWNER_SUCCESS, REMOVE_OWNER_SUCCESS} from '../actions/api';
import {CLEAR_USER_DEPENDENT_STATE} from '../actions/util';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_EVENTS_SUCCESS:
      state = state || {};
      return Object.assign({}, state, action.payload.reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
      }, {}));
    case GET_EVENT_SUCCESS:
    case ADD_OWNER_SUCCESS:
    case REMOVE_OWNER_SUCCESS:
      state = state || {};
      return Object.assign({}, state, {
        [action.payload.id]: Object.assign({}, state[action.payload.id], action.payload)
      });
    case GET_TEAM_DETAILS_SUCCESS:
      return Object.assign({}, state, action.payload.events.reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
      }, {}));
    case GET_EVENT_TEAMS_SUCCESS:
      state = state || {};
      return Object.assign({}, state, {
        [action.payload.id]: Object.assign({}, state[action.payload.id], {
          teams: action.payload.teams
        })
      });
    case CLEAR_USER_DEPENDENT_STATE:
      return initialState;
    default:
      return state;
  }
}