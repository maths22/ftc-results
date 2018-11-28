import React, {Component} from 'react';
import {connect} from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import HomeIcon from '@material-ui/icons/Home';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import Popover from '@material-ui/core/Popover';

import { logout } from '../actions/api';
import {Link} from 'react-router-dom';
import LoginForm from './LoginForm';
import {clearUserDependentState} from '../actions/util';

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  loginForm: {
    width: '15em',
    padding: '1em'
  }
};

class HeadingBar extends Component {
  state = {
    anchorEl: null,
  };

  componentWillUpdate(nextProps) {
    document.title = nextProps.title || 'FTC Results';
  }

  openLoginMenu = event => {
    this.setState({
      anchorEl: event.currentTarget,
    });
  };

  handleClose = () => {
    this.setState({
      anchorEl: null,
    });
  };

  logout = () => {
    this.props.logout().then(() => this.props.clearUserDependentState());
  };


  render () {
    const { anchorEl } = this.state;
    const { uid } = this.props;
    const open = Boolean(anchorEl);

    let isLoggedIn = false;
    if(uid && uid !== 'anon_user@example.com') {
      isLoggedIn = true;
    }

    return <div>
      <div className={this.props.classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={this.props.classes.menuButton} color="inherit" aria-label="Home"
                        to="/"
                        component={props => <Link {...props}/>}>
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" className={this.props.classes.grow}>
              {this.props.title || 'FTC Results'}
            </Typography>
            <Button color="inherit" to="/events/all"
                    component={props => <Link {...props}/>}>Events</Button>
            { isLoggedIn ? [`Welcome ${uid} `, <Button color="inherit" onClick={this.logout}>Logout</Button>]
                : <Button color="inherit" onClick={this.openLoginMenu}>Login</Button> }
          </Toolbar>
        </AppBar>
      </div>
      <Popover
          id="simple-popper"
          open={open}
          anchorEl={anchorEl}
          onClose={this.handleClose}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
      >
        <div className={this.props.classes.loginForm}>
          <LoginForm onSubmitSuccess={this.handleClose}/>
        </div>
      </Popover>
    </div>;
  }
}


const mapStateToProps = (state) => {

  const ret = {uid: null, title: state.ui.title};
  if (state.token) {
    return Object.assign(ret, {
      uid: state.token['x-uid']
    });
  }
  return ret;
};

const mapDispatchToProps = {
  clearUserDependentState,
  logout,
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(HeadingBar));