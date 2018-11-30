import {GET_TEAM_DETAILS_SUCCESS} from '../actions/api';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_TEAM_DETAILS_SUCCESS:
      return action.payload.matches.reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
      }, {});
    default:
      return state;
  }
}