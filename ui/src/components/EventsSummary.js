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
import EventImportDialog from './EventImportDialog';
import {setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import {withStyles} from '@material-ui/core';
import TextLink from './TextLink';
import RequestAccessDialog from './RequestAccessDialog';
import TwitchSetupDialog from './TwitchSetupDialog';
import SeasonSelector from './SeasonSelector';

const styles = (theme) => ({
  root: {
    width: '100%',
    marginTop: theme.spacing(1),
    overflowX: 'auto',
  },
  table: {
    minWidth: '30em',
  },
  tableCell: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    textAlign: 'left',
    '&:last-child': {
      paddingRight: theme.spacing(1),
    }
  },
  canceled: {
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

class EventsSummary extends Component {

  constructor(props) {
    super(props);
    this.state = {importEvent: null, accessEvent: null, streamEvent: null};
  }

  componentDidMount() {
    if(!this.props.events) {
      this.props.getEvents(this.props.selectedSeason);
      this.props.getDivisions();
      this.props.getLeagues();
    }
    this.props.setTitle('Events');
  }

  componentWillUnmount() {
    this.props.setTitle(null);
  }

  componentDidUpdate(prevProps) {
    if(!this.props.events || this.props.selectedSeason !== prevProps.selectedSeason) {
      this.props.getEvents(this.props.selectedSeason);
      this.props.getDivisions();
      this.props.getLeagues();
    }
  }

  import = (id) => {
    this.setState({importEvent: id});
  };

  requestAccess = (id) => {
    this.setState({accessEvent: id});
  };

  setupStream = (id) => {
    this.setState({streamEvent: id});
  };

  renderDbs(e) {
    const links = [];
    if(e.import) {
      links.push(<TextLink href={API_HOST + e.import} ref={0}>{e.divisions.length > 0 ? 'Finals' : ''} Database</TextLink>);
    }
    if(e.divisions) {
      e.divisions.forEach((d) => {
        if(!d.import) return;
        links.push(<div><TextLink href={API_HOST + d.import} ref={d.id}>{d.name} Database</TextLink></div>);
      });
    }
    return <TableCell className={this.props.classes.tableCell}>
      {links}
    </TableCell>;
  }

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
    const { classes, uid } = this.props;
    const isLoggedIn = !!uid;

    return  <>
      <SeasonSelector/>
      <Paper className={classes.root}>
      <Table className={this.props.classes.table}>
        <TableHead>
          <TableRow style={rowStyle}>
            <TableCell className={classes.tableCell}>Name</TableCell>
            <TableCell className={classes.tableCell}>Type</TableCell>
            <TableCell className={classes.tableCell}>League</TableCell>
            <TableCell className={classes.tableCell}>Division</TableCell>
            <TableCell className={classes.tableCell}>Location</TableCell>
            <TableCell className={classes.tableCell}>Date</TableCell>
            <TableCell className={classes.tableCell}>Imported</TableCell>
            <TableCell className={classes.tableCell}>Download</TableCell>
            {isLoggedIn ? <TableCell className={classes.tableCell}>Live Uploader</TableCell> : null}
            {isLoggedIn ? <TableCell className={classes.tableCell}>Live Stream (Twitch)</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {vals.map(e => {
            const divFinalsLeft = e.divisions.some((d) => !d.import);
            return (
                <TableRow key={e.id} style={rowStyle} className={e.aasm_state === 'canceled' ? classes.canceled :null}>
                  <TableCell className={classes.tableCell}><TextLink to={`/events/summary/${e.id}`}>{e.name}</TextLink></TableCell>
                  <TableCell className={classes.tableCell}>{e.context_type === 'Division' ? 'Meet' : 'Championship'}</TableCell>
                  { e.league ?
                      <TableCell className={classes.tableCell}><TextLink to={`/leagues/rankings/${e.league.id}`}>{e.league.name}</TextLink></TableCell>
                      : <TableCell className={classes.tableCell}/> }
                  { e.division ?
                      <TableCell className={classes.tableCell}><TextLink to={`/divisions/rankings/${e.division.id}`}>{e.division.name}</TextLink></TableCell>
                      : <TableCell className={classes.tableCell}/> }
                  <TableCell className={classes.tableCell}>{e.location}<br/>{e.city}, {e.state}, {e.country}</TableCell>
                  <TableCell className={classes.tableCell}>{e.start_date === e.end_date ? e.start_date : (e.start_date + ' - ' + e.end_date)}</TableCell>
                  <TableCell className={classes.tableCell}>{e.aasm_state === 'finalized' && !divFinalsLeft ? <CheckIcon/> :
                      (e.can_import ? <Button variant="contained" size="small" onClick={() => this.import(e.id)}>Import</Button>: null)}</TableCell>
                  {e.aasm_state === 'finalized' || divFinalsLeft
                      ? this.renderDbs(e)
                      : <TableCell className={classes.tableCell}><TextLink href={scoring_download_url(e.id)}>Scoring System</TextLink></TableCell> }
                  {isLoggedIn ? <TableCell className={classes.tableCell}>
                    {e.can_import && e.aasm_state !== 'finalized' ? <TextLink to={`/events/uploader/${e.id}`}>Live Upload</TextLink> : null}
                    {!e.can_import && e.aasm_state !== 'finalized' ? <TextLink onClick={() => this.requestAccess(e.id)}>Request Access</TextLink> : null}
                  </TableCell>: null}
                  {isLoggedIn ? <TableCell className={classes.tableCell}>
                    {e.can_import && e.aasm_state !== 'finalized' ? <Button variant="contained" size="small" onClick={() => this.setupStream(e.id)}>{e.channel ? 'Configure Stream' : 'Enable Stream'}</Button> : null}
                    {!e.can_import && e.aasm_state !== 'finalized' ? <TextLink onClick={() => this.requestAccess(e.id)}>Request Access</TextLink> : null}
                  </TableCell>: null}
                </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <EventImportDialog id={this.state.importEvent} onClose={() => this.setState({importEvent: null})}/>
      <RequestAccessDialog id={this.state.accessEvent} onClose={() => this.setState({accessEvent: null})}/>
      <TwitchSetupDialog id={this.state.streamEvent} onClose={() => this.setState({streamEvent: null})}/>
    </Paper>
    </>;
  }
}




const mapStateToProps = (state) => {
  const ret = {
    selectedSeason: state.ui.season
  };
  if (state.events && state.divisions && state.leagues) {
    ret.events = Object.values(state.events)
        .filter((e) => e.season === (state.ui.season || state.ui.defaultSeason))
        .map((evt) => {
            const extra = {};
            if (evt.context_type === 'Division') {
              extra.division = state.divisions[evt.context_id];
              extra.league = state.leagues[extra.division.league_id];
            } else if (evt.context_type === 'League') {
              extra.league = state.leagues[evt.context_id];

            }
            return Object.assign({}, evt, extra);
          }
      );
    ret.uid = state.token['x-uid'];
  }
  return ret;
};

const mapDispatchToProps = {
  getDivisions,
  getEvents,
  getLeagues,
  setTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventsSummary));