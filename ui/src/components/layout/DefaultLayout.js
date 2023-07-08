import {Route} from 'react-router';
import {Component} from 'react';
import React from 'react';
import HeadingBar from './HeadingBar';
import withStyles from '@mui/styles/withStyles';
import CssBaseline from '@mui/material/CssBaseline';
import ErrorBoundary from '../ErrorBoundary';


const styles = theme => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
});

class DefaultLayout extends Component {
  render() {
    const {component: Component, classes, ...rest} = this.props; 
    return (
        <Route {...rest} render={matchProps => (<ErrorBoundary>
            <div className={classes.root}>
              <CssBaseline/>
              <HeadingBar selectedSeason={matchProps.match.params.season}/>
              <main className={classes.content}>
                <div className={classes.appBarSpacer}/>

                <ErrorBoundary>
                  <Component {...matchProps} />
                </ErrorBoundary>
              </main>
            </div>
          </ErrorBoundary>
        )} />
    );
  }
}

export default withStyles(styles)(DefaultLayout);