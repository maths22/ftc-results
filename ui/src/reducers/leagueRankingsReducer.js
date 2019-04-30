import {GET_DIVISION_DATA_SUCCESS, GET_LEAGUE_DATA_SUCCESS, GET_LEAGUE_RANKINGS_SUCCESS} from '../actions/api';
import {INVALIDATE_RANKINGS} from '../actions/util';
import {SET_SEASON} from '../actions/ui';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_LEAGUE_RANKINGS_SUCCESS:
    case GET_LEAGUE_DATA_SUCCESS:
    case GET_DIVISION_DATA_SUCCESS:
      return Object.assign({}, state, action.payload.rankings);
    case INVALIDATE_RANKINGS:
      return initialState;
    default:
      return state;
  }
}