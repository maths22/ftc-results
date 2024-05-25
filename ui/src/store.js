import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { apiMiddleware } from 'redux-api-middleware';
import rootReducer from './reducers/rootReducer';
import authMiddleware from './middleware/authMiddleware';
import {composeWithDevTools} from 'redux-devtools-extension';


export default function configureStore() {
  return createStore(
      rootReducer(),
      composeWithDevTools(
          applyMiddleware(
            thunk,
            authMiddleware,
            apiMiddleware,
        )
      )
  );
}