import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import {
  getDivisionData,
  getDivisions,
  getLeagueData,
  getLeagueRankings,
  getLeagues,
  getSeasons,
  getTeams
} from '../actions/api';
import {setTitle} from '../actions/ui';

import ChevronRight from '@material-ui/icons/ChevronRight';
import {withStyles} from '@material-ui/core';
import LoadingSpinner from './LoadingSpinner';
import TextLink from './TextLink';
import Typography from '@material-ui/core/Typography';
import SeasonSelector from './SeasonSelector';
import * as queryString from 'query-string';
import Breadcrumbs from '@material-ui/core/Breadcrumbs';

const styles = (theme) => ({
  breadcrumbParent: {
    display: 'flex',
    height: '2em',
    alignItems: 'center',
    padding: '1em 1em 1em 0',
  },
  root: {
    width: '100%',
    overflowX: 'auto',
  },
  table: {
    minWidth: '20em',
  },
  tableCell: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    textAlign: 'left',
    '&:last-child': {
      paddingRight: theme.spacing(1),
    }
  },
  disabledRow: {
    '& td': {
      textDecoration: 'line-through',
      color: 'rgba(0, 0, 0, 0.4)'
    },
    '& a': {
      textDecoration: 'line-through',
      color: 'rgba(0, 0, 0, 0.4)'
    }
  }
});

class DivisionsSummary extends Component {

  componentDidMount() {
    if(!this.props.rankings) {
      this.props.getTeams();
      this.props.getSeasons();
      this.refresh();
    }
    this.setTitle();
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.rankings && this.props.rankings) {
      this.setTitle();
    }
    if(prevProps.type !== this.props.type || prevProps.selectedSeason !== this.props.selectedSeason) {
      this.refresh();
    }
  }

  refresh() {
    if(this.props.type === 'all') {
      this.props.getLeagueRankings(this.props.selectedSeason);
    } else if(this.props.type === 'league') {
      this.props.getLeagueData(this.props.id);
    } else if(this.props.type === 'division') {
      this.props.getDivisionData(this.props.id);
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
    return <Breadcrumbs className={this.props.classes.breadcrumbParent} aria-label="breadcrumb" separator={<ChevronRight/>}>
      {['league', 'division'].includes(this.props.type) ?
        <Link component={RouterLink} color="inherit" to={`/teams/rankings?${queryString.stringify({season: this.props.season.year})}`}>Statewide</Link>
      : null}
      {['all'].includes(this.props.type) ? <Typography color="textPrimary">Statewide</Typography> : null}
      {['division'].includes(this.props.type) ?
        <Link component={RouterLink} color="inherit" to={`/leagues/rankings/${this.props.league.id}`}>{this.props.league.name}</Link>
      : null}
      {['league'].includes(this.props.type) ? <Typography color="textPrimary">{this.props.league.name}</Typography> : null}
      {['division'].includes(this.props.type) ? <Typography color="textPrimary">{this.props.division.name}</Typography> : null}
    </Breadcrumbs>;
  }

  render () {
    if(!this.props.rankings) {
      return <LoadingSpinner/>;
    }

    const {classes} = this.props;
    const rowStyle = { height: '2rem' };

    return <>
      {this.props.type === 'all' ? <SeasonSelector/> : (this.props.season ? <Typography variant="h6">Season: {this.props.season.name} ({this.props.season.year})</Typography> : '')}
      <div className={classes.root}>
      {this.renderBreadcrumbs()}
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow style={rowStyle}>
                <TableCell className={classes.tableCell}>Rank</TableCell>
                <TableCell className={classes.tableCell}>Number</TableCell>
                <TableCell className={classes.tableCell}>Name</TableCell>
                { ['all'].includes(this.props.type) ? <TableCell className={classes.tableCell}>League</TableCell> : null }
                { ['all', 'league'].includes(this.props.type) ? <TableCell className={classes.tableCell}>Division</TableCell> : null }
                <TableCell className={classes.tableCell}>RP</TableCell>
                <TableCell className={classes.tableCell}>TBP</TableCell>
                <TableCell className={classes.tableCell}>High Score</TableCell>
                <TableCell className={classes.tableCell}>Matches Played</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.rankings.map((r, idx) => {
                return (
                    <TableRow key={r.team.number} style={rowStyle} className={r.team.consent_missing ? classes.disabledRow : null}>
                      <TableCell className={classes.tableCell}>{idx + 1}</TableCell>
                      <TableCell className={classes.tableCell}><TextLink to={`/teams/summary/${r.team.number}`}>{r.team.number}</TextLink></TableCell>
                      <TableCell className={classes.tableCell}>{r.team.name}</TableCell>
                      { ['all'].includes(this.props.type) ?
                          <TableCell className={classes.tableCell}><TextLink to={`/leagues/rankings/${r.league.id}`}>{r.league.name}</TextLink></TableCell>
                          : null }
                      { ['all', 'league'].includes(this.props.type) ?
                          <TableCell className={classes.tableCell}><TextLink to={`/divisions/rankings/${r.division.id}`}>{r.division.name}</TextLink></TableCell>
                          : null }
                      <TableCell className={classes.tableCell}>{Number(r.rp).toFixed(2)}</TableCell>
                      <TableCell className={classes.tableCell}>{Number(r.tbp).toFixed(1)}</TableCell>
                      <TableCell className={classes.tableCell}>{r.high_score}</TableCell>
                      <TableCell className={classes.tableCell}>{r.matches_played}</TableCell>
                    </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <p style={{padingLeft: '1em', paddingRight: '1em'}}>
            Note: Crossed out teams have not submitted FIRST Illinois Robotics consent forms and will not be permitted
            to compete at the league championship unless these forms are submitted.
            Please contact <TextLink href="mailto:jweiland@firstillinoisrobotics.org">Jonathan Weiland</TextLink> with any questions.
          </p>
        </div>
      </>;
  }
}

const mapStateToProps = (state, props) => {
  const ret = {};
  ret.selectedSeason = state.ui.season;
  if (state.divisions && state.leagues && state.teams && state.leagueRankings) {
    let filter;
    if(props.type === 'league') {
      filter = (lr) => {
        return lr.league_id.toString() === props.id;
      };
      ret['league'] = state.leagues[props.id];
      if(state.seasons) {
        ret['season'] = state.seasons.find((s) => s.id === ret['league'].season_id);
      }
    } else if(props.type === 'division') {
      filter = (lr) => {
        return lr.division_id.toString() === props.id;
      };
      ret['division'] = state.divisions[props.id];
      ret['league'] = state.leagues[ret['division'].league_id];
      if(state.seasons) {
        ret['season'] = state.seasons.find((s) => s.id === ret['league'].season_id);
      }
    } else {
      if(state.seasons) {
        filter = (lr) => {
          return state.leagues[lr.league_id] && state.leagues[lr.league_id].season_id === state.seasons.find((s) => s.year === (state.ui.season || state.ui.defaultSeason)).id;
        };
      } else {
        filter = () => false;
      }
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
  getLeagueData,
  getDivisionData,
  getTeams,
  getSeasons,
  setTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(DivisionsSummary));