import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';
import ReactGA from 'react-ga';

import configureStore from './store';

import './index.css';
import * as serviceWorker from './serviceWorker';
import AppRouter from './AppRouter';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import orange from '@material-ui/core/colors/orange';
import {TOKEN_UPDATE_RAW, LOCAL_STORAGE_KEY} from './reducers/tokenReducer';

const theme = createMuiTheme({
  palette: {
    primary: orange,
  },
});


ReactGA.initialize('UA-88371688-1');

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

window.addEventListener('storage', onStorageUpdate, false);

ReactDOM.render(
    <MuiThemeProvider theme={theme}>
      <Provider store={store}>
        <AppRouter history={history}/>
      </Provider>
    </MuiThemeProvider>,
    document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: http://bit.ly/CRA-PWA
serviceWorker.unregister();
