import { RSAA } from 'redux-api-middleware';
import formurlencoded from 'form-urlencoded';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const VERIFY_TOKEN_REQUEST = 'VERIFY_TOKEN_REQUEST';
export const VERIFY_TOKEN_SUCCESS = 'VERIFY_TOKEN_SUCCESS';
export const VERIFY_TOKEN_FAILURE = 'VERIFY_TOKEN_FAILURE';
export const SET_PASSWORD_REQUEST = 'SET_PASSWORD_REQUEST';
export const SET_PASSWORD_SUCCESS = 'SET_PASSWORD_SUCCESS';
export const SET_PASSWORD_FAILURE = 'SET_PASSWORD_FAILURE';
export const RESET_PASSWORD_REQUEST = 'RESET_PASSWORD_REQUEST';
export const RESET_PASSWORD_SUCCESS = 'RESET_PASSWORD_SUCCESS';
export const RESET_PASSWORD_FAILURE = 'RESET_PASSWORD_FAILURE';
export const UPDATE_ACCOUNT_REQUEST = 'UPDATE_ACCOUNT_REQUEST';
export const UPDATE_ACCOUNT_SUCCESS = 'UPDATE_ACCOUNT_SUCCESS';
export const UPDATE_ACCOUNT_FAILURE = 'UPDATE_ACCOUNT_FAILURE';
export const CREATE_ACCOUNT_REQUEST = 'CREATE_ACCOUNT_REQUEST';
export const CREATE_ACCOUNT_SUCCESS = 'CREATE_ACCOUNT_SUCCESS';
export const CREATE_ACCOUNT_FAILURE = 'CREATE_ACCOUNT_FAILURE';
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
export const GET_TEAM_DETAILS_REQUEST = 'GET_TEAM_DETAILS_REQUEST';
export const GET_TEAM_DETAILS_SUCCESS = 'GET_TEAM_DETAILS_SUCCESS';
export const GET_TEAM_DETAILS_FAILURE = 'GET_TEAM_DETAILS_FAILURE';
export const GET_EVENT_MATCHES_REQUEST = 'GET_EVENT_MATCHES_REQUEST';
export const GET_EVENT_MATCHES_SUCCESS = 'GET_EVENT_MATCHES_SUCCESS';
export const GET_EVENT_MATCHES_FAILURE = 'GET_EVENT_MATCHES_FAILURE';
export const GET_EVENT_TEAMS_REQUEST = 'GET_EVENT_TEAMS_REQUEST';
export const GET_EVENT_TEAMS_SUCCESS = 'GET_EVENT_TEAMS_SUCCESS';
export const GET_EVENT_TEAMS_FAILURE = 'GET_EVENT_TEAMS_FAILURE';
export const GET_EVENT_RANKINGS_REQUEST = 'GET_EVENT_RANKINGS_REQUEST';
export const GET_EVENT_RANKINGS_SUCCESS = 'GET_EVENT_RANKINGS_SUCCESS';
export const GET_EVENT_RANKINGS_FAILURE = 'GET_EVENT_RANKINGS_FAILURE';
export const GET_MATCH_DETAILS_REQUEST = 'GET_MATCH_DETAILS_REQUEST';
export const GET_MATCH_DETAILS_SUCCESS = 'GET_MATCH_DETAILS_SUCCESS';
export const GET_MATCH_DETAILS_FAILURE = 'GET_MATCH_DETAILS_FAILURE';
export const GET_LEAGUE_RANKINGS_REQUEST = 'GET_LEAGUE_RANKINGS_REQUEST';
export const GET_LEAGUE_RANKINGS_SUCCESS = 'GET_LEAGUE_RANKINGS_SUCCESS';
export const GET_LEAGUE_RANKINGS_FAILURE = 'GET_LEAGUE_RANKINGS_FAILURE';
export const IMPORT_EVENT_RESULTS_REQUEST = 'IMPORT_EVENT_RESULTS_REQUEST';
export const IMPORT_EVENT_RESULTS_SUCCESS = 'IMPORT_EVENT_RESULTS_SUCCESS';
export const IMPORT_EVENT_RESULTS_FAILURE = 'IMPORT_EVENT_RESULTS_FAILURE';
export const REQUEST_ACCESS_REQUEST = 'REQUEST_ACCESS_REQUEST';
export const REQUEST_ACCESS_SUCCESS = 'REQUEST_ACCESS_SUCCESS';
export const REQUEST_ACCESS_FAILURE = 'REQUEST_ACCESS_FAILURE';

export const API_HOST = process.env.REACT_APP_API_HOST || '';
export const API_BASE = `${API_HOST}/api/v1`;

export const login = ({email, password}) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/auth/sign_in`,
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

export const verifyToken = () => ({
  [RSAA]: {
    endpoint: `${API_BASE}/auth/validate_token`,
    method: 'GET',
    types: [
      VERIFY_TOKEN_REQUEST,
      VERIFY_TOKEN_SUCCESS,
      VERIFY_TOKEN_FAILURE
    ]
  }
});

export const resetPassword = ({email}, target) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/auth/password`,
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formurlencoded({email, redirect_url: target}),
    types: [
      RESET_PASSWORD_REQUEST,
      RESET_PASSWORD_SUCCESS,
      RESET_PASSWORD_FAILURE
    ]
  }
});

export const setPassword = ({password, password_confirmation, current_password}) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/auth/password`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formurlencoded({password, password_confirmation, current_password}),
    types: [
      SET_PASSWORD_REQUEST,
      SET_PASSWORD_SUCCESS,
      SET_PASSWORD_FAILURE
    ]
  }
});

export const updateAccount = ({email, password, password_confirmation, current_password}) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/auth`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formurlencoded({email, password, password_confirmation, current_password}),
    types: [
      UPDATE_ACCOUNT_REQUEST,
      UPDATE_ACCOUNT_SUCCESS,
      UPDATE_ACCOUNT_FAILURE
    ]
  }
});

export const createAccount = ({email, password, password_confirmation}, target) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/auth`,
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formurlencoded({email, password, password_confirmation, confirm_success_url: target}),
    types: [
      CREATE_ACCOUNT_REQUEST,
      CREATE_ACCOUNT_SUCCESS,
      CREATE_ACCOUNT_FAILURE
    ]
  }
});

export const logout = () => ({
  [RSAA]: {
    endpoint: `${API_BASE}/auth/sign_out`,
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
    endpoint: `${API_BASE}/divisions`,
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
    endpoint: `${API_BASE}/events`,
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
    endpoint: `${API_BASE}/leagues`,
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
    endpoint: `${API_BASE}/teams`,
    method: 'GET',
    types: [
      GET_TEAMS_REQUEST,
      GET_TEAMS_SUCCESS,
      GET_TEAMS_FAILURE
    ]
  }
});

export const getTeamDetails = (id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/teams/details/${id}`,
    method: 'GET',
    types: [
      GET_TEAM_DETAILS_REQUEST,
      GET_TEAM_DETAILS_SUCCESS,
      GET_TEAM_DETAILS_FAILURE
    ]
  }
});

export const getEventMatches = (id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/matches/${id}`,
    method: 'GET',
    types: [
      GET_EVENT_MATCHES_REQUEST,
      GET_EVENT_MATCHES_SUCCESS,
      GET_EVENT_MATCHES_FAILURE
    ]
  }
});

export const getEventRankings = (id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/rankings/${id}`,
    method: 'GET',
    types: [
      GET_EVENT_RANKINGS_REQUEST,
      GET_EVENT_RANKINGS_SUCCESS,
      GET_EVENT_RANKINGS_FAILURE
    ]
  }
});

export const getEventTeams = (id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/teams/${id}`,
    method: 'GET',
    types: [
      GET_EVENT_TEAMS_REQUEST,
      GET_EVENT_TEAMS_SUCCESS,
      GET_EVENT_TEAMS_FAILURE
    ]
  }
});

export const getMatchDetails = (id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/matches/details/${id}`,
    method: 'GET',
    types: [
      GET_MATCH_DETAILS_REQUEST,
      GET_MATCH_DETAILS_SUCCESS,
      GET_MATCH_DETAILS_FAILURE
    ]
  }
});

export const getLeagueRankings = () => ({
  [RSAA]: {
    endpoint: `${API_BASE}/rankings/league`,
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
    endpoint: `${API_BASE}/events/import_results/${id}`,
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

export const requestAccess = (id, user, message) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/requestAccess/${id}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({user, message}),
    types: [
      REQUEST_ACCESS_REQUEST,
      REQUEST_ACCESS_SUCCESS,
      REQUEST_ACCESS_FAILURE
    ]
  }
});

export const scoring_download_url = (event_id) => `${API_BASE}/events/download_scoring_system/${event_id}`;
