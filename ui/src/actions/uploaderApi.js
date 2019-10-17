import RSAA from 'redux-api-middleware/es/RSAA';
import {API_BASE} from './api';

export const POST_REQUEST = 'POST_REQUEST';
export const POST_SUCCESS = 'POST_SUCCESS';
export const POST_FAILURE = 'POST_FAILURE';
export const POST_RESET_REQUEST = 'POST_RESET_REQUEST';
export const POST_RESET_SUCCESS = 'POST_RESET_SUCCESS';
export const POST_RESET_FAILURE = 'POST_RESET_FAILURE';
export const POST_TWITCH_REQUEST = 'POST_TWITCH_REQUEST';
export const POST_TWITCH_SUCCESS = 'POST_TWITCH_SUCCESS';
export const POST_TWITCH_FAILURE = 'POST_TWITCH_FAILURE';

export const postRequest = (request) => ({
  [RSAA]: Object.assign({
    types: [
      POST_REQUEST,
      POST_SUCCESS,
      POST_FAILURE
    ]
  }, request)
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