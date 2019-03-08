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
  setServer
} from '../../actions/localScoringApi';
import {setTitle} from '../../actions/ui';
import {postAlliances, postMatch, postMatches, postRankings, postAwards, postTeams} from '../../actions/uploaderApi';
import objectHash from 'object-hash';


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    width: '100%',
  },
  root: {
    width: '100%',
    marginTop: theme.spacing.unit,
    overflowX: 'auto',
    padding: 2 * theme.spacing.unit
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
  };

  startUpload = async () => {
    const eventInfo = await this.props.getLocalEvent(this.props.localServer.event);
    this.targetDivision = eventInfo.payload.division;
    this.syncData();
    this.syncInterval = setInterval(this.syncData, 30000);
    this.startDisplayLoop();
  };

  startDisplayLoop = async () => {
    let firstrun = true;
    while(this.props.localServer.uploadRunning) {
      const nextDisp = await this.props.getLocalNextDisplay(this.props.localServer.event);
      if(firstrun && nextDisp.error) {
        break;
      }
      firstrun = false;
      if(nextDisp.payload.type === 'SHOW_RESULTS') {
        const matchParts = nextDisp.payload.params[1].split(' ');
        let phase = '';
        if(matchParts[0] === 'Qualification') {
          phase = 'qual';
        }
        if(matchParts[0] === 'Semifinal') {
          phase = 'semi';
        }
        if(matchParts[0] === 'Finals') {
          phase = 'final';
        }
        let series = null;
        if(matchParts.length === 4) {
          series = parseInt(matchParts[1]);
        }
        const matchNum = matchParts.length === 4 ? parseInt(matchParts[3]) : parseInt(matchParts[1]);
        const mid = phase + '-' + (series ? (series + '-') : '') + matchNum;
        const dispMatch = this.displayedMatches[mid] || {};
        dispMatch.displayAt = new Date();
        this.displayedMatches[mid] = dispMatch;
      }
    }
  };

  syncData = () => {
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
    });
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
      teams: [a.captain, a.pick1, a.pick2].filter((t) => t !== -1)
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
    const intRegex = /^-?[0-9]+$/;
    const awardsResult = await this.props.getLocalAwards(this.props.localServer.event);
    if(awardsResult.error && awardsResult.payload.response.errorCode === 'NOT_READY') {
      return;
    } else if(awardsResult.error) {
      throw awardsResult.payload;
    }
    const awards = awardsResult.payload.awards;
    const uploadAwards = awards.map((a) => ({
      name: a.awardName,
      finalists: [
        {
          place: 1,
          [a.firstPlace && a.firstPlace.match(intRegex) ? 'team_id' : 'recipient']: a.firstPlace || '-1'
        },
        {
          place: 2,
          [a.secondPlace && a.secondPlace.match(intRegex) ? 'team_id' : 'recipient']: a.secondPlace || '-1'
        },
        {
          place: 3,
          [a.thirdPlace && a.thirdPlace.match(intRegex) ? 'team_id' : 'recipient']: a.thirdPlace || '-1'
        },
      ].filter((f) => f.team_id !== '-1' && f.recipient !== '-1')
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
      red_alliance: [m.red.team1, m.red.team2],
      blue_alliance: [m.blue.team1, m.blue.team2],
      red_surrogate: [m.red.isTeam1Surrogate, m.red.isTeam2Surrogate],
      blue_surrogate: [m.blue.isTeam1Surrogate, m.blue.isTeam2Surrogate],
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
      const details = await this.props.getLocalMatchDetails(this.props.localServer.event, '2019', prefix, m.number);
      return [[m.phase, m.series, m.number].filter((m) => m).join('-'), details.payload];
    }));
    await Promise.all(matchResults.map(async (val) => {
      const [mid, mr] = val;
      const inCrater = {0: 0, 15: 1, 25: 0, 40: 1, 30: 2, 50: 0};
      const completelyInCrater = {0: 0, 15: 0, 25: 1, 40: 1, 30: 0, 50: 2};
      const mapScoreToUploadScore = (s) => ({
        robots_landed: s.landed / 30,
        depots_claimed: s.claimedDepot / 15,
        robots_parked_auto: s.autoParking / 10,
        fields_sampled: s.mineralSample / 25,
        depot_minerals: s.depotMinerals / 2,
        gold_cargo: s.landerGold / 5,
        silver_cargo: s.landerSilver / 5,
        latched_robots: s.latchedLander / 50,
        robots_in_crater: inCrater[s.endParking],
        robots_completely_in_crater: completelyInCrater[s.endParking],
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
  postAlliances,
  postAwards,
  localReset,
  setEvent,
  setServer,
  setTitle,
  setRunning
};

export default connect(mapStateToProps, mapDispatchToProps)(withStyles(styles)(Uploader));