import RSAA from 'redux-api-middleware/es/RSAA';
import {API_BASE} from './api';

export const POST_RANKINGS_REQUEST = 'POST_RANKINGS_REQUEST';
export const POST_RANKINGS_SUCCESS = 'POST_RANKINGS_SUCCESS';
export const POST_RANKINGS_FAILURE = 'POST_RANKINGS_FAILURE';
export const POST_TEAMS_REQUEST = 'POST_TEAMS_REQUEST';
export const POST_TEAMS_SUCCESS = 'POST_TEAMS_SUCCESS';
export const POST_TEAMS_FAILURE = 'POST_TEAMS_FAILURE';
export const POST_ALLIANCES_REQUEST = 'POST_ALLIANCES_REQUEST';
export const POST_ALLIANCES_SUCCESS = 'POST_ALLIANCES_SUCCESS';
export const POST_ALLIANCES_FAILURE = 'POST_ALLIANCES_FAILURE';
export const POST_MATCHES_REQUEST = 'POST_MATCHES_REQUEST';
export const POST_MATCHES_SUCCESS = 'POST_MATCHES_SUCCESS';
export const POST_MATCHES_FAILURE = 'POST_MATCHES_FAILURE';
export const POST_MATCH_REQUEST = 'POST_MATCH_REQUEST';
export const POST_MATCH_SUCCESS = 'POST_MATCH_SUCCESS';
export const POST_MATCH_FAILURE = 'POST_MATCH_FAILURE';


export const postRankings = (event, rankings) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/rankings/${event}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({rankings}),
    types: [
      POST_RANKINGS_REQUEST,
      POST_RANKINGS_SUCCESS,
      POST_RANKINGS_FAILURE
    ]
  }
});

export const postTeams = (event, teams) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/teams/${event}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({teams}),
    types: [
      POST_TEAMS_REQUEST,
      POST_TEAMS_SUCCESS,
      POST_TEAMS_FAILURE
    ]
  }
});

export const postAlliances = (event, alliances) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/alliances/${event}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({alliances}),
    types: [
      POST_ALLIANCES_REQUEST,
      POST_ALLIANCES_SUCCESS,
      POST_ALLIANCES_FAILURE
    ]
  }
});

export const postMatches = (event, matches) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/matches/${event}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({matches}),
    types: [
      POST_MATCHES_REQUEST,
      POST_MATCHES_SUCCESS,
      POST_MATCHES_FAILURE
    ]
  }
});

export const postMatch = (event, id, match) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/matches/${event}/${id}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify(match),
    types: [
      POST_MATCH_REQUEST,
      POST_MATCH_SUCCESS,
      POST_MATCH_FAILURE
    ]
  }
});