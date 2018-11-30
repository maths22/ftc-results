import {GET_TEAM_DETAILS_SUCCESS} from '../actions/api';
import omit from 'lodash/omit';

const initialState = {};

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_TEAM_DETAILS_SUCCESS:
      return Object.assign({}, state, {
        [action.payload.number]: omit(action.payload, ['matches'])
      });
    default:
      return state;
  }
}