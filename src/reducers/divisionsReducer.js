import {GET_DIVISIONS_SUCCESS} from '../actions/api';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_DIVISIONS_SUCCESS:
      return action.payload.reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
      }, {});
    default:
      return state;
  }
}