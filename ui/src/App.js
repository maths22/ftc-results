import React, { Component } from 'react';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import {Link} from 'react-router-dom';
import { push } from 'connected-react-router';
import EventCards from './components/EventCards';
import SeasonSelector from './components/SeasonSelector';
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
          <SeasonSelector onChange={v => this.props.push(`/${v}`)} selectedSeason={this.props.selectedSeason} />

          {this.props.season && this.props.season.offseason ? null :
            <div style={{padding: '1em 0'}}>
              <Typography variant={'h5'}>League results</Typography>
              <List component="nav">
                <ListItem  component={Link} to={`/${this.props.selectedSeason}/teams/rankings`} button>
                  <ListItemText primary="All Team Rankings" />
                </ListItem>
                <ListItem  component={Link} to={`/${this.props.selectedSeason}/leagues/summary`} button>
                  <ListItemText primary="Rankings By League" />
                </ListItem>
              </List>
            </div>
          }


          <EventCards heading="This week's Events" selectedSeason={this.props.selectedSeason} filter={(e) => {
            return this.stringToDate(e.end_date) >= today && this.stringToDate(e.start_date) < oneWeek;
          }}/>

          { this.props.season && this.props.season.offseason ? <EventCards heading="Upcoming Events" selectedSeason={this.props.selectedSeason} filter={(e) => {
            return this.stringToDate(e.start_date) >= oneWeek;
          }} limit={9} /> : null}

          <EventCards heading="Recent Events" selectedSeason={this.props.selectedSeason} filter={(e) => {
            return this.stringToDate(e.end_date) < today;
          }} reverse limit={9} showNone />

          <div style={{padding: '1em 0'}}>
            <Button variant="contained" to={`/${this.props.selectedSeason}/events/all`} component={Link}>
              See All Events
            </Button>
          </div>
        </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  return {
    selectedSeason: props.selectedSeason || state.ui.defaultSeason,
    season: state.seasons ? state.seasons.find((s) => s.year === (props.selectedSeason || state.ui.defaultSeason)) : null
  };
};


export default connect(mapStateToProps, {push})(App);
