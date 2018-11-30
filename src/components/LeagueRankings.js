import React, {Component} from 'react';
import {connect} from 'react-redux';
import {Link} from 'react-router-dom';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';

import {getDivisions, getLeagueRankings, getLeagues, getTeams} from '../actions/api';
import {setTitle} from '../actions/ui';

import ChevronRight from '@material-ui/icons/ChevronRight';
import {withStyles} from '@material-ui/core';
import LoadingSpinner from './LoadingSpinner';
import TextLink from './TextLink';

const styles = (theme) => ({
  breadcrumbParent: {
    display: 'flex',
    height: '2em',
    alignItems: 'center',
    padding: '1em',
  },
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
    if(!this.props.rankings) {
      this.props.getDivisions();
      this.props.getLeagues();
      this.props.getTeams();
      this.props.getLeagueRankings();
    }
    this.setTitle();
  }

  componentDidUpdate(oldProps) {
    if(!oldProps.rankings && this.props.rankings) {
      this.setTitle();
    }
  }

  setTitle() {
    if(!this.props.rankings) {
      this.props.setTitle('Rankings');
    } else {
      if(this.props.type === 'league') {
        this.props.setTitle(this.props.league.name + ' League Rankings');
      } else if(this.props.type === 'division') {
        this.props.setTitle(this.props.division.name + ' Division Rankings');
      } else {
        this.props.setTitle('Statewide Rankings');
      }
    }
  }

  componentWillUnmount() {
    this.props.setTitle(null);
  }

  renderBreadcrumbs = () => {
    return <span className={this.props.classes.breadcrumbParent}>
      {['league', 'division'].includes(this.props.type) ? [
          <Link key={1} to="/teams/rankings">Statewide</Link>,
          <ChevronRight key={2}/>
      ] : null}
      {['all'].includes(this.props.type) ? <span>Statewide</span> : null}
      {['division'].includes(this.props.type) ? [
          <Link key={1} to={`/leagues/rankings/${this.props.league.id}`}>{this.props.league.name}</Link>,
          <ChevronRight key={2}/>
      ] : null}
      {['league'].includes(this.props.type) ? <span>{this.props.league.name}</span> : null}
      {['division'].includes(this.props.type) ? <span>{this.props.division.name}</span> : null}
    </span>;
  }

  render () {
    if(!this.props.rankings) {
      return <LoadingSpinner/>;
    }

    const rowStyle = { height: '2rem' };

    return <Paper className={this.props.classes.root}>
      {this.renderBreadcrumbs()}
          <Table className={this.props.classes.table}>
            <TableHead>
              <TableRow style={rowStyle}>
                <TableCell>Rank</TableCell>
                <TableCell>Number</TableCell>
                <TableCell>Name</TableCell>
                { ['all'].includes(this.props.type) ? <TableCell>League</TableCell> : null }
                { ['all', 'league'].includes(this.props.type) ? <TableCell>Division</TableCell> : null }
                <TableCell>RP</TableCell>
                <TableCell>TBP</TableCell>
                <TableCell>High Score</TableCell>
                <TableCell>Matches Played</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.rankings.map((r, idx) => {
                return (
                    <TableRow key={r.team.number} style={rowStyle}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell><TextLink to={`/teams/summary/${r.team.number}`}>{r.team.number}</TextLink></TableCell>
                      <TableCell>{r.team.name}</TableCell>
                      { ['all'].includes(this.props.type) ?
                          <TableCell><TextLink to={`/leagues/rankings/${r.league.id}`}>{r.league.name}</TextLink></TableCell>
                          : null }
                      { ['all', 'league'].includes(this.props.type) ?
                          <TableCell><TextLink to={`/divisions/rankings/${r.division.id}`}>{r.division.name}</TextLink></TableCell>
                          : null }
                      <TableCell>{r.rp}</TableCell>
                      <TableCell>{r.tbp}</TableCell>
                      <TableCell>{r.high_score}</TableCell>
                      <TableCell>{r.matches_played}</TableCell>
                    </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Paper>;
  }
}

const mapStateToProps = (state, props) => {
  const ret = {};
  if (state.divisions && state.leagues && state.teams && state.leagueRankings) {
    let filter;
    if(props.type === 'league') {
      filter = (lr) => {
        return lr.league_id.toString() === props.id;
      };
      ret['league'] = state.leagues[props.id];
    } else if(props.type === 'division') {
      filter = (lr) => {
        return lr.division_id.toString() === props.id;
      };
      ret['division'] = state.divisions[props.id];
      ret['league'] = state.leagues[ret['division'].league_id];
    } else {
      filter = () => true;
    }

    ret['rankings'] = Object.values(state.leagueRankings).filter(filter).map((lr) => Object.assign({}, lr, {
        team: state.teams[lr.team],
        league: state.leagues[lr.league_id],
        division: state.divisions[lr.division_id]
      }));
  }
  return ret;
};

const mapDispatchToProps = {
  getDivisions,
  getLeagues,
  getLeagueRankings,
  getTeams,
  setTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DivisionsSummary));