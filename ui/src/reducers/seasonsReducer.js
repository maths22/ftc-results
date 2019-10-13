import {GET_SEASONS_SUCCESS, GET_TEAM_DETAILS_SUCCESS} from '../actions/api';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_SEASONS_SUCCESS:
      return action.payload;
    default:
      return state;
  }
}