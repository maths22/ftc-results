import React, { Component } from 'react';
import './App.css';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {Link} from 'react-router-dom';
import EventCards from './components/EventCards';

class App extends Component {

  stringToDate(str) {
    const parts = str.split('-');
    return new Date(parts[0],parts[1]-1,parts[2]);
  }

  render() {

    const today = new Date();
    today.setHours(0,0,0,0);
    const oneWeek = new Date(today);
    oneWeek.setDate(oneWeek.getDate() + 7);
    const twoWeeksOld = new Date(today);
    twoWeeksOld.setDate(twoWeeksOld.getDate() - 14);
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

          <Typography variant="h5" gutterBottom>This week's Events</Typography>
          <EventCards filter={(e) => {
            return this.stringToDate(e.end_date) >= today && this.stringToDate(e.start_date) < oneWeek;
          }}/>
          <Typography variant="h5" gutterBottom>Recent Events</Typography>
          <EventCards filter={(e) => {
            return this.stringToDate(e.end_date) < today;
          }} reverse limit={9}/>
        </div>
    );
  }
}

export default App;
