import {SET_TITLE, SET_SEASON} from '../actions/ui';
import {GET_SEASONS_SUCCESS} from '../actions/api';
import queryString from 'query-string';


const values = queryString.parse(window.location.search);
const initialState = {season: values['season']};

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case SET_TITLE:
      return Object.assign({}, state, {title: action.title});
    case SET_SEASON:

      return Object.assign({}, state, {season: action.season});
    case GET_SEASONS_SUCCESS:
      if(!state.season) {
        return Object.assign({}, state, {defaultSeason: action.payload.find((s) => s.active).year});
      }
      return state;
    default:
      return state;
  }
}
