import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {Link} from 'react-router-dom';
import EventCards from './components/EventCards';
import SeasonSelector from './components/SeasonSelector';
import * as queryString from 'query-string';
import {connect} from 'react-redux';
import Button from '@material-ui/core/Button';

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
          <SeasonSelector/>

          {this.props.season && this.props.season.offseason ? null :
            <div style={{padding: '1em 0'}}>
              <Typography variant={'h5'}>League results</Typography>
              <List component="nav">
                <ListItem  component={Link} to={`/teams/rankings?${queryString.stringify({season: this.props.selectedSeason})}`} button>
                  <ListItemText primary="All Team Rankings" />
                </ListItem>
                <ListItem  component={Link} to={`/divisions/summary?${queryString.stringify({season: this.props.selectedSeason})}`} button>
                  <ListItemText primary="Rankings By Division" />
                </ListItem>
              </List>
            </div>
          }


          <EventCards heading="This week's Events" filter={(e) => {
            return this.stringToDate(e.end_date) >= today && this.stringToDate(e.start_date) < oneWeek;
          }}/>

          { this.props.season && this.props.season.offseason ? <EventCards heading="Upcoming Events" filter={(e) => {
            return this.stringToDate(e.start_date) >=  oneWeek;
          }} limit={9} /> : null}

          <EventCards heading="Recent Events" filter={(e) => {
            return this.stringToDate(e.end_date) < today;
          }} reverse limit={9} showNone />

          <div style={{padding: '1em 0'}}>
            <Button variant="contained" to={`/events/all?${queryString.stringify({season: this.props.selectedSeason})}`} component={Link}>
              See All Events
            </Button>
          </div>
        </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    selectedSeason: state.ui.season,
    season: state.seasons ? state.seasons.find((s) => s.year === (state.ui.season || state.ui.defaultSeason)) : null
  };
};


export default connect(mapStateToProps)(App);
