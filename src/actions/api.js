import { RSAA } from 'redux-api-middleware';
import formurlencoded from 'form-urlencoded';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const LOGOUT_REQUEST = 'LOGOUT_REQUEST';
export const LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
export const LOGOUT_FAILURE = 'LOGOUT_FAILURE';
export const TOKEN_UPDATE = 'TOKEN_UPDATE';
export const GET_DIVISIONS_REQUEST = 'GET_DIVISIONS_REQUEST';
export const GET_DIVISIONS_SUCCESS = 'GET_DIVISIONS_SUCCESS';
export const GET_DIVISIONS_FAILURE = 'GET_DIVISIONS_FAILURE';
export const GET_EVENTS_REQUEST = 'GET_EVENTS_REQUEST';
export const GET_EVENTS_SUCCESS = 'GET_EVENTS_SUCCESS';
export const GET_EVENTS_FAILURE = 'GET_EVENTS_FAILURE';
export const GET_LEAGUES_REQUEST = 'GET_LEAGUES_REQUEST';
export const GET_LEAGUES_SUCCESS = 'GET_LEAGUES_SUCCESS';
export const GET_LEAGUES_FAILURE = 'GET_LEAGUES_FAILURE';
export const GET_TEAMS_REQUEST = 'GET_TEAMS_REQUEST';
export const GET_TEAMS_SUCCESS = 'GET_TEAMS_SUCCESS';
export const GET_TEAMS_FAILURE = 'GET_TEAMS_FAILURE';
export const GET_LEAGUE_RANKINGS_REQUEST = 'GET_LEAGUE_RANKINGS_REQUEST';
export const GET_LEAGUE_RANKINGS_SUCCESS = 'GET_LEAGUE_RANKINGS_SUCCESS';
export const GET_LEAGUE_RANKINGS_FAILURE = 'GET_LEAGUE_RANKINGS_FAILURE';
export const IMPORT_EVENT_RESULTS_REQUEST = 'IMPORT_EVENT_RESULTS_REQUEST';
export const IMPORT_EVENT_RESULTS_SUCCESS = 'IMPORT_EVENT_RESULTS_SUCCESS';
export const IMPORT_EVENT_RESULTS_FAILURE = 'IMPORT_EVENT_RESULTS_FAILURE';

export const API_HOST = process.env.REACT_APP_API_HOST;
export const API_BASE = `${API_HOST}api/v1`;

export const login = ({email, password}) => ({
  [RSAA]: {
    endpoint: API_BASE + '/auth/sign_in',
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formurlencoded({email, password}),
    types: [
      LOGIN_REQUEST,
      LOGIN_SUCCESS,
      LOGIN_FAILURE
    ]
  }
});

export const logout = () => ({
  [RSAA]: {
    endpoint: API_BASE + '/auth/sign_out',
    method: 'DELETE',
    types: [
      LOGOUT_REQUEST,
      LOGOUT_SUCCESS,
      LOGOUT_FAILURE
    ]
  }
});

//TODO generalize season
export const getDivisions = () => ({
  [RSAA]: {
    endpoint: API_BASE + '/divisions',
    method: 'GET',
    types: [
      GET_DIVISIONS_REQUEST,
      GET_DIVISIONS_SUCCESS,
      GET_DIVISIONS_FAILURE
    ]
  }
});

export const getEvents = () => ({
  [RSAA]: {
    endpoint: API_BASE + '/events',
    method: 'GET',
    types: [
      GET_EVENTS_REQUEST,
      GET_EVENTS_SUCCESS,
      GET_EVENTS_FAILURE
    ]
  }
});

export const getLeagues = () => ({
  [RSAA]: {
    endpoint: API_BASE + '/leagues',
    method: 'GET',
    types: [
      GET_LEAGUES_REQUEST,
      GET_LEAGUES_SUCCESS,
      GET_LEAGUES_FAILURE
    ]
  }
});

export const getTeams = () => ({
  [RSAA]: {
    endpoint: API_BASE + '/teams',
    method: 'GET',
    types: [
      GET_TEAMS_REQUEST,
      GET_TEAMS_SUCCESS,
      GET_TEAMS_FAILURE
    ]
  }
});


export const getLeagueRankings = () => ({
  [RSAA]: {
    endpoint: API_BASE + '/rankings/league',
    method: 'GET',
    types: [
      GET_LEAGUE_RANKINGS_REQUEST,
      GET_LEAGUE_RANKINGS_SUCCESS,
      GET_LEAGUE_RANKINGS_FAILURE
    ]
  }
});

export const importEventResults = (id, signedId) => ({
  [RSAA]: {
    endpoint: API_BASE + `/events/import_results/${id}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({import: signedId}),
    types: [
      IMPORT_EVENT_RESULTS_REQUEST,
      IMPORT_EVENT_RESULTS_SUCCESS,
      IMPORT_EVENT_RESULTS_FAILURE
    ]
  }
});

export const scoring_download_url = (event_id) => `${API_BASE}/events/download_scoring_system/${event_id}`;
