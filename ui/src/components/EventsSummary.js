import React, {Component} from 'react';
import {connect} from 'react-redux';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Button from '@material-ui/core/Button';
import CheckIcon from '@material-ui/icons/CheckCircle';

import {API_HOST, getDivisions, getEvents, getLeagues, getScoringDownloadUrl} from '../actions/api';
import EventImportDialog from './EventImportDialog';
import {setShowOnlyMyEvents, setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import {withStyles} from '@material-ui/core';
import TextLink from './TextLink';
import RequestAccessDialog from './RequestAccessDialog';
import TwitchSetupDialog from './TwitchSetupDialog';
import SeasonSelector from './SeasonSelector';
import {Link} from 'react-router-dom';
import Switch from '@material-ui/core/Switch';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ManageOwnersDialog from './ManageOwnersDialog';

const styles = (theme) => ({
  root: {
    width: '100%',
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

  manageOwners = (id) => {
    this.setState({manageOwners: id});
  };

  setupStream = (id) => {
    this.setState({streamEvent: id});
  };

  downloadScoring = async (id, test) => {
    const result = await this.props.getScoringDownloadUrl(id, test);
    if(result.error) {
      window.alert("Download failed");
      console.log(result);
      return;
    }
    window.location.href = result.payload.url;
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

  renderScoringSystems(e) {
    const {classes, uid} = this.props;
    const isLoggedIn = !!uid;

    let prodLink = <>Login to download the production scoring system</>;
    if (isLoggedIn && !e.can_import) {
      prodLink = <><TextLink onClick={() => this.requestAccess(e.id)}>Request access to the production scoring system</TextLink></>;
    } else if(isLoggedIn && e.can_import) {
      prodLink = <>
        <Button variant="contained" size="small" onClick={() => this.downloadScoring(e.id, false)}>Production Scoring System</Button>
        (Only for event use, not testing)
      </>;
    }


      return <TableCell className={classes.tableCell}>
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
          { prodLink }
          <Button variant="contained" size="small" onClick={() => this.downloadScoring(e.id, true)}>Test Scoring System</Button>
          (Do NOT use for events)
        </div>
      </TableCell>
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
    const { classes, uid, uiShowOnlyMyEvents } = this.props;
    const isLoggedIn = !!uid;

    return  <>
      <SeasonSelector/>
      <div className={classes.root}>
      { isLoggedIn ? <FormControlLabel
        style={{padding: '0.5em'}}
        control={
          <Switch checked={uiShowOnlyMyEvents} onChange={() => this.props.setShowOnlyMyEvents(!uiShowOnlyMyEvents)} />
        }
        label="Only Show Events I Manage"
      /> : null }
      <Table className={this.props.classes.table} size="small">
        <TableHead>
          <TableRow style={rowStyle}>
            <TableCell className={classes.tableCell}>Name</TableCell>
            <TableCell className={classes.tableCell}>League/Division</TableCell>
            <TableCell className={classes.tableCell}>Location</TableCell>
            <TableCell className={classes.tableCell}>Date</TableCell>
            <TableCell className={classes.tableCell}>Imported</TableCell>
            <TableCell className={classes.tableCell}>Download</TableCell>
            {isLoggedIn ? <TableCell className={classes.tableCell}>Manage</TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {vals.filter(e => uiShowOnlyMyEvents ? (!isLoggedIn || e.can_import) : true).map(e => {
            const divFinalsLeft = e.divisions.some((d) => !d.import);
            return (
                <TableRow key={e.id} style={rowStyle} className={e.aasm_state === 'canceled' ? classes.canceled :null}>
                  <TableCell className={classes.tableCell}><TextLink to={`/events/summary/${e.id}`}>{e.name}</TextLink></TableCell>
                  <TableCell className={classes.tableCell}>
                  { e.league ?
                      <TextLink to={`/leagues/rankings/${e.league.id}`}>{e.league.name}</TextLink>
                      : null }
                  { e.division ?
                      <><wbr/>{' – '}<TextLink to={`/divisions/rankings/${e.division.id}`}>{e.division.name}</TextLink></>
                      : null }
                  </TableCell>
                  <TableCell className={classes.tableCell}>{e.location && e.location.trim() !== '-' ? <>{e.location}<br/>{e.city}, {e.state}, {e.country}</> : 'TBA' }</TableCell>
                  <TableCell className={classes.tableCell}>{new Date(e.start_date).getUTCFullYear() === 9999 ? 'TBA' : e.start_date === e.end_date ? e.start_date : <>{e.start_date}<wbr/>{' - ' + e.end_date}</>}</TableCell>
                  <TableCell className={classes.tableCell}>{e.aasm_state === 'finalized' && !divFinalsLeft ? <CheckIcon/> :
                      (e.can_import ? <Button variant="contained" size="small" onClick={() => this.import(e.id)}>Import</Button>: null)}</TableCell>
                  {e.aasm_state === 'finalized'
                      ? this.renderDbs(e)
                      : this.renderScoringSystems(e) }
                  {isLoggedIn ? <TableCell className={classes.tableCell}>
                    {e.can_import && e.aasm_state !== 'finalized' ? <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
                      <Button style={{margin: '0.5em 0'}} variant="contained" size="small" onClick={() => this.manageOwners(e.id)}>Owners ({e.owners.length})</Button>
                      <Button component={Link} target="_blank" style={{margin: '0.5em 0'}} variant="contained" size="small" to={`/events/uploader/${e.id}`}>Live Upload</Button>
                      <Button style={{margin: '0.5em 0'}} variant="contained" size="small" onClick={() => this.setupStream(e.id)}>{e.channel ? 'Configure Stream' : 'Enable Stream'}</Button>
                    </div>: null}
                    {!e.can_import && e.aasm_state !== 'finalized' ? <Button variant="contained" size="small" onClick={() => this.requestAccess(e.id)}>Request Access</Button> : null}
                  </TableCell>: null}
                </TableRow>
            );
          })}
        </TableBody>
      </Table>
      <EventImportDialog id={this.state.importEvent} onClose={() => this.setState({importEvent: null})}/>
      <RequestAccessDialog id={this.state.accessEvent} onClose={() => this.setState({accessEvent: null})}/>
      <TwitchSetupDialog id={this.state.streamEvent} onClose={() => this.setState({streamEvent: null})}/>
      <ManageOwnersDialog id={this.state.manageOwners} onClose={() => this.setState({manageOwners: null})}/>
    </div>
    </>;
  }
}




const mapStateToProps = (state) => {
  const ret = {
    selectedSeason: state.ui.season,
    uiShowOnlyMyEvents: state.ui.showOnlyMyEvents
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
  getScoringDownloadUrl,
  setShowOnlyMyEvents,
  setTitle,
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(EventsSummary));