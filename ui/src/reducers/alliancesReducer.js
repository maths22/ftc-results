import {GET_EVENT_ALLIANCES_SUCCESS} from '../actions/api';

const initialState = {};

export default function (
    state = initialState,
    action
) {
  switch (action.type) {
    case GET_EVENT_ALLIANCES_SUCCESS:
      let oldVals = Object.values(state);
      if(action.payload.alliances.length > 0) {
        const remove = action.payload.alliances[0].event_id;
        oldVals = oldVals.filter((v) => v.event_id !== remove);
      }

      return oldVals.concat(action.payload.alliances).reduce(function(map, obj) {
        map[obj.id] = obj;
        return map;
      }, {});
    default:
      return state;
  }
}