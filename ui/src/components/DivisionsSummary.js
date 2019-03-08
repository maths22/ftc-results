import React, {Component} from 'react';
import {connect} from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import {getDivisions, getLeagues} from '../actions/api';
import {Link} from 'react-router-dom';
import {setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import {withStyles} from '@material-ui/core';

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing.unit,
    overflowX: 'auto',
  },
  table: {
    minWidth: '30em',
  },
});

class DivisionsSummary extends Component {

  componentDidMount() {
    if(!this.props.divisions) {
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

    return <Paper className={this.props.classes.root}>
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
    </Paper>;
  }
}




const mapStateToProps = (state) => {
  if (state.divisions && state.leagues) {
    return {
      divisions: Object.values(state.divisions).map((div) => Object.assign({}, div, { league: state.leagues[div.league_id] }))
    };
  }
  return {
    divisions: null
  };
};

const mapDispatchToProps = {
  getDivisions,
  getLeagues,
  setTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DivisionsSummary));