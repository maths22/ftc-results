import {GET_EVENT_MATCHES_SUCCESS, GET_TEAM_DETAILS_SUCCESS} from '../actions/api';

const initialState = {};

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_EVENT_MATCHES_SUCCESS:
      return Object.assign({}, state, action.payload.reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
      }, {}));
    case GET_TEAM_DETAILS_SUCCESS:
      return Object.assign({}, state, action.payload.matches.reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
      }, {}));
    default:
      return state;
  }
}