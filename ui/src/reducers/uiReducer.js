import {SET_TITLE, SET_SEASON, HIDE_VIDEO, SHOW_ONLY_MY_EVENTS} from '../actions/ui';
import {GET_SEASONS_SUCCESS} from '../actions/api';
import queryString from 'query-string';

export const LOCAL_STORAGE_VIDEO_KEY = 'hide_video';
export const SHOW_ONLY_MY_EVENTS_KEY = 'show_only_my_events';
const hideVideo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_VIDEO_KEY)) || false;
const showOnlyMyEvents = JSON.parse(localStorage.getItem(SHOW_ONLY_MY_EVENTS_KEY)) || false;
const values = queryString.parse(window.location.search);
const initialState = {season: values['season'], hideVideo, showOnlyMyEvents};

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case SET_TITLE:
      return Object.assign({}, state, {title: action.title});
    case GET_SEASONS_SUCCESS:
      if(!state.season) {
        return Object.assign({}, state, {defaultSeason: action.payload.find((s) => s.active).year});
      }
      return state;
    case HIDE_VIDEO:
      localStorage.setItem(LOCAL_STORAGE_VIDEO_KEY, JSON.stringify(action.hidden));
      return Object.assign({}, state, {hideVideo: action.hidden});
    case SHOW_ONLY_MY_EVENTS:
      localStorage.setItem(SHOW_ONLY_MY_EVENTS_KEY, JSON.stringify(action.state));
      return Object.assign({}, state, {showOnlyMyEvents: action.state});
    default:
      return state;
  }
}
