import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { push } from 'connected-react-router';
import Link from '@material-ui/core/Link';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import {
  getLeagueDataWithTeams,
  getLeagueRankingsWithTeams,
  getSeasons
} from '../actions/api';
import {setTitle} from '../actions/ui';

import ChevronRight from '@material-ui/icons/ChevronRight';
import {withStyles} from '@material-ui/core';
import LoadingSpinner from './LoadingSpinner';
import TextLink from './TextLink';
import Typography from '@material-ui/core/Typography';
import SeasonSelector from './SeasonSelector';
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

class LeagueRankings extends Component {

  componentDidMount() {
    if(!this.props.rankings) {
      this.props.getSeasons();
      this.refresh();
    }
    this.setTitle();
  }

  componentDidUpdate(prevProps) {
    if(!prevProps.rankings && this.props.rankings) {
      this.setTitle();
    }
    if(prevProps.selectedSeason !== this.props.selectedSeason) {
      this.refresh();
    }
  }

  refresh() {
    if(this.props.type === 'all') {
      this.props.getLeagueRankingsWithTeams(this.props.selectedSeason);
    } else if(this.props.type === 'league') {
      this.props.getLeagueDataWithTeams(this.props.selectedSeason, this.props.id);
    }
  }

  setTitle() {
    if(!this.props.rankings) {
      this.props.setTitle('Rankings');
    } else {
      if(this.props.type === 'league') {
        this.props.setTitle(this.props.league.name + ' League Rankings');
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
      {['league'].includes(this.props.type) ?
        <Link component={RouterLink} color="inherit" to={`/${this.props.selectedSeason}/teams/rankings`}>Statewide</Link>
      : null}
      {['all'].includes(this.props.type) ? <Typography color="textPrimary">Statewide</Typography> : null}
      {['league'].includes(this.props.type) && this.props.league.league ?
        <Link component={RouterLink} color="inherit" to={`/${this.props.selectedSeason}/leagues/rankings/${this.props.league.league.slug}`}>{this.props.league.league.name}</Link>
      : null}
      {['league'].includes(this.props.type) ? <Typography color="textPrimary">{this.props.league.name}</Typography> : null}
    </Breadcrumbs>;
  }

  render () {
    if(!this.props.rankings) {
      return <LoadingSpinner/>;
    }

    const {classes} = this.props;
    const rowStyle = { height: '2rem' };

    return <>
      {this.props.type === 'all' ? <SeasonSelector onChange={v => this.props.push(`/${v}/teams/rankings`)} selectedSeason={this.props.selectedSeason} /> : (this.props.season ? <Typography variant="h6">Season: {this.props.season.name} ({this.props.season.year})</Typography> : '')}
      <div className={classes.root}>
      {this.renderBreadcrumbs()}
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow style={rowStyle}>
                <TableCell className={classes.tableCell}>Rank</TableCell>
                <TableCell className={classes.tableCell}>Number</TableCell>
                <TableCell className={classes.tableCell}>Name</TableCell>
                { ['all'].includes(this.props.type) ? <TableCell className={classes.tableCell}>League</TableCell> : null }
                { ['all', 'league'].includes(this.props.type) && (!this.props.league || !this.props.league.league) ? <TableCell className={classes.tableCell}>Child League</TableCell> : null }
                <TableCell className={classes.tableCell}>RP</TableCell>
                <TableCell className={classes.tableCell}>TBP1</TableCell>
                <TableCell className={classes.tableCell}>TBP2</TableCell>
                <TableCell className={classes.tableCell}>Matches Played</TableCell>
                <TableCell className={classes.tableCell}>Matches Counted</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.rankings.map((r, idx) => {
                return (
                    <TableRow key={r.team.number} style={rowStyle} className={r.team.consent_missing ? classes.disabledRow : null}>
                      <TableCell className={classes.tableCell}>{idx + 1}</TableCell>
                      <TableCell className={classes.tableCell}><TextLink to={`/teams/summary/${r.team.number}`}>{r.team.number}</TextLink></TableCell>
                      <TableCell className={classes.tableCell}>{r.team.name}</TableCell>
                      { ['all'].includes(this.props.type) && r.league.league ?
                          <TableCell className={classes.tableCell}><TextLink to={`/${this.props.selectedSeason}/leagues/rankings/${r.league.league.slug}`}>{r.league.league.name}</TextLink></TableCell>
                          : null }
                      { ['all', 'league'].includes(this.props.type) && (!this.props.league || !this.props.league.league) ?
                          <TableCell className={classes.tableCell}>{r.league !== this.props.league ? <TextLink to={`/${this.props.selectedSeason}/leagues/rankings/${r.league.slug}`}>{r.league.name}</TextLink> : null}</TableCell>
                          : null }
                      { ['all'].includes(this.props.type) && !r.league.league ? <TableCell className={classes.tableCell} /> : null }
                      <TableCell className={classes.tableCell}>{Number(r.sort_order1).toFixed(2)}</TableCell>
                      <TableCell className={classes.tableCell}>{Number(r.sort_order2).toFixed(2)}</TableCell>
                      <TableCell className={classes.tableCell}>{Number(r.sort_order3).toFixed(2)}</TableCell>
                      <TableCell className={classes.tableCell}>{r.matches_played}</TableCell>
                      <TableCell className={classes.tableCell}>{r.matches_counted}</TableCell>
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
  if (state.seasons && state.leagues && state.teams && state.leagueRankings) {
    let filter;
    if(props.type === 'league') {
      ret['league'] = Object.values(state.leagues).find(l => l.slug === props.id);
      if(!ret.league) {
        return ret;
      }
      filter = (lr) => {
        return lr.context_id === ret['league'].id || state.leagues[lr.context_id].league_id === ret['league'].id;
      };
      if(state.seasons) {
        ret['season'] = state.seasons.find((s) => s.id === ret['league'].season_id);
      }
    } else {
      if(state.seasons) {
        filter = (lr) => {
          return state.leagues[lr.context_id] && state.leagues[lr.context_id].season_id === state.seasons.find((s) => s.year === props.selectedSeason).id;
        };
      } else {
        filter = () => false;
      }
    }

    ret['rankings'] = Object.values(state.leagueRankings).filter(filter).sort((a, b) => {
      const sort1 = b.sort_order1 - a.sort_order1;
      if(sort1 !== 0) {
        return sort1;
      }
      const sort2 = b.sort_order2 - a.sort_order2;
      if(sort2 !== 0) {
        return sort2;
      }
      const sort3 = b.sort_order3 - a.sort_order3;
      if(sort3 !== 0) {
        return sort3;
      }
      const sort4 = b.sort_order4 - a.sort_order4;
      if(sort4 !== 0) {
        return sort4;
      }
      const sort5 = b.sort_order5 - a.sort_order5;
      if(sort5 !== 0) {
        return sort5;
      }
      return b.sort_order6 - a.sort_order6;
    }).map((lr) => Object.assign({}, lr, {
      team: state.teams[lr.team],
      league: state.leagues[lr.context_id],
    })).filter((val, idx, self) => {
      const myRankings = self.filter(lr => lr.team === val.team);
      return !myRankings.find(lr => lr.league.league === val.league);
    });
  }
  return ret;
};

const mapDispatchToProps = {
  getLeagueRankingsWithTeams,
  getLeagueDataWithTeams,
  getSeasons,
  setTitle,
  push,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LeagueRankings));