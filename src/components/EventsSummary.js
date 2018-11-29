import React, {Component} from 'react';
import {connect} from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/CheckCircle';

import {API_HOST, getDivisions, getEvents, getLeagues, scoring_download_url} from '../actions/api';
import {Link} from 'react-router-dom';
import EventImportDialog from './EventImportDialog';
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

class EventsSummary extends Component {

  constructor(props) {
    super(props);
    this.state = {importEvent: null};
  }

  componentDidMount() {
    if(!this.props.events) {
      this.props.getEvents();
      this.props.getDivisions();
      this.props.getLeagues();
    }
    this.props.setTitle('Events');
  }

  componentWillUnmount() {
    this.props.setTitle(null);
  }

  componentDidUpdate() {
    if(!this.props.events) {
      this.props.getEvents();
      this.props.getDivisions();
      this.props.getLeagues();
    }
  }

  import = (id) => {
    this.setState({importEvent: id});
  };


  render () {
    if(!this.props.events) {
      return <LoadingSpinner/>;
    }
    const vals = [...this.props.events].sort((a, b) => {
      const diff = a.start_date.localeCompare(b.start_date);
      if(diff !== 0) return diff;
      return a.name.localeCompare(b.name);
    } );

    const rowStyle = { height: '2rem' };

    return <Paper className={this.props.classes.root}>
      <Table className={this.props.classes.table}>
        <TableHead>
          <TableRow style={rowStyle}>
            <TableCell>Type</TableCell>
            <TableCell>League</TableCell>
            <TableCell>Division</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Location</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Imported</TableCell>
            <TableCell>Download</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {vals.map(e => {
            return (
                <TableRow key={e.id} style={rowStyle}>
                  <TableCell>{e.context_type === 'Division' ? 'Meet' : 'Championship'}</TableCell>
                  <TableCell component={Link} to={`/leagues/rankings/${e.league.id}`}>{e.league.name}</TableCell>
                  { e.division ?
                      <TableCell component={Link} to={`/divisions/rankings/${e.division.id}`}>{e.division.name}</TableCell>
                      : <TableCell/> }
                  <TableCell>{e.name}</TableCell>
                  <TableCell>{e.location}<br/>{e.city}, {e.state}, {e.country}</TableCell>
                  <TableCell>{e.start_date === e.end_date ? e.start_date : (e.start_date + ' - ' + e.end_date)}</TableCell>
                  <TableCell>{e.aasm_state === 'finalized' ? <CheckIcon/> :
                      (e.can_import ? <Button variant="contained" size="small" onClick={() => this.import(e.id)}>Import</Button>: null)}</TableCell>
                  {e.aasm_state === 'finalized'
                      ? (e.import ? <TableCell component="a" href={API_HOST + e.import}>Database</TableCell> : <TableCell/>)
                      : <TableCell component="a" href={scoring_download_url(e.id)}>Scoring System</TableCell> }
                </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <EventImportDialog id={this.state.importEvent} onClose={() => this.setState({importEvent: null})}/>
    </Paper>;
  }
}




const mapStateToProps = (state) => {
  if (state.events && state.divisions && state.leagues) {
    return {
      events: Object.values(state.events).map((evt) => {
            const extra = {};
            if (evt.context_type === 'Division') {
              extra.division = state.divisions[evt.context_id];
              extra.league = state.leagues[extra.division.league_id];
            } else {
              extra.league = state.leagues[evt.context_id];

            }
            return Object.assign({}, evt, extra);
          }
      ),
      uid: state.token['x-uid']
    };
  }
  return {
    events: null
  };
};

const mapDispatchToProps = {
  getDivisions,
  getEvents,
  getLeagues,
  setTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventsSummary));