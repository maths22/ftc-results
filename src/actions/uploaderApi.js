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
export const POST_AWARDS_REQUEST = 'POST_AWARDS_REQUEST';
export const POST_AWARDS_SUCCESS = 'POST_AWARDS_SUCCESS';
export const POST_AWARDS_FAILURE = 'POST_AWARDS_FAILURE';
export const POST_RESET_REQUEST = 'POST_RESET_REQUEST';
export const POST_RESET_SUCCESS = 'POST_RESET_SUCCESS';
export const POST_RESET_FAILURE = 'POST_RESET_FAILURE';
export const POST_TWITCH_REQUEST = 'POST_TWITCH_REQUEST';
export const POST_TWITCH_SUCCESS = 'POST_TWITCH_SUCCESS';
export const POST_TWITCH_FAILURE = 'POST_TWITCH_FAILURE';


export const postRankings = (event, division, rankings) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/rankings/${event}?division=${division}`,
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

export const postTeams = (event, division, teams) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/teams/${event}?division=${division}`,
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

export const postAlliances = (event, division, alliances) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/alliances/${event}?division=${division}`,
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

export const postMatches = (event, division, matches) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/matches/${event}?division=${division}`,
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

export const postMatch = (event, division, id, match) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/matches/${event}/${id}?division=${division}`,
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

export const postAwards = (event, awards) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/awards/${event}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({awards}),
    types: [
      POST_AWARDS_REQUEST,
      POST_AWARDS_SUCCESS,
      POST_AWARDS_FAILURE
    ]
  }
});

export const resetEvent = (event) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/reset/${event}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({}),
    types: [
      POST_RESET_REQUEST,
      POST_RESET_SUCCESS,
      POST_RESET_FAILURE
    ]
  }
});

export const setupTwitch = (event) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/twitch/${event}`,
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({}),
    types: [
      POST_TWITCH_REQUEST,
      POST_TWITCH_SUCCESS,
      POST_TWITCH_FAILURE
    ]
  }
});

export const removeTwitch = (event) => ({
  [RSAA]: {
    endpoint: `${API_BASE}/events/twitch/${event}`,
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({}),
    types: [
      POST_TWITCH_REQUEST,
      POST_TWITCH_SUCCESS,
      POST_TWITCH_FAILURE
    ]
  }
});