import {Route} from 'react-router';
import {Component} from 'react';
import React from 'react';
import HeadingBar from './HeadingBar';
import {withStyles} from '@material-ui/core';
import CssBaseline from '@material-ui/core/CssBaseline';


const styles = theme => ({
  content: {
    flexGrow: 1,
    padding: theme.spacing.unit * 3,
  },
});

class DefaultLayout extends Component {
  render() {
    const {component: Component, classes, ...rest} = this.props; 
    return (
        <Route {...rest} render={matchProps => (
            <div className={classes.root}>
              <CssBaseline />
              <HeadingBar/>
              <main className={classes.content}>
                <div className={classes.appBarSpacer} />
                <Component {...matchProps} />
              </main>
            </div>
        )} />
    );
  }
}

export default withStyles(styles)(DefaultLayout);