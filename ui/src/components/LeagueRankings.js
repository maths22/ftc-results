import React, {Component} from 'react';
import {connect} from 'react-redux';
import { Link as RouterLink } from 'react-router-dom';
import { push } from 'connected-react-router';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import {
  getLeagueDataWithTeams,
  getLeagueRankingsWithTeams,
  getSeasons
} from '../actions/api';
import {setTitle} from '../actions/ui';

import ChevronRight from '@mui/icons-material/ChevronRight';
import LoadingSpinner from './LoadingSpinner';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import SeasonSelector from './SeasonSelector';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import {PaddedCell} from './util';
import {styled} from '@mui/material/styles';

const DisabledRow = styled(TableRow)(() => ({
  '& td': {
    textDecoration: 'line-through',
    color: 'rgba(0, 0, 0, 0.4)'
  },
  '& a': {
    textDecoration: 'line-through',
    color: 'rgba(0, 0, 0, 0.4)'
  }
}));

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
    return <Breadcrumbs sx={{
      display: 'flex',
      height: '2em',
      alignItems: 'center',
      padding: '1em 1em 1em 0',
    }} aria-label="breadcrumb" separator={<ChevronRight/>}>
      {['league'].includes(this.props.type) ?
        <Link component={RouterLink} color="inherit" to={`/${this.props.selectedSeason}/teams/rankings`}>Statewide</Link>
      : null}
      {['all'].includes(this.props.type) ? <Typography color="textPrimary">Statewide</Typography> : null}
      {['league'].includes(this.props.type) && this.props.league.league ?
        <Link component={RouterLink} color="inherit" to={`/${this.props.selectedSeason}/leagues/rankings/${this.props.league.league.slug}`}>{this.props.league.league.name}</Link>
      : null}
      {['league'].includes(this.props.type) ? <Typography color="textPrimary">{this.props.league.name}</Typography> : null}
    </Breadcrumbs>;
  };

  render () {
    if(!this.props.rankings) {
      return <LoadingSpinner/>;
    }

    const rowStyle = { height: '2rem' };

    return <>
      {this.props.type === 'all' ? <SeasonSelector onChange={v => this.props.push(`/${v}/teams/rankings`)} selectedSeason={this.props.selectedSeason} /> : (this.props.season ? <Typography variant="h6">Season: {this.props.season.name} ({this.props.season.year})</Typography> : '')}
      <div style={{width: '100%', overflowX: 'auto'}}>
      {this.renderBreadcrumbs()}
          <Table sx={{minWidth: '20em'}} size="small">
            <TableHead>
              <TableRow style={rowStyle}>
                <PaddedCell>Rank</PaddedCell>
                <PaddedCell>Number</PaddedCell>
                <PaddedCell>Name</PaddedCell>
                { ['all'].includes(this.props.type) ? <PaddedCell>League</PaddedCell> : null }
                { ['all', 'league'].includes(this.props.type) && (!this.props.league || !this.props.league.league) ? <PaddedCell>Child League</PaddedCell> : null }
                <PaddedCell>RP</PaddedCell>
                <PaddedCell>TBP1</PaddedCell>
                <PaddedCell>TBP2</PaddedCell>
                <PaddedCell>Matches Played</PaddedCell>
                <PaddedCell>Matches Counted</PaddedCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.props.rankings.map((r, idx) => {
                const RowElement = r.team.consent_missing ? DisabledRow : TableRow;
                return (
                    <RowElement key={r.team.number} style={rowStyle}>
                      <PaddedCell>{idx + 1}</PaddedCell>
                      <PaddedCell><TextLink to={`/teams/summary/${r.team.number}`}>{r.team.number}</TextLink></PaddedCell>
                      <PaddedCell>{r.team.name}</PaddedCell>
                      { ['all'].includes(this.props.type) && r.league.league ?
                          <PaddedCell><TextLink to={`/${this.props.selectedSeason}/leagues/rankings/${r.league.league.slug}`}>{r.league.league.name}</TextLink></PaddedCell>
                          : null }
                      { ['all', 'league'].includes(this.props.type) && (!this.props.league || !this.props.league.league) ?
                          <PaddedCell>{r.league !== this.props.league ? <TextLink to={`/${this.props.selectedSeason}/leagues/rankings/${r.league.slug}`}>{r.league.name}</TextLink> : null}</PaddedCell>
                          : null }
                      { ['all'].includes(this.props.type) && !r.league.league ? <PaddedCell /> : null }
                      <PaddedCell>{Number(r.sort_order1).toFixed(2)}</PaddedCell>
                      <PaddedCell>{Number(r.sort_order2).toFixed(2)}</PaddedCell>
                      <PaddedCell>{Number(r.sort_order3).toFixed(2)}</PaddedCell>
                      <PaddedCell>{r.matches_played}</PaddedCell>
                      <PaddedCell>{r.matches_counted}</PaddedCell>
                    </RowElement>
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

export default connect(mapStateToProps, mapDispatchToProps)(LeagueRankings);