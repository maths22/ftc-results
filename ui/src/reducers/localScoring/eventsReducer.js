
import {LOCAL_GET_EVENTS_SUCCESS, LOCAL_CLEAR_EVENTS} from '../../actions/localScoringApi';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case LOCAL_GET_EVENTS_SUCCESS:
      return action.payload.eventCodes;
    case LOCAL_CLEAR_EVENTS:
      return initialState;
    default:
      return state;
  }
}