import {
  GET_DIVISION_DATA_SUCCESS,
  GET_LEAGUE_DATA_SUCCESS,
  GET_LEAGUE_RANKINGS_SUCCESS,
  GET_LEAGUES_SUCCESS
} from '../actions/api';
import {SET_SEASON} from '../actions/ui';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_LEAGUES_SUCCESS:
      return Object.assign({}, state, action.payload.reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
      }, {}));
    case GET_LEAGUE_RANKINGS_SUCCESS:
    case GET_LEAGUE_DATA_SUCCESS:
    case GET_DIVISION_DATA_SUCCESS:
      return Object.assign({}, state, action.payload.leagues.reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
      }, {}));
    default:
      return state;
  }
}