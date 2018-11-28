import React, { Component } from 'react';
import './App.css';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {Link} from 'react-router-dom';

class App extends Component {

  render() {
    return (
        <div>
          <Typography variant="h5">FTC League Rankings</Typography>
          <List component="nav">
            <ListItem  component={Link} to="/teams/rankings" button>
              <ListItemText primary="All Team Rankings" />
            </ListItem>
            <ListItem  component={Link} to="/divisions/summary" button>
              <ListItemText primary="Rankings By Division" />
            </ListItem>
          </List>
        </div>
    );
  }
}

export default App;
