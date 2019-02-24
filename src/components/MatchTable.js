import mapValues from 'lodash/mapValues';
import groupBy from 'lodash/groupBy';
import sortBy from 'lodash/sortBy';
import classNames from 'classnames';
import TableRow from '@material-ui/core/TableRow/TableRow';
import TableCell from '@material-ui/core/TableCell/TableCell';
import Table from '@material-ui/core/Table/Table';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableBody from '@material-ui/core/TableBody/TableBody';
import React from 'react';
import {withStyles} from '@material-ui/core';
import TextLink from './TextLink';
import Typography from '@material-ui/core/Typography/Typography';
import MatchDetailsDialog from './MatchDetailsDialog';
import Hidden from '@material-ui/core/Hidden/Hidden';
import ScrollingBody from './ScrollingBody';

const styles = (theme) => ({
  table: {
    minWidth: '20em',
  },
  tableCell: {
    paddingLeft: 1 * theme.spacing.unit,
    paddingRight: 1 * theme.spacing.unit,
    textAlign: 'center',
    '&:last-child': {
      paddingRight: 1 * theme.spacing.unit,
    }
  },
  rotatingTableCell: {
    // paddingLeft: 1 * theme.spacing.unit,
    // paddingRight: 1 * theme.spacing.unit,
    display: 'inline-block',
    textAlign: 'center',
    // '&:last-child': {
    //   paddingRight: 1 * theme.spacing.unit,
    // }
  },
  redCell: {
    background: '#fee',
  },
  blueCell: {
    background: '#eef',
  },
  redWinningCell: {
    background: '#fdd',
  },
  blueWinningCell: {
    background: '#ddf',
  },
  redDisplayCell: {
    background: '#f44 !important'
  },
  blueDisplayCell: {
    background: '#4Af !important'
  },
  allianceCell: {
    fontWeight: 'bold',
  },
  surrogateCell: {
    opacity: '0.6'
  }
});

class MatchTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = { selectedMatch: null };
  }

  showDetails = (id) => {
    this.setState({selectedMatch: id});
  };

  render() {
    const {matches, team, classes, pitDisplay} = this.props;
    const {selectedMatch} = this.state;
    if (matches.length === 0) {
      return <Typography variant="body1" style={{textAlign: 'center'}}>No matches are currently available</Typography>;
    }

    const rowStyle = {height: '2rem'};

    const prefixes = {'qual': 'Q-', 'semi': 'SF-', 'final': 'F-', 'interfinal': 'IF-'};

    const groupedMatches = mapValues(groupBy(sortBy(matches, ['phase', 'series', 'number']), 'phase'), (matches) => {
      return matches.map((m) => {
        const matchDisp = prefixes[m.phase] + (m.series ? (m.series + '-') : '') + m.number;
        const teamSpan = m.blue_alliance.length === 3 ? 2 : 3;

        let isRedTeam, isSurrogate = false, idx = -1, result;
        if (team) {
          isRedTeam = m.red_alliance.includes(team);
          idx = isRedTeam ? m.red_alliance.indexOf(team) : m.blue_alliance.indexOf(team);
          isSurrogate = isRedTeam ? m.red_surrogate[idx] : m.blue_surrogate[idx];
          if(m.red_score === m.blue_score) {
            result = 'T';
          } else if((isRedTeam && m.red_score > m.blue_score) || (!isRedTeam && m.red_score < m.blue_score)) {
            result = 'W';
          } else {
            result = 'L';
          }
        }

        const redClassnames = classNames(classes.tableCell, classes.redCell, {
          [classes.redWinningCell]: m.red_score > m.blue_score,
          [classes.allianceCell]: team && isRedTeam,
          [classes.surrogateCell]: isSurrogate,
        });
        const blueClassnames = classNames(classes.tableCell, classes.blueCell, {
          [classes.blueWinningCell]: m.red_score < m.blue_score,
          [classes.allianceCell]: team && !isRedTeam,
          [classes.surrogateCell]: isSurrogate,
        });

        if(pitDisplay) {
          if(!m.played) return null;
          const resultSegments = [m.red_score, m.blue_score, 'T'];
          let pitClasses = classes.rotatingTableCell;
          if(m.red_score > m.blue_score) {
            resultSegments[2] = 'R';
            pitClasses = classNames(classes.rotatingTableCell, classes.redDisplayCell);
          }
          if(m.red_score < m.blue_score) {
            resultSegments[2] = 'B';
            pitClasses = classNames(classes.rotatingTableCell, classes.blueDisplayCell);
          }
          return <div key={m.id} className={'tableRowDiv'} style={Object.assign({},{width: '100%', rowStyle})}>
            <span className={classes.rotatingTableCell} style={{width: '50%'}}>{matchDisp}</span>
            <span className={pitClasses} style={{width: '50%'}}>{resultSegments[0]}-{resultSegments[1]} {resultSegments[2]}</span>
          </div>
        }

        return <TableRow key={m.id} style={rowStyle}>
          <TableCell
              className={classNames(classes.tableCell, {[classes.surrogateCell]: isSurrogate})}>
            {m.played ? <TextLink onClick={() => this.showDetails(m.id)}>{matchDisp}</TextLink> : matchDisp}
          </TableCell>
          <Hidden xsDown>
            {team ? <TableCell className={classNames(classes.tableCell, {[classes.surrogateCell]: isSurrogate})}>{m.played ? result : '-'}</TableCell> : null}
          </Hidden>
          {m.red_alliance.map((t, idx) => {
            const Component = t === team ? 'span' : TextLink;
            return <TableCell key={t} colSpan={teamSpan} className={redClassnames}>
              <Component to={`/teams/summary/${t}`}>{t}
                {m.red_surrogate[idx] ? '*' : ''}</Component>
            </TableCell>;
          })}
          {m.blue_alliance.map((t, idx) => {
            const Component = t === team ? 'span' : TextLink;
            return <TableCell key={t} colSpan={teamSpan} className={blueClassnames}>
              <Component to={`/teams/summary/${t}`}>{t}
                {m.blue_surrogate[idx] ? '*' : ''}</Component>
            </TableCell>;
          })}
          {m.played ? <TableCell className={redClassnames}>
            <span>{m.red_score}</span>
          </TableCell> : null}
          {m.played ? <TableCell className={blueClassnames}>
            <span>{m.blue_score}</span>
          </TableCell>: null}
          {!m.played ? <TableCell className={classes.tableCell} colSpan={2}>
            <span>Awaiting results</span>
          </TableCell>: null}
        </TableRow>;
      });
    });

    if(pitDisplay) {
      return  [<div className={'tableHeadDiv'} key={1}>
        <span className={classes.rotatingTableCell} style={{width: '50%'}}>Match</span>
        <span className={classes.rotatingTableCell} style={{width: '50%'}}>Result</span>
      </div>,
      <ScrollingBody key={2}>
        {groupedMatches['qual'] ? groupedMatches['qual'] : null}
        {groupedMatches['semi'] ? groupedMatches['semi'] : null}
        {groupedMatches['final'] ? groupedMatches['final'] : null}
        <div className={'tableRowDiv'} />
      </ScrollingBody>]
    }

    return [<Table key={1} className={classes.table}>
      <TableHead>
        <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell}>Match</TableCell>
          <Hidden xsDown>
            {team ? <TableCell className={classes.tableCell}>Result</TableCell> : null}
          </Hidden>
          <TableCell className={classes.tableCell} colSpan={6}>Red Alliance</TableCell>
          <TableCell className={classes.tableCell} colSpan={6}>Blue Alliance</TableCell>
          <TableCell className={classes.tableCell} colSpan={2}>Scores</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {groupedMatches['interfinal'] ? <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell} colSpan={15}>Inter-division Finals</TableCell>
        </TableRow> : null}
        {groupedMatches['interfinal'] ? groupedMatches['interfinal'] : null}
        {groupedMatches['final'] ? <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell} colSpan={15}>Finals</TableCell>
        </TableRow> : null}
        {groupedMatches['final'] ? groupedMatches['final'] : null}
        {groupedMatches['semi'] ? <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell} colSpan={15}>Semi-Finals</TableCell>
        </TableRow> : null}
        {groupedMatches['semi'] ? groupedMatches['semi'] : null}
        {groupedMatches['qual'] ? <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell} colSpan={15}>Qualifications</TableCell>
        </TableRow> : null}
        {groupedMatches['qual'] ? groupedMatches['qual'] : null}
      </TableBody>
    </Table>, <MatchDetailsDialog key={2} id={selectedMatch} onClose={() => this.setState({selectedMatch: null})}/>];
  }
}

export default withStyles(styles)(MatchTable);