import {LOGOUT_REQUEST, TOKEN_UPDATE} from '../actions/api';
import mapKeys from 'lodash/mapKeys';

export const LOCAL_STORAGE_KEY = 'access_token';
export const TOKEN_UPDATE_RAW = 'TOKEN_UPDATE_RAW';

const initialState = {};

const storage = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

export default function (
    state = storage || initialState,
    action
) {
  let val;
  switch (action.type) {
    case LOGOUT_REQUEST:
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      return initialState;
    case TOKEN_UPDATE:
      val = mapKeys(action.payload, (_, key) => key.toLowerCase());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(val));

      return Object.assign({}, state, val);
    case TOKEN_UPDATE_RAW:
      val = mapKeys(action.payload, (_, key) => key.toLowerCase());

      return Object.assign({}, state, val);
    default:
      return state;
  }
}