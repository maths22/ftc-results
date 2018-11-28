import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createBrowserHistory } from 'history';

import configureStore from './store';

import './index.css';
import * as serviceWorker from './serviceWorker';
import AppRouter from './AppRouter';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import orange from '@material-ui/core/colors/orange';

const theme = createMuiTheme({
  palette: {
    primary: orange,
  },
});


//TODO THEME
window.__MUI_USE_NEXT_TYPOGRAPHY_VARIANTS__ = true;

const history = createBrowserHistory();
const store = configureStore(history);

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
