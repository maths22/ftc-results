import React, {StrictMode} from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import ReactGA from 'react-ga4';

import configureStore from './store';

import './index.css';
import router from './router';
import * as Sentry from '@sentry/browser';

import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import {TOKEN_UPDATE_RAW, LOCAL_STORAGE_KEY} from './reducers/tokenReducer';
import {verifyToken} from './actions/api';

import { orange, orange as blue } from '@mui/material/colors';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {RouterProvider} from '@tanstack/react-router';

const theme = createTheme({
  palette: {
    primary: import.meta.env.PROD ? orange : blue,
  },
});

// TODO pass things in here somehow
Sentry.init({
 dsn: import.meta.env.SENTRY_DSN
});
//
// if(process.env.REACT_APP_GA_KEY) {
//   ReactGA.initialize(process.env.REACT_APP_GA_KEY);
// }

const store = configureStore();

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

const queryClient = new QueryClient();

window.addEventListener('storage', onStorageUpdate, false);

const container = document.getElementById('root');
const root = createRoot(container);
root.render(
  <>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </Provider>
    </ThemeProvider>
  </>
);

