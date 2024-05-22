import {Route} from 'react-router';
import {Component} from 'react';
import React from 'react';
import HeadingBar from './HeadingBar';
import CssBaseline from '@mui/material/CssBaseline';
import ErrorBoundary from '../ErrorBoundary';
import {styled} from '@mui/material/styles';

const Main = styled('main')(({theme}) => ({
  flexGrow: 1,
  padding: theme.spacing(3)
}));

export default class DefaultLayout extends Component {
  render() {
    const {component: Component, ...rest} = this.props;
    return (
        <Route {...rest} render={matchProps => (<ErrorBoundary>
            <div>
              <CssBaseline/>
              <HeadingBar selectedSeason={matchProps.match.params.season}/>
              <Main>
                <ErrorBoundary>
                  <Component {...matchProps} />
                </ErrorBoundary>
              </Main>
            </div>
          </ErrorBoundary>
        )} />
    );
  }
}
