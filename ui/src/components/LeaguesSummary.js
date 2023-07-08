import React, {Component} from 'react';
import {connect} from 'react-redux';
import { push } from 'connected-react-router';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import {getLeagues, getSeasons} from '../actions/api';
import {Link} from 'react-router-dom';
import {setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import withStyles from '@mui/styles/withStyles';
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

class LeaguesSummary extends Component {

  componentDidMount() {
    if(!this.props.leagues) {
      this.props.getSeasons();
      this.props.getLeagues(this.props.selectedSeason);
    }
    this.props.setTitle('Leagues');
  }

  componentWillUnmount() {
    this.props.setTitle(null);
  }


  render () {
    if(!this.props.leagues) {
      return <LoadingSpinner/>;
    }
    const vals = [...this.props.leagues].sort((a, b) => {
      if(!a.league && b.league) {
        return -1;
      }
      if(a.league && !b.league) {
        return 1;
      }
      if(!a.league && !b.league) {
        return a.name.localeCompare(b.name);
      }
      const diff = a.league.name.localeCompare(b.league.name);
      if(diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    } );

    const rowStyle = { height: '2rem' };

    return <>
      <SeasonSelector onChange={v => this.props.push(`/${v}/leagues/summary`)} selectedSeason={this.props.selectedSeason} />
      <div className={this.props.classes.root}>
        <Table className={this.props.classes.table}>
          <TableHead>
            <TableRow style={rowStyle}>
              <TableCell>League</TableCell>
              <TableCell>Child league</TableCell>
              <TableCell>Number of Teams</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vals.map(val => {
              return (
                  <TableRow key={val.id} style={rowStyle}>
                    {val.league ? <TableCell component={Link} to={`/${this.props.selectedSeason}/leagues/rankings/${val.league.slug}`}>{val.league.name}</TableCell> : null}
                    <TableCell component={Link} to={`/${this.props.selectedSeason}/leagues/rankings/${val.slug}`}>{val.name}</TableCell>
                    {val.league ? null : <TableCell />}
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




const mapStateToProps = (state, props) => {
  if (state.leagues && state.seasons) {
    return {
      leagues: Object.values(state.leagues).filter((league) => league.season_id === state.seasons.find((s) => s.year === props.selectedSeason).id)
        .filter((league) => !Object.values(state.leagues).some((l) => l.league_id === league.id))
    };
  }
  return {
    leagues: null
  };
};

const mapDispatchToProps = {
  getLeagues,
  getSeasons,
  setTitle,
  push,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(LeaguesSummary));