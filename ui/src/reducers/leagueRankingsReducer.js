import {GET_LEAGUE_DATA_SUCCESS, GET_LEAGUE_RANKINGS_SUCCESS} from '../actions/api';
import {INVALIDATE_RANKINGS} from '../actions/util';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_LEAGUE_RANKINGS_SUCCESS:
    case GET_LEAGUE_DATA_SUCCESS:
      return Object.assign({}, state,  action.payload.rankings.reduce(function(map, obj) {
        map[obj.team + '_' + obj.context_id  ] = obj;
        return map;
      }, {}));
    case INVALIDATE_RANKINGS:
      return initialState;
    default:
      return state;
  }
}