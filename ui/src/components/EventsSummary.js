import React, {Component} from 'react';
import {connect} from 'react-redux';
import { push } from 'connected-react-router';

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Button from '@mui/material/Button';
import CheckIcon from '@mui/icons-material/CheckCircle';

import {API_HOST, getEvents, getLeagues} from '../actions/api';
import EventImportDialog from './EventImportDialog';
import EventTransformDialog from './EventTransformDialog';
import {setShowOnlyMyEvents, setTitle} from '../actions/ui';
import LoadingSpinner from './LoadingSpinner';
import TextLink from './TextLink';
import RequestAccessDialog from './RequestAccessDialog';
import TwitchSetupDialog from './TwitchSetupDialog';
import SeasonSelector from './SeasonSelector';
import {Link} from 'react-router-dom';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import ManageOwnersDialog from './ManageOwnersDialog';
import {PaddedCell} from './util';
import {styled} from '@mui/material/styles';

const CanceledRow = styled(TableRow)(() => ({
  '& td': {
    textDecoration: 'line-through',
    color: 'rgba(0, 0, 0, 0.4)'
  },
  '& a': {
    textDecoration: 'line-through',
    color: 'rgba(0, 0, 0, 0.4)'
  }
}));

class EventsSummary extends Component {

  constructor(props) {
    super(props);
    this.state = {importEvent: null, accessEvent: null, streamEvent: null};
  }

  componentDidMount() {
    if(!this.props.events) {
      this.props.getEvents(this.props.selectedSeason);
      this.props.getLeagues(this.props.selectedSeason);
    }
    this.props.setTitle('Events');
  }

  componentWillUnmount() {
    this.props.setTitle(null);
  }

  componentDidUpdate(prevProps) {
    if(!this.props.events || this.props.selectedSeason !== prevProps.selectedSeason) {
      this.props.getEvents(this.props.selectedSeason);
      this.props.getLeagues(this.props.selectedSeason);
    }
  }

  import = (id) => {
    this.setState({importEvent: id});
  };

  transform = (id) => {
    this.setState({transformEvent: id});
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
    return <PaddedCell>
      {links}
    </PaddedCell>;
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
    const { uid, uiShowOnlyMyEvents } = this.props;
    const isLoggedIn = !!uid;

    return  <>
      <SeasonSelector onChange={(v) => this.props.push(`/${v}/events/all`)} selectedSeason={this.props.selectedSeason} />
      <div style={{width: '100%', overflowX: 'auto'}}>
      { isLoggedIn ? <FormControlLabel
        style={{padding: '0.5em'}}
        control={
          <Switch checked={uiShowOnlyMyEvents} onChange={() => this.props.setShowOnlyMyEvents(!uiShowOnlyMyEvents)} />
        }
        label="Only Show Events I Manage"
      /> : null }
      <Table mx={{minWidth: '30em'}} size="small">
        <TableHead>
          <TableRow style={rowStyle}>
            <PaddedCell>Name</PaddedCell>
            <PaddedCell>League</PaddedCell>
            <PaddedCell>Location</PaddedCell>
            <PaddedCell>Date</PaddedCell>
            <PaddedCell>Imported</PaddedCell>
            <PaddedCell>Download</PaddedCell>
            {isLoggedIn ? <PaddedCell>Manage</PaddedCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {vals.filter(e => uiShowOnlyMyEvents ? (!isLoggedIn || e.can_import) : true).map(e => {
            const divFinalsLeft = e.divisions.some((d) => !d.import);
            const RowElement = e.aasm_state === 'canceled' ? CanceledRow : TableRow;
            return (
                <RowElement key={e.id} style={rowStyle}>
                  <PaddedCell><TextLink to={`/${this.props.selectedSeason}/events/summary/${e.slug}`}>{e.name}</TextLink></PaddedCell>
                  <PaddedCell>
                  { e.league && e.league.league ?
                      <><TextLink to={`/${this.props.selectedSeason}/leagues/rankings/${e.league.league.slug}`}>{e.league.league.name}</TextLink><wbr/>{' – '}</>
                      : null }
                  { e.league ?
                      <TextLink to={`/${this.props.selectedSeason}/leagues/rankings/${e.league.slug}`}>{e.league.name}</TextLink>
                      : null }
                  </PaddedCell>
                  <PaddedCell>{e.location && e.location.trim() !== '-' ? <>{e.location}<br/>{e.city}, {e.state}, {e.country}</> : 'TBA' }</PaddedCell>
                  <PaddedCell>{new Date(e.start_date).getUTCFullYear() === 9999 ? 'TBA' : e.start_date === e.end_date ? e.start_date : <>{e.start_date}<wbr/>{' - ' + e.end_date}</>}</PaddedCell>
                  <PaddedCell>{e.aasm_state === 'finalized' && !divFinalsLeft ? <CheckIcon/> :
                      (e.can_import ? <Button variant="contained" size="small" onClick={() => this.import(e.id)}>Import</Button>: null)}</PaddedCell>
                  {e.aasm_state === 'finalized'
                      ? this.renderDbs(e)
                      : null }
                  {isLoggedIn ? <PaddedCell>
                    {e.can_import && e.aasm_state !== 'finalized' ? <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-around'}}>
                      <Button style={{margin: '0.5em 0'}} variant="contained" size="small" onClick={() => this.manageOwners(e.id)}>Owners ({e.owners.length})</Button>
                      <Button style={{margin: '0.5em 0'}} variant="contained" size="small" onClick={() => this.transform(e.id)}>Configure DB</Button>
                      <Button component={Link} target="_blank" style={{margin: '0.5em 0'}} variant="contained" size="small" to={`/${this.props.selectedSeason}/events/uploader/${e.slug}`}>Live Upload</Button>
                      <Button style={{margin: '0.5em 0'}} variant="contained" size="small" onClick={() => this.setupStream(e.id)}>{e.channel ? 'Configure Stream' : 'Enable Stream'}</Button>
                    </div>: null}
                    {!e.can_import && e.aasm_state !== 'finalized' ? <Button variant="contained" size="small" onClick={() => this.requestAccess(e.id)}>Request Access</Button> : null}
                  </PaddedCell>: null}
                </RowElement>
            );
          })}
        </TableBody>
      </Table>
      <EventImportDialog id={this.state.importEvent} selectedSeason={this.props.selectedSeason} onClose={() => this.setState({importEvent: null})}/>
      <EventTransformDialog id={this.state.transformEvent} selectedSeason={this.props.selectedSeason} onClose={() => this.setState({transformEvent: null})}/>
      <RequestAccessDialog id={this.state.accessEvent} onClose={() => this.setState({accessEvent: null})}/>
      <TwitchSetupDialog id={this.state.streamEvent} onClose={() => this.setState({streamEvent: null})}/>
      <ManageOwnersDialog id={this.state.manageOwners} onClose={() => this.setState({manageOwners: null})}/>
    </div>
    </>;
  }
}




const mapStateToProps = (state, props) => {
  const ret = {
    uiShowOnlyMyEvents: state.ui.showOnlyMyEvents
  };
  if (state.events && state.leagues) {
    ret.events = Object.values(state.events)
        .filter((e) => e.season === props.selectedSeason)
        .map((evt) => {
            const extra = {};
            if (evt.context_type === 'League') {
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
  getEvents,
  getLeagues,
  setShowOnlyMyEvents,
  setTitle,
  push,
};

export default connect(mapStateToProps, mapDispatchToProps)(EventsSummary);