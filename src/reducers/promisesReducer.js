import {REGISTER_PROMISE, UNREGISTER_PROMISE} from '../actions/promise';

const initialState = {};

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case REGISTER_PROMISE:
      return Object.assign({}, state, {[action.name]: action.value});
    case UNREGISTER_PROMISE:
      return Object.assign({}, state, {[action.name]: null});
    default:
      return state;
  }
}