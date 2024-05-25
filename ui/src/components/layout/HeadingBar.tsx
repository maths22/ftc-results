import {useState} from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

import {Link, useRouter} from '@tanstack/react-router';
import LoginForm from '../users/LoginForm';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import RegisterForm from '../users/RegisterForm';
import {useStore} from "@tanstack/react-store";
import {authorizationStore, logout} from "../../api";

export default function HeadingBar({selectedSeason, title}: {
  selectedSeason?: string,
  title: string,
}) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedTab, setSelectedTab] = useState<'login' | 'register'>('login');

  const router = useRouter();
  const user = useStore(authorizationStore, val => ({
      uid: val['uid'],
      name: val['name']
  }));

  const open = Boolean(anchorEl);

  let isLoggedIn = false;
  if(user.uid && user.uid !== 'anon_user@example.com') {
    isLoggedIn = true;
  }

  return (
    <div>
      <div style={{flexGrow: 1}}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              sx={{marginLeft: -1.5, marginRight: 2}}
              color="inherit"
              aria-label="Home"
              to={selectedSeason ? `/${selectedSeason}` : '/'}
              component={Link}
              size="large">
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" sx={{flexGrow: 1}}>
              {title}
            </Typography>
            <Button color="inherit" onClick={(e) => setAnchorEl(e.target as HTMLButtonElement)}>{ isLoggedIn ? `Welcome ${user.name || user.uid}` : 'Login'}</Button>
          </Toolbar>
        </AppBar>
      </div>
      <Popover
          id="simple-popper"
          open={open}
          anchorEl={anchorEl}
          onClose={() => setAnchorEl(null)}
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
                <MenuList>
                  <MenuItem onClick={() => {router.navigate({ to: '/account'}); setAnchorEl(null);}}>My Account</MenuItem>
                  <MenuItem onClick={() => {logout(); setAnchorEl(null);}}>Logout</MenuItem>
                </MenuList>
            </Paper>
            : <div style={{width: '18em', padding: '1em'}}>
              <Tabs
                  value={selectedTab}
                  onChange={(_, value) => setSelectedTab(value)}
                  indicatorColor="primary"
                  textColor="primary"
              >
                <Tab sx={{minWidth: 0}} value="login" label="Login" />
                <Tab sx={{minWidth: 0}} value="register" label="Register" />
              </Tabs>
            {selectedTab === 'login' ? <LoginForm onSubmitSuccess={() => setAnchorEl(null)}/> : null}
            {selectedTab === 'register' ? <RegisterForm onSubmitSuccess={() => setAnchorEl(null)}/> : null}
        </div> }
      </Popover>
    </div>
  );
}
