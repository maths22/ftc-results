import {GET_TEAM_DETAILS_SUCCESS} from '../actions/api';

const initialState = {};

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_TEAM_DETAILS_SUCCESS:
      return Object.assign({}, state, {
        [action.payload.team.number]: action.payload.team
      });
    default:
      return state;
  }
}