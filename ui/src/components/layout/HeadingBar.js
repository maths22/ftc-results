import React, {Component} from 'react';
import {connect} from 'react-redux';

import withStyles from '@mui/styles/withStyles';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import { logout } from '../../actions/api';
import {Link} from 'react-router-dom';
import LoginForm from '../users/LoginForm';
import {clearUserDependentState} from '../../actions/util';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import { push } from 'connected-react-router';
import RegisterForm from '../users/RegisterForm';

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
    width: '18em',
    padding: '1em'
  },
  tab: {
    minWidth: 0
  }
};

class HeadingBar extends Component {
  state = {
    anchorEl: null,
    selectedTab: 'login'
  };

  componentDidUpdate() {
    document.title = this.props.title || 'FTC Results';
  }

  openUserMenu = event => {
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

  selectTab = (_, selectedTab) => {
    this.setState({ selectedTab });
  };


  render () {
    const { anchorEl } = this.state;
    const { uid, user } = this.props;
    const open = Boolean(anchorEl);

    let isLoggedIn = false;
    if(uid && uid !== 'anon_user@example.com') {
      isLoggedIn = true;
    }

    return (
      <div>
        <div className={this.props.classes.root}>
          <AppBar position="static">
            <Toolbar>
              <IconButton
                className={this.props.classes.menuButton}
                color="inherit"
                aria-label="Home"
                to={this.props.selectedSeason ? `/${this.props.selectedSeason}` : '/'}
                component={Link}
                size="large">
                <HomeIcon />
              </IconButton>
              <Typography variant="h6" color="inherit" className={this.props.classes.grow}>
                {this.props.title || 'FTC Results'}
              </Typography>
              <Button color="inherit" onClick={this.openUserMenu}>{ isLoggedIn ? `Welcome ${user ? user.name : uid}` : 'Login'}</Button>
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
          { isLoggedIn ?
              <Paper>
                {/*<ClickAwayListener onClickAway={this.handleClose}>*/}
                  <MenuList>
                    {/*<MenuItem onClick={this.handleClose}>Profile</MenuItem>*/}
                    <MenuItem onClick={() => {this.props.push('/account'); this.handleClose();}}>My Account</MenuItem>
                    <MenuItem onClick={() => {this.logout(); this.handleClose();}}>Logout</MenuItem>
                  </MenuList>
                {/*</ClickAwayListener>*/}
              </Paper>
              : <div className={this.props.classes.loginForm}>
                <Tabs
                    value={this.state.selectedTab}
                    onChange={this.selectTab}
                    indicatorColor="primary"
                    textColor="primary"
                    fullWidth
                >
                  <Tab classes={{root: this.props.classes.tab}} value="login" label="Login" />
                  <Tab classes={{root: this.props.classes.tab}} value="register" label="Register" />
                </Tabs>
              {this.state.selectedTab === 'login' ? <LoginForm onSubmitSuccess={this.handleClose}/> : null}
              {this.state.selectedTab === 'register' ? <RegisterForm onSubmitSuccess={this.handleClose}/> : null}


          </div> }
        </Popover>
      </div>
    );
  }
}


const mapStateToProps = (state) => {

  const ret = {
    uid: null, title: state.ui.title
  };
  if (state.token) {
    ret.uid = state.token['x-uid'];
    if(state.users) {
      ret.user = state.users[state.token['x-uid']];
    }
  }
  return ret;
};

const mapDispatchToProps = {
  clearUserDependentState,
  logout,
  push,
};


export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(HeadingBar));