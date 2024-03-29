import {getJSON, isRSAA, RSAA} from 'redux-api-middleware';
import {API_BASE, logout, TOKEN_UPDATE} from '../actions/api';
import queryString from 'query-string';

export default store => next => action => {
  if (!isRSAA(action)) {
    return next(action);
  }

  const rawEndpoint = action[RSAA].endpoint;
  let endpoint = (typeof rawEndpoint === 'function') ? rawEndpoint(store.getState()) : rawEndpoint;
  if(!endpoint.startsWith(API_BASE)) {
    return next(action);
  }

  const metaFunc = (action, state, res) => {
    if(!res || !res.headers) {
      return {};
    }
    const headers = {};
    for (const pair of res.headers.entries()) {
      if(pair[0].toLowerCase().startsWith('x-')) {
        headers[pair[0].toLowerCase()] =  pair[1];
      }
    }
    return {headers};
  };

  const uid = store.getState().token['x-uid'];
  if(uid) {
    const parsedUrl = queryString.parseUrl(endpoint);
    parsedUrl.query['_uid'] = uid;
    endpoint = parsedUrl.url + '?' + queryString.stringify(parsedUrl.query);
  }

  const successType = action[RSAA].types[1];
  const finalAction = Object.assign({}, action, {
    [RSAA]: Object.assign({}, action[RSAA], {
      endpoint: endpoint,
      headers: Object.assign({},
        store.getState().token,
        action[RSAA].headers),
      types: [action[RSAA].types[0],
        {
          type: typeof successType === 'string' ? successType : successType.type,
          payload: typeof successType === 'string' || !successType.payload ? (action, state, res) => getJSON(res) : successType.payload,
          meta: metaFunc
        },
        {
          type: action[RSAA].types[2],
          meta: metaFunc
        }
      ]
    })
  });

  return next(finalAction).then((act) => {
    if(act.meta && act.meta.headers && act.meta.headers['x-access-token']) {
      store.dispatch({
        type: TOKEN_UPDATE,
        payload: act.meta.headers
      });
    }
    if(act.error && act.payload.status === 401 && !['LOGIN_FAILURE'].includes(act.type)) {
        const attempts = action.attempts || 0;

        if(attempts > 1) return;

        store.dispatch(logout())
            .then(() => store.dispatch(Object.assign({}, action, { attempts: attempts + 1})));
    }
    return act;
  });
};