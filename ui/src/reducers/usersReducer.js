import {
  ACTIVATE_ACCOUNT_SUCCESS,
  GET_USERS_SUCCESS, SEARCH_USERS_SUCCESS,
  UPDATE_ACCOUNT_SUCCESS,
  VERIFY_TOKEN_SUCCESS
} from '../actions/api';

const initialState = null;

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case ACTIVATE_ACCOUNT_SUCCESS:
    case UPDATE_ACCOUNT_SUCCESS:
    case VERIFY_TOKEN_SUCCESS:
      return Object.assign({}, state, {
        [action.payload.data.uid]: action.payload.data
      });
    case GET_USERS_SUCCESS:
    case SEARCH_USERS_SUCCESS:
      return Object.assign({}, state, action.payload.reduce(function(map, obj) {
        map[obj.uid] = obj;
        return map;
      }, {}));
    default:
      return state;
  }
}