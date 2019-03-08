import {GET_LEAGUE_RANKINGS_SUCCESS} from '../actions/api';
import {INVALIDATE_RANKINGS} from '../actions/util';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_LEAGUE_RANKINGS_SUCCESS:
      return action.payload;
    case INVALIDATE_RANKINGS:
      return initialState;
    default:
      return state;
  }
}