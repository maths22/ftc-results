import {LOGOUT_REQUEST, TOKEN_UPDATE} from '../actions/api';
import mapKeys from 'lodash/mapKeys';

const LOCAL_STORAGE_KEY = 'access_token';

const initialState = {
  'x-uid': null,
};

const storage = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

export default function (
    state = storage || initialState,
    action
) {
  switch (action.type) {
    case LOGOUT_REQUEST:
      localStorage.removeItem(LOCAL_STORAGE_KEY);

      return initialState;
    case TOKEN_UPDATE:
      const val = mapKeys(action.payload, (_, key) => key.toLowerCase());
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(val));

      return Object.assign({}, state, val);
    default:
      return state;
  }
}