import {
  GET_LEAGUE_DATA_SUCCESS,
  GET_LEAGUE_RANKINGS_SUCCESS,
  GET_LEAGUES_SUCCESS
} from '../actions/api';

const initialState = null;

function newState(state, leagues) {
  const leagueMap = Object.assign({}, state, leagues.reduce(function(map, obj) {
    map[obj.id] = obj;
    return map;
  }, {}));
  Object.values(leagueMap).forEach((league) => {
    if(league.league_id) {
      leagueMap[league.id] = Object.assign({}, league, { league: leagueMap[league.league_id] });
    }
  });
  return leagueMap;
}

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_LEAGUES_SUCCESS:
      return newState(state, action.payload);
    case GET_LEAGUE_RANKINGS_SUCCESS:
    case GET_LEAGUE_DATA_SUCCESS:
      return newState(state, action.payload.leagues);
    default:
      return state;
  }
}