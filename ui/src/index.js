import './polyfill';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import ReactGA from 'react-ga4';

import configureStore from './store';

import './index.css';
import * as serviceWorker from './serviceWorker';
import AppRouter from './AppRouter';
import * as Sentry from '@sentry/browser';

import { ThemeProvider, StyledEngineProvider, createTheme, adaptV4Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {TOKEN_UPDATE_RAW, LOCAL_STORAGE_KEY} from './reducers/tokenReducer';
import {verifyToken} from './actions/api';

import { orange, orange as blue } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: process.env.NODE_ENV !== 'development' ? orange : blue,
  },
});

Sentry.init({
 dsn: process.env.REACT_APP_SENTRY_DSN
});

if(process.env.REACT_APP_GA_KEY) {
  ReactGA.initialize(process.env.REACT_APP_GA_KEY);
}

const history = createBrowserHistory();
const store = configureStore(history);

const onStorageUpdate = (e) => {
  if(e.key === LOCAL_STORAGE_KEY) {
    store.dispatch({
      type: TOKEN_UPDATE_RAW,
      payload: JSON.parse(e.newValue)
    });
  }
};

if(store.getState()['token']['x-uid']) {
  store.dispatch(verifyToken());
}

window.addEventListener('storage', onStorageUpdate, false);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
    <CssBaseline>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <Provider store={store}>
            <AppRouter history={history}/>
          </Provider>
        </ThemeProvider>
      </StyledEngineProvider>
    </CssBaseline>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
