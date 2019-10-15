import React, {Component} from 'react';
import {connect} from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import {getDivisions, getLeagues, getSeasons} from '../actions/api';
import {Link} from 'react-router-dom';
import {setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import {withStyles} from '@material-ui/core';
import SeasonSelector from './SeasonSelector';

const styles = (theme) => ({
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: '30em',
  },
});

class DivisionsSummary extends Component {

  componentDidMount() {
    if(!this.props.divisions) {
      this.props.getSeasons();
      this.props.getDivisions();
      this.props.getLeagues();
    }
    this.props.setTitle('Leagues / Divisions');
  }

  componentWillUnmount() {
    this.props.setTitle(null);
  }


  render () {
    if(!this.props.divisions) {
      return <LoadingSpinner/>;
    }
    const vals = [...this.props.divisions].sort((a, b) => {
      const diff = a.league.name.localeCompare(b.league.name);
      if(diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    } );

    const rowStyle = { height: '2rem' };

    return <>
      <SeasonSelector/>
      <div className={this.props.classes.root}>
        <Table className={this.props.classes.table}>
          <TableHead>
            <TableRow style={rowStyle}>
              <TableCell>League</TableCell>
              <TableCell>Division</TableCell>
              <TableCell>Number of Teams</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vals.map(val => {
              return (
                  <TableRow key={val.id} style={rowStyle}>
                    <TableCell component={Link} to={`/leagues/rankings/${val.league.id}`}>{val.league.name}</TableCell>
                    <TableCell component={Link} to={`/divisions/rankings/${val.id}`}>{val.name}</TableCell>
                    <TableCell>{val.team_count}</TableCell>
                  </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </>;
  }
}




const mapStateToProps = (state) => {
  if (state.divisions && state.leagues && state.seasons) {
    return {
      divisions: Object.values(state.divisions).filter((div) => state.leagues && state.leagues[div.league_id].season_id === state.seasons.find((s) => s.year === (state.ui.season || state.ui.defaultSeason)).id)
        .map((div) => Object.assign({}, div, { league: state.leagues[div.league_id] }))
    };
  }
  return {
    divisions: null
  };
};

const mapDispatchToProps = {
  getDivisions,
  getLeagues,
  getSeasons,
  setTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DivisionsSummary));