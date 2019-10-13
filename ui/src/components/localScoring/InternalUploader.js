import React, {Component} from 'react';
import {withStyles} from '@material-ui/core';
import connect from 'react-redux/es/connect/connect';
import {
  getLocalAlliances,
  getLocalElimMatches,
  getLocalEvents,
  getLocalEvent,
  getLocalMatchDetails,
  getLocalMatches,
  getLocalNextDisplay,
  getLocalRankings,
  getLocalTeamList,
  getLocalAwards,
  getLocalVersion,
  localReset,
  setEvent,
  setRunning,
  setServer, websocketPath
} from '../../actions/localScoringApi';
import {setTitle} from '../../actions/ui';
import {postAlliances, postMatch, postMatches, postRankings, postAwards, postTeams, postState} from '../../actions/uploaderApi';
import objectHash from 'object-hash';
import {fromPairs} from 'lodash';

import {PersistentWebsocket} from 'persistent-websocket';


const styles = theme => ({
  button: {
    margin: theme.spacing(1),
  },
  input: {
    width: '100%',
  },
  root: {
    width: '100%',
    marginTop: theme.spacing(1),
    overflowX: 'auto',
    padding: theme.spacing(2)
  },
  serverPicker: {
    width: '50em'
  }
});

const MINUTES_IN_MILIS = 60000;
const DISPLAY_DELAY = 10 * MINUTES_IN_MILIS;

class Uploader extends Component {
  displayedMatches = {};
  displayedInitialized = false;

  targetDivision = 0;
  hashes = {};
  state = {};

  componentDidMount() {
  }

  componentDidUpdate(oldProps) {
    if(oldProps.localServer.uploadRunning && !this.props.localServer.uploadRunning) {
      this.stopUpload();
    }

    if(!oldProps.localServer.uploadRunning && this.props.localServer.uploadRunning) {
      this.startUpload();
    }
  }

  componentWillUnmount() {
    this.stopUpload();
    this.props.setRunning(false);
  }

  stopUpload = () => {
    this.hashes = {};
    clearInterval(this.syncInterval);
    // OPEN
    if(this.pws && this.pws.readyState === 1) {
      this.pws.close();
    }
  };

  startUpload = async () => {
    const eventInfo = await this.props.getLocalEvent(this.props.localServer.event);
    this.targetDivision = eventInfo.payload.division;
    this.syncData();
    this.syncInterval = setInterval(this.syncData, 30000);
    this.pws = new PersistentWebsocket(`ws://${this.props.localServer.hostname}:${this.props.localServer.port}${websocketPath}`);
    this.pws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if(msg.updateType === 'MATCH_POST') {
        const shortName = msg.payload.shortName;
        let phase = '';
        let matchNum = '';
        let series = null;
        if(shortName[0] === 'Q') {
          phase = 'qual';
          matchNum = parseInt(shortName.substr(1));
        }
        if(shortName.substr(0, 2) === 'SF') {
          phase = 'semi';
          series = parseInt(shortName.substr(2, 1));
          matchNum = parseInt(shortName.substr(4));
        }
        if(shortName[0] === 'F') {
          phase = 'final';
          matchNum = parseInt(shortName.substr(1));
        }
        if(shortName.substr(0, 2) === 'IF') {
          phase = 'final';
          matchNum = parseInt(shortName.substr(2));
        }
        const mid = phase + '-' + (series ? (series + '-') : '') + matchNum;
        const dispMatch = this.displayedMatches[mid] || {};
        dispMatch.displayAt = new Date();
        this.displayedMatches[mid] = dispMatch;
      }
    };
  };

  syncData = () => {
    this.syncState().then(() =>
      Promise.all([
        this.syncTeams(),
        this.syncRankings(),
        this.syncElimAlliances()
            .then(this.syncMatchList)
            .then(this.syncMatchResults),
        this.syncAwards(),
      ]).then(() => {
        this.setState({success: true, date: new Date()});
      }).catch((e) => {
        this.setState({success: false, date: new Date()});
        console.error('Sync failed: ', e);
      })
    );
  };

  syncState = async () => {
    const eventResult = await this.props.getLocalEvent(this.props.localServer.event);
    const status = eventResult.payload.status;
    const state = ['Future', 'Setup'].includes(status) ? 'not_started' : 'started';
    const newHash = objectHash(state);
    if(this.hashes['state'] !== newHash) {
      const postResult = await this.props.postState(this.props.event, state);
      if (postResult.error) throw postResult.payload;
    }
    this.hashes['state'] = newHash;
  };

  syncTeams = async () => {
    const teamsResult = await this.props.getLocalTeamList(this.props.localServer.event);
    const teams = teamsResult.payload.teamNumbers;
    const newHash = objectHash(teams);
    if(this.hashes['teamList'] !== newHash) {
      const postResult = await this.props.postTeams(this.props.event, this.targetDivision, teams);
      if (postResult.error) throw postResult.payload;
    }
    this.hashes['teamList'] = newHash;
  };

  syncElimAlliances = async () => {
    const alliancesResult = await this.props.getLocalAlliances(this.props.localServer.event);
    if(alliancesResult.error && alliancesResult.payload.response.errorCode === 'NOT_READY') {
      return;
    } else if(alliancesResult.error) {
      throw alliancesResult.payload;
    }
    const alliances = alliancesResult.payload.alliances;
    const uploadAlliances = alliances.map((a) => ({
      seed: a.seed,
      teams: [a.captain, a.pick1, a.pick2, a.pick3].filter((t) => t && t !== -1)
    }));

    const newHash = objectHash(uploadAlliances);
    if(this.hashes['alliances'] !== newHash) {
      const postResult = await this.props.postAlliances(this.props.event, this.targetDivision, uploadAlliances);
      if(postResult.error) throw postResult.payload;
    }
    this.hashes['alliances'] = newHash;
  };

  syncRankings = async () => {
    const rankingsResult = await this.props.getLocalRankings(this.props.localServer.event);
    const rankings = rankingsResult.payload.rankingList;
    const uploadRankings = rankings.map((r) => ({
      team_id: r.team,
      ranking: r.ranking,
      ranking_points: r.rankingPoints,
      tie_breaker_points: r.tieBreakerPoints,
      matches_played: r.matchesPlayed,
    }));
    const newHash = objectHash(uploadRankings);
    if(this.hashes['rankings'] !== newHash) {
      const postResult = await this.props.postRankings(this.props.event, this.targetDivision, uploadRankings);
      if(postResult.error) throw postResult.payload;
    }
    this.hashes['rankings'] = newHash;
  };

  syncAwards = async () => {
    const awardsResult = await this.props.getLocalAwards(this.props.localServer.event);
    const awards = awardsResult.payload.awards;
    const uploadAwards = awards.map((a) => ({
      name: a.name,
      finalists: a.winners.map((fin) => ({
        place: fin.series,
        recipient: a.isTeamAward ? undefined : `${fin.firstName} ${fin.lastName}`,
        team_id: fin.team
      }))
    }));
    const newHash = objectHash(uploadAwards);
    if(this.hashes['awards'] !== newHash) {
      const postResult = await this.props.postAwards(this.props.event, uploadAwards);
      if(postResult.error) throw postResult.payload;
    }
    this.hashes['awards'] = newHash;
  };

  getQualMatches = async () => {
    const matchesResult = await this.props.getLocalMatches(this.props.localServer.event);
    const matches = matchesResult.payload.matches;
    return matches.map((m) => ({
      phase: 'qual',
      number: m.matchNumber,
      red_alliance: [m.red.team1, m.red.team2, m.red.team3].filter(Boolean),
      blue_alliance: [m.blue.team1, m.blue.team2, m.blue.team3].filter(Boolean),
      red_surrogate: [m.red.isTeam1Surrogate, m.red.isTeam2Surrogate, m.red.isTeam3Surrogate].filter(Boolean),
      blue_surrogate: [m.blue.isTeam1Surrogate, m.blue.isTeam2Surrogate, m.blue.isTeam3Surrogate].filter(Boolean),
      finished: m.finished
    }));
  };

  getElimMatches = async (phase, series) => {
    const prefix = phase === 'final' ? 'finals' : ('sf/' + series);
    const matchesResult = await this.props.getLocalElimMatches(this.props.localServer.event, prefix);
    if(matchesResult.error && (
        matchesResult.payload.name === 'InternalError' ||
        matchesResult.payload.response.errorCode === 'NOT_READY' ||
        matchesResult.payload.response.errorCode === 'NO_SUCH_EVENT') // This error code makes no sense for the situation in which it appears
    ) {
      return [];
    } else if(matchesResult.error) {
      throw matchesResult.payload;
    }
    const matches = matchesResult.payload.matchList;
    return matches.map((m) => ({
      phase: phase,
      series: series,
      //TODO check this pls (is this really right for semis)
      number: m.match.split('-')[1],
      red_alliance: m.red.seed,
      blue_alliance: m.blue.seed,
      red_present: [m.red.captain !== -1, m.red.pick1 !== -1, m.red.pick2 !== -1],
      blue_present: [m.blue.captain !== -1, m.blue.pick1 !== -1, m.blue.pick2 !== -1],
      finished: true
    }));
  };

  syncMatchList = async () => {
    const matches = await Promise.all([
        this.getQualMatches(),
        this.getElimMatches('semi', 1),
        this.getElimMatches('semi', 2),
        this.getElimMatches('final'),
    ]);

    const uploadMatches = [].concat.apply([], matches);

    const newHash = objectHash(uploadMatches);
    if(this.hashes['matchList'] !== newHash) {
      const postResult = await this.props.postMatches(this.props.event, this.targetDivision, uploadMatches);
      if(postResult.error) throw postResult.payload;
    }
    this.hashes['matchList'] = newHash;

    return uploadMatches.filter((m) => m.finished);
  };


  syncMatchResults = async (matches) => {
    // Calculate which results should be posted
    matches.forEach((m) => {
      const mid = m.phase + '-' + (m.series ? (m.series + '-') : '') + m.number;
      const dispMatch = this.displayedMatches[mid] || {};
      const now = new Date();
      if(dispMatch.displayAt) {
        if(dispMatch.displayAt <= new Date()) {
          m.postResults = true;
        }
      } else {
        dispMatch.displayAt = new Date(now.getTime() + (this.displayedInitialized ? DISPLAY_DELAY : 0));
        if(!this.displayedInitialized) m.postResults = true;
      }
      this.displayedMatches[mid] = dispMatch;
    });
    this.displayedInitialized = true;

    //TODO generalize seasons
    const matchResults = await Promise.all(matches.filter((m) => m.postResults).map(async (m) => {
      let prefix;
      if(m.phase !== 'qual') {
        prefix = 'elim/' + (m.phase === 'final' ? 'finals' : ('sf/' + m.series));
      } else {
        prefix = 'matches';
      }
      const details = await this.props.getLocalMatchDetails(this.props.localServer.event, '2020', prefix, m.number);
      return [[m.phase, m.series, m.number].filter((m) => m).join('-'), details.payload];
    }));
    await Promise.all(matchResults.map(async (val) => {
      const [mid, mr] = val;
      const mapScoreToUploadScore = (s) => ({
        auto_skystones: s.autoStones.filter((s) => s === 'SKYSTONE').length - (s.firstReturnedIsSkystone ? 1 : 0),
        // Note we aren't counting skystones in this number
        auto_delivered: s.autoDelivered - s.autoReturned - s.autoStones.filter((s) => s === 'SKYSTONE').length,
        auto_placed: s.autoPlaced,
        robots_navigated: (s.robot1.navigated ? 1 : 0) + (s.robot2.navigated ? 1 : 0),
        foundation_repositioned: s.foundationRepositioned ? 1 : 0,
        teleop_placed: s.driverControlledPlaced,
        teleop_delivered: s.driverControlledDelivered - s.driverControlledReturned,
        tallest_height: s.towerBonusPoints / 2,
        foundation_moved: s.foundationMoved ? 1 : 0,
        robots_parked: (s.robot1.parked ? 1 : 0) + (s.robot2.parked ? 1 : 0),
        capstone_1_level: s.robot1.capstoneLevel,
        capstone_2_level: s.robot2.capstoneLevel,
        minor_penalties: s.minorPenalties,
        major_penalties: s.majorPenalties,
      });
      const uploadScore = {
        red_score: mapScoreToUploadScore(mr.red),
        blue_score: mapScoreToUploadScore(mr.blue)
      };

      const newHash = objectHash(uploadScore);
      if(this.hashes['match-' + mid] !== newHash) {
        const postResult = await this.props.postMatch(this.props.event, this.targetDivision, mid, uploadScore);
        if(postResult.error) throw postResult.payload;
      }
      this.hashes['match-' + mid] = newHash;
    }));
  };

  render() {

    const {localServer} = this.props;
    return (
        localServer.uploadRunning ? <div>
          Upload running!<br/>
          Last attempt: {this.state.success === true ? ('success at ' + this.state.date.toLocaleString()) : null} {this.state.success === false ? ('failure at ' + this.state.date.toLocaleString()) : null}
        </div> : null
    );
  }
}

const mapStateToProps = (state, props) => {
  const ret = {};
  ret.localServer = state.localScoring.server;
  ret.local = state.localScoring;
  return ret;
};

const mapDispatchToProps = {
  getLocalEvents,
  getLocalEvent,
  getLocalVersion,
  getLocalRankings,
  getLocalTeamList,
  getLocalMatches,
  getLocalElimMatches,
  getLocalAlliances,
  getLocalMatchDetails,
  getLocalNextDisplay,
  getLocalAwards,
  postRankings,
  postTeams,
  postMatches,
  postMatch,
  postState,
  postAlliances,
  postAwards,
  localReset,
  setEvent,
  setServer,
  setTitle,
  setRunning
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Uploader));