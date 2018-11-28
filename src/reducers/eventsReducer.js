import {GET_EVENTS_SUCCESS} from '../actions/api';
import {CLEAR_USER_DEPENDENT_STATE} from '../actions/util';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_EVENTS_SUCCESS:
      return action.payload.reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
      }, {});
    case CLEAR_USER_DEPENDENT_STATE:
      return initialState;
    default:
      return state;
  }
}