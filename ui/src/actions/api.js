import { RSAA } from 'redux-api-middleware';
import formurlencoded from 'form-urlencoded';
import * as queryString from 'query-string';

export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';
export const VERIFY_TOKEN_REQUEST = 'VERIFY_TOKEN_REQUEST';
export const VERIFY_TOKEN_SUCCESS = 'VERIFY_TOKEN_SUCCESS';
export const VERIFY_TOKEN_FAILURE = 'VERIFY_TOKEN_FAILURE';
export const SET_PASSWORD_REQUEST = 'SET_PASSWORD_REQUEST';
export const SET_PASSWORD_SUCCESS = 'SET_PASSWORD_SUCCESS';
export const SET_PASSWORD_FAILURE = 'SET_PASSWORD_FAILURE';
export const ACTIVATE_ACCOUNT_REQUEST = 'ACTIVATE_ACCOUNT_REQUEST';
export const ACTIVATE_ACCOUNT_SUCCESS = 'ACTIVATE_ACCOUNT_SUCCESS';
export const ACTIVATE_ACCOUNT_FAILURE = 'ACTIVATE_ACCOUNT_FAILURE';
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
export const SEARCH_USERS_REQUEST = 'SEARCH_USERS_REQUEST';
export const SEARCH_USERS_SUCCESS = 'SEARCH_USERS_SUCCESS';
export const SEARCH_USERS_FAILURE = 'SEARCH_USERS_FAILURE';
export const GET_USERS_REQUEST = 'GET_USERS_REQUEST';
export const GET_USERS_SUCCESS = 'GET_USERS_SUCCESS';
export const GET_USERS_FAILURE = 'GET_USERS_FAILURE';
export const GET_SEASONS_REQUEST = 'GET_SEASONS_REQUEST';
export const GET_SEASONS_SUCCESS = 'GET_SEASONS_SUCCESS';
export const GET_SEASONS_FAILURE = 'GET_SEASONS_FAILURE';
export const GET_LEAGUE_DATA_REQUEST = 'GET_LEAGUE_DATA_REQUEST';
export const GET_LEAGUE_DATA_SUCCESS = 'GET_LEAGUE_DATA_SUCCESS';
export const GET_LEAGUE_DATA_FAILURE = 'GET_LEAGUE_DATA_FAILURE';
export const GET_EVENTS_REQUEST = 'GET_EVENTS_REQUEST';
export const GET_EVENTS_SUCCESS = 'GET_EVENTS_SUCCESS';
export const GET_EVENTS_FAILURE = 'GET_EVENTS_FAILURE';
export const GET_EVENT_REQUEST = 'GET_EVENT_REQUEST';
export const GET_EVENT_SUCCESS = 'GET_EVENT_SUCCESS';
export const GET_EVENT_FAILURE = 'GET_EVENT_FAILURE';
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
export const GET_EVENT_ALLIANCES_REQUEST = 'GET_EVENT_ALLIANCES_REQUEST';
export const GET_EVENT_ALLIANCES_SUCCESS = 'GET_EVENT_ALLIANCES_SUCCESS';
export const GET_EVENT_ALLIANCES_FAILURE = 'GET_EVENT_ALLIANCES_FAILURE';
export const GET_EVENT_TEAMS_REQUEST = 'GET_EVENT_TEAMS_REQUEST';
export const GET_EVENT_TEAMS_SUCCESS = 'GET_EVENT_TEAMS_SUCCESS';
export const GET_EVENT_TEAMS_FAILURE = 'GET_EVENT_TEAMS_FAILURE';
export const GET_EVENT_RANKINGS_REQUEST = 'GET_EVENT_RANKINGS_REQUEST';
export const GET_EVENT_RANKINGS_SUCCESS = 'GET_EVENT_RANKINGS_SUCCESS';
export const GET_EVENT_RANKINGS_FAILURE = 'GET_EVENT_RANKINGS_FAILURE';
export const GET_AWARDS_REQUEST = 'GET_AWARDS_REQUEST';
export const GET_AWARDS_SUCCESS = 'GET_AWARDS_SUCCESS';
export const GET_AWARDS_FAILURE = 'GET_AWARDS_FAILURE';
export const GET_MATCH_DETAILS_REQUEST = 'GET_MATCH_DETAILS_REQUEST';
export const GET_MATCH_DETAILS_SUCCESS = 'GET_MATCH_DETAILS_SUCCESS';
export const GET_MATCH_DETAILS_FAILURE = 'GET_MATCH_DETAILS_FAILURE';
export const GET_LEAGUE_RANKINGS_REQUEST = 'GET_LEAGUE_RANKINGS_REQUEST';
export const GET_LEAGUE_RANKINGS_SUCCESS = 'GET_LEAGUE_RANKINGS_SUCCESS';
export const GET_LEAGUE_RANKINGS_FAILURE = 'GET_LEAGUE_RANKINGS_FAILURE';
export const SCORING_URL_REQUEST = 'SCORING_URL_REQUEST';
export const SCORING_URL_SUCCESS = 'SCORING_URL_SUCCESS';
export const SCORING_URL_FAILURE = 'SCORING_URL_FAILURE';
export const IMPORT_EVENT_RESULTS_REQUEST = 'IMPORT_EVENT_RESULTS_REQUEST';
export const IMPORT_EVENT_RESULTS_SUCCESS = 'IMPORT_EVENT_RESULTS_SUCCESS';
export const IMPORT_EVENT_RESULTS_FAILURE = 'IMPORT_EVENT_RESULTS_FAILURE';
export const REQUEST_ACCESS_REQUEST = 'REQUEST_ACCESS_REQUEST';
export const REQUEST_ACCESS_SUCCESS = 'REQUEST_ACCESS_SUCCESS';
export const REQUEST_ACCESS_FAILURE = 'REQUEST_ACCESS_FAILURE';
export const ADD_OWNER_REQUEST = 'ADD_OWNER_REQUEST';
export const ADD_OWNER_SUCCESS = 'ADD_OWNER_SUCCESS';
export const ADD_OWNER_FAILURE = 'ADD_OWNER_FAILURE';
export const REMOVE_OWNER_REQUEST = 'REMOVE_OWNER_REQUEST';
export const REMOVE_OWNER_SUCCESS = 'REMOVE_OWNER_SUCCESS';
export const REMOVE_OWNER_FAILURE = 'REMOVE_OWNER_FAILURE';

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

export const setPassword = ({password, password_confirmation, reset_password_token}) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/auth/password`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formurlencoded({password, password_confirmation, reset_password_token}),
    types: [
      SET_PASSWORD_REQUEST,
      SET_PASSWORD_SUCCESS,
      SET_PASSWORD_FAILURE
    ]
  }
});

export const activateAccount = ({name, password, password_confirmation, invitation_token}) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/auth/invitation`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formurlencoded({name, password, password_confirmation, invitation_token}),
    types: [
      ACTIVATE_ACCOUNT_REQUEST,
      ACTIVATE_ACCOUNT_SUCCESS,
      ACTIVATE_ACCOUNT_FAILURE
    ]
  }
});

export const updateAccount = ({name, email, password, password_confirmation, current_password}) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/auth`,
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formurlencoded({name, email, password, password_confirmation, current_password}),
    types: [
      UPDATE_ACCOUNT_REQUEST,
      UPDATE_ACCOUNT_SUCCESS,
      UPDATE_ACCOUNT_FAILURE
    ]
  }
});

export const createAccount = ({email, name, password, password_confirmation}, target) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/auth`,
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formurlencoded({email, name, password, password_confirmation, confirm_success_url: target}),
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

export const getUsers = (uids) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/users?${queryString.stringify({uids}, {arrayFormat: 'bracket'})}`,
    method: 'GET',
    types: [
      GET_USERS_REQUEST,
      GET_USERS_SUCCESS,
      GET_USERS_FAILURE
    ]
  }
});

export const searchUsers = (query) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/users/search?${queryString.stringify({query})}`,
    method: 'GET',
    types: [
      SEARCH_USERS_REQUEST,
      SEARCH_USERS_SUCCESS,
      SEARCH_USERS_FAILURE
    ]
  }
});

export const getSeasons = () => ({
  [RSAA]: {
    endpoint: `${API_BASE}/seasons`,
    method: 'GET',
    types: [
      GET_SEASONS_REQUEST,
      GET_SEASONS_SUCCESS,
      GET_SEASONS_FAILURE
    ]
  }
});

export const getEvents = (season) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/${season}/events`,
    method: 'GET',
    types: [
      GET_EVENTS_REQUEST,
      GET_EVENTS_SUCCESS,
      GET_EVENTS_FAILURE
    ]
  }
});

export const getEvent = (season, id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/${season}/events/${id}`,
    method: 'GET',
    types: [
      GET_EVENT_REQUEST,
      GET_EVENT_SUCCESS,
      GET_EVENT_FAILURE
    ]
  }
});

export const getLeagues = (season) => ({
  [RSAA]: {
    endpoint: season ? `${API_BASE}/${season}/leagues` : `${API_BASE}/leagues`,
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
    endpoint: `${API_BASE}/teams/${id}/details`,
    method: 'GET',
    types: [
      GET_TEAM_DETAILS_REQUEST,
      GET_TEAM_DETAILS_SUCCESS,
      GET_TEAM_DETAILS_FAILURE
    ]
  }
});

export const getEventMatches = (season, id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/${season}/events/${id}/matches`,
    method: 'GET',
    types: [
      GET_EVENT_MATCHES_REQUEST,
      GET_EVENT_MATCHES_SUCCESS,
      GET_EVENT_MATCHES_FAILURE
    ]
  }
});

export const getEventRankings = (season, id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/${season}/events/${id}/rankings`,
    method: 'GET',
    types: [
      GET_EVENT_RANKINGS_REQUEST,
      GET_EVENT_RANKINGS_SUCCESS,
      GET_EVENT_RANKINGS_FAILURE
    ]
  }
});

export const getEventAwards = (season, id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/${season}/events/${id}/awards`,
    method: 'GET',
    types: [
      GET_AWARDS_REQUEST,
      GET_AWARDS_SUCCESS,
      GET_AWARDS_FAILURE
    ]
  }
});

export const getEventTeams = (season, id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/${season}/events/${id}/teams`,
    method: 'GET',
    types: [
      GET_EVENT_TEAMS_REQUEST,
      GET_EVENT_TEAMS_SUCCESS,
      GET_EVENT_TEAMS_FAILURE
    ]
  }
});

export const getEventAlliances = (season, id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/${season}/events/${id}/alliances`,
    method: 'GET',
    types: [
      GET_EVENT_ALLIANCES_REQUEST,
      GET_EVENT_ALLIANCES_SUCCESS,
      GET_EVENT_ALLIANCES_FAILURE
    ]
  }
});

export const getMatchDetails = (id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/matches/${id}/details`,
    method: 'GET',
    types: [
      GET_MATCH_DETAILS_REQUEST,
      GET_MATCH_DETAILS_SUCCESS,
      GET_MATCH_DETAILS_FAILURE
    ]
  }
});

export const getLeagueRankings = (season) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/${season}/rankings/league`,
    method: 'GET',
    types: [
      GET_LEAGUE_RANKINGS_REQUEST,
      GET_LEAGUE_RANKINGS_SUCCESS,
      GET_LEAGUE_RANKINGS_FAILURE
    ]
  }
});

export const getLeagueData = (season, id) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/${season}/rankings/league/${id}`,
    method: 'GET',
    types: [
      GET_LEAGUE_DATA_REQUEST,
      GET_LEAGUE_DATA_SUCCESS,
      GET_LEAGUE_DATA_FAILURE
    ]
  }
});

export const getScoringDownloadUrl = (id, test)  => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/${id}/download_scoring_system_url?test=${test}`,
    method: 'GET',
    types: [
      SCORING_URL_REQUEST,
      SCORING_URL_SUCCESS,
      SCORING_URL_FAILURE
    ]
  }
});

export const importEventResults = (id, file, division) => {
  const formData = new FormData();
  formData.append("import", file);
  return {
    [RSAA]: {
      endpoint: `${API_BASE}/events/${id}/import_results?division=${division}`,
      method: 'POST',
      body: formData,
      types: [
        IMPORT_EVENT_RESULTS_REQUEST,
        IMPORT_EVENT_RESULTS_SUCCESS,
        IMPORT_EVENT_RESULTS_FAILURE
      ]
    }
  }
};

export const requestAccess = (id, user, message) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/${id}/request_access`,
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

export const addOwner = (id, uid) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/${id}/add_owner`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({uid}),
    types: [
      ADD_OWNER_REQUEST,
      ADD_OWNER_SUCCESS,
      ADD_OWNER_FAILURE
    ]
  }
});

export const removeOwner = (id, uid) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/${id}/remove_owner`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({uid}),
    types: [
      REMOVE_OWNER_REQUEST,
      REMOVE_OWNER_SUCCESS,
      REMOVE_OWNER_FAILURE
    ]
  }
});
