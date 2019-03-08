import {
  LOCAL_SET_SERVER,
  LOCAL_GET_VERSION_SUCCESS,
  LOCAL_GET_VERSION_FAILURE, LOCAL_SET_EVENT,
  LOCAL_SET_RUNNING
} from '../../actions/localScoringApi';
import pick from 'lodash/pick';

const initialState = {
  hostname: 'localhost',
  port: 80,
  verified: null,
  event: '',
  uploadRunning: false
};

const LOCAL_STORAGE_KEY = 'uploader_server';
const valuesToSave = ['hostname', 'port', 'event'];

const storage = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

export default function (
    state = Object.assign({}, initialState, storage),
    action
) {
  let ret;
  switch (action.type) {
    case LOCAL_SET_SERVER:
      ret = Object.assign({}, state, {
        hostname: action.hostname,
        port: action.port,
        verified: null,
        event: ''
      });
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pick(ret, valuesToSave)));
      return ret;
    case LOCAL_SET_EVENT:
      ret = Object.assign({}, state, { event: action.event});
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(pick(ret, valuesToSave)));
      return ret;
    case LOCAL_SET_RUNNING:
      ret = Object.assign({}, state, { uploadRunning: action.running});
      return ret;
    case LOCAL_GET_VERSION_SUCCESS:
      return Object.assign({}, state, {verified: true});
    case LOCAL_GET_VERSION_FAILURE:
      return Object.assign({}, state, {verified: false});
    default:
      return state;
  }
}