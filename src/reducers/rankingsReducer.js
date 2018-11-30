import {GET_EVENT_RANKINGS_SUCCESS} from '../actions/api';

const initialState = {};

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_EVENT_RANKINGS_SUCCESS:
      return Object.assign({}, state, action.payload.reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
      }, {}));
    default:
      return state;
  }
}