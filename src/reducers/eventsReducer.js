import {GET_EVENT_TEAMS_SUCCESS, GET_EVENTS_SUCCESS} from '../actions/api';
import {CLEAR_USER_DEPENDENT_STATE} from '../actions/util';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_EVENTS_SUCCESS:
      state = state || {};
      return action.payload.reduce(function(map, obj) {
        map[obj.id] = Object.assign({}, obj, state[obj.id]);
        return map;
      }, {});
    case GET_EVENT_TEAMS_SUCCESS:
      state = state || {};
      return Object.assign({}, state, {
        [action.payload.id]: Object.assign({}, state[action.payload.id], {
          teams: action.payload.teams
        })});
    case CLEAR_USER_DEPENDENT_STATE:
      return initialState;
    default:
      return state;
  }
}