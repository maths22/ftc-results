import {GET_MATCH_DETAILS_SUCCESS} from '../actions/api';

const initialState = {};

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_MATCH_DETAILS_SUCCESS:
      return Object.assign({}, state, {[action.payload.id]: action.payload});
    default:
      return state;
  }
}