import {GET_TEAMS_SUCCESS} from '../actions/api';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_TEAMS_SUCCESS:
      return action.payload.reduce(function(map, obj) {
        map[obj.number] = obj;
        return map;
      }, {});
    default:
      return state;
  }
}