import { RSAA } from 'redux-api-middleware';


export const LOCAL_GET_EVENTS_REQUEST = 'LOCAL_GET_EVENTS_REQUEST';
export const LOCAL_GET_EVENTS_SUCCESS = 'LOCAL_GET_EVENTS_SUCCESS';
export const LOCAL_GET_EVENTS_FAILURE = 'LOCAL_GET_EVENTS_FAILURE';
export const LOCAL_GET_VERSION_REQUEST = 'LOCAL_GET_VERSION_REQUEST';
export const LOCAL_GET_VERSION_SUCCESS = 'LOCAL_GET_VERSION_SUCCESS';
export const LOCAL_GET_VERSION_FAILURE = 'LOCAL_GET_VERSION_FAILURE';

// These are for use in API calls that are not intended to hit a reducer
export const LOCAL_GENERAL_REQUEST = 'LOCAL_GENERAL_REQUEST';
export const LOCAL_GENERAL_SUCCESS = 'LOCAL_GENERAL_SUCCESS';
export const LOCAL_GENERAL_FAILURE = 'LOCAL_GENERAL_FAILURE';

const apiBase = (path) => (store) => `http://${store.localScoring.server.hostname}:${store.localScoring.server.port}/apiv1${path}/`;
const ilApiBase = (path) => (store) => `http://${store.localScoring.server.hostname}:${store.localScoring.server.port}/_il_api${path}/`;

export const getLocalEvents = () => ({
  [RSAA]: {
    endpoint: apiBase(`/events`),
    method: 'GET',
    types: [
      LOCAL_GET_EVENTS_REQUEST,
      LOCAL_GET_EVENTS_SUCCESS,
      LOCAL_GET_EVENTS_FAILURE
    ]
  }
});

export const getLocalVersion = () => ({
  [RSAA]: {
    endpoint: apiBase(`/version`),
    method: 'GET',
    types: [
      LOCAL_GET_VERSION_REQUEST,
      LOCAL_GET_VERSION_SUCCESS,
      LOCAL_GET_VERSION_FAILURE
    ]
  }
});


export const getLocalEvent = (event) => ({
  [RSAA]: {
    endpoint: apiBase(`/events/${event}`),
    method: 'GET',
    types: [
      LOCAL_GENERAL_REQUEST,
      LOCAL_GENERAL_SUCCESS,
      LOCAL_GENERAL_FAILURE
    ]
  }
});

export const getLocalTeamList = (event) => ({
  [RSAA]: {
    endpoint: apiBase(`/events/${event}/teams`),
    method: 'GET',
    types: [
      LOCAL_GENERAL_REQUEST,
      LOCAL_GENERAL_SUCCESS,
      LOCAL_GENERAL_FAILURE
    ]
  }
});

export const getLocalRankings = (event) => ({
  [RSAA]: {
    endpoint: apiBase(`/events/${event}/rankings`),
    method: 'GET',
    types: [
      LOCAL_GENERAL_REQUEST,
      LOCAL_GENERAL_SUCCESS,
      LOCAL_GENERAL_FAILURE
    ]
  }
});

export const getLocalAlliances = (event) => ({
  [RSAA]: {
    endpoint: apiBase(`/events/${event}/elim/alliances`),
    method: 'GET',
    types: [
      LOCAL_GENERAL_REQUEST,
      LOCAL_GENERAL_SUCCESS,
      LOCAL_GENERAL_FAILURE
    ]
  }
});

export const getLocalMatches = (event) => ({
  [RSAA]: {
    endpoint: apiBase(`/events/${event}/matches`),
    method: 'GET',
    types: [
      LOCAL_GENERAL_REQUEST,
      LOCAL_GENERAL_SUCCESS,
      LOCAL_GENERAL_FAILURE
    ]
  }
});

export const getLocalElimMatches = (event, prefix) => ({
  [RSAA]: {
    endpoint: apiBase(`/events/${event}/elim/${prefix}`),
    method: 'GET',
    types: [
      LOCAL_GENERAL_REQUEST,
      LOCAL_GENERAL_SUCCESS,
      LOCAL_GENERAL_FAILURE
    ]
  }
});


export const getLocalMatchDetails = (event, season, prefix, matchNo) => ({
  [RSAA]: {
    endpoint: apiBase(`/${season}/events/${event}/${prefix}/${matchNo}`),
    method: 'GET',
    types: [
      LOCAL_GENERAL_REQUEST,
      LOCAL_GENERAL_SUCCESS,
      LOCAL_GENERAL_FAILURE
    ]
  }
});


export const getLocalAwards = (event) => ({
  [RSAA]: {
    endpoint: apiBase(`/events/${event}/awards`),
    method: 'GET',
    types: [
      LOCAL_GENERAL_REQUEST,
      LOCAL_GENERAL_SUCCESS,
      LOCAL_GENERAL_FAILURE
    ]
  }
});

export const getLocalNextDisplay = (event) => ({
  [RSAA]: {
    endpoint: ilApiBase(`/${event}/next_disp_cmd`),
    method: 'GET',
    types: [
      LOCAL_GENERAL_REQUEST,
      LOCAL_GENERAL_SUCCESS,
      LOCAL_GENERAL_FAILURE
    ]
  }
});

export const LOCAL_RESET = 'LOCAL_RESET';
export const LOCAL_CLEAR_EVENTS = 'LOCAL_CLEAR_EVENTS';
export const LOCAL_SET_SERVER = 'LOCAL_SET_SERVER';
export const LOCAL_SET_EVENT = 'LOCAL_SET_EVENT';
export const LOCAL_SET_VERIFIED = 'LOCAL_SET_VERIFIED';
export const LOCAL_SET_RUNNING = 'LOCAL_SET_RUNNING';

export const localReset = () => ({
  type: LOCAL_RESET,
});

export const localClearEvents = () => ({
  type: LOCAL_CLEAR_EVENTS,
});

export const setServer = (hostname, port) => ({
  type: LOCAL_SET_SERVER,
  hostname,
  port
});
export const setEvent = (event) => ({
  type: LOCAL_SET_EVENT,
  event
});
export const setRunning = (running) => ({
  type: LOCAL_SET_RUNNING,
  running
});
export const setVerified = (verified) => ({
  type: LOCAL_SET_VERIFIED,
  verified
});