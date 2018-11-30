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

const styles = (theme) => ({
  table: {
    minWidth: '30em',
  },
  tableCell: {
    paddingLeft: 2 * theme.spacing.unit,
    paddingRight: 2 * theme.spacing.unit,
    textAlign: 'center',
    '&:last-child': {
      paddingRight: 2 * theme.spacing.unit,
    }
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
  allianceCell: {
    fontWeight: 'bold',
  },
  surrogateCell: {
    opacity: '0.6'
  }
});

function matchTable({matches, team, classes}) {
  if(matches.length === 0) return null;

  const rowStyle = { height: '2rem' };

  const prefixes = {'qual': 'Q-', 'semi': 'SF-', 'final': 'F-'};

  const groupedMatches = mapValues(groupBy(sortBy(matches, ['phase', 'series', 'number']), 'phase'), (matches) => {
    return matches.map((m) => {
      const matchDisp = prefixes[m.phase] + (m.series ? (m.series + '-') : '') + m.number;
      const teamSpan = m.blue_alliance.length === 3 ? 2 : 3;

      let isRedTeam, isSurrogate = false, idx = -1;
      if(team) {
        isRedTeam = m.red_alliance.includes(team);
        idx = isRedTeam ? m.red_alliance.indexOf(team) : m.blue_alliance.indexOf(team);
        isSurrogate = isRedTeam ? m.red_surrogate[idx] : m.blue_surrogate[idx];
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

      return <TableRow key={m.id} style={rowStyle}>
        <TableCell className={classNames(classes.tableCell, {[classes.surrogateCell]: isSurrogate})}>{matchDisp}</TableCell>
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
        <TableCell className={redClassnames}>
          <span>{m.red_score}</span>
        </TableCell>
        <TableCell className={blueClassnames}>
          <span>{m.blue_score}</span>
        </TableCell>
      </TableRow>;
    });
  });

  return <Table className={classes.table}>
    <TableHead>
      <TableRow style={rowStyle}>
        <TableCell className={classes.tableCell}>Match</TableCell>
        <TableCell className={classes.tableCell} colSpan={6}>Red Alliance</TableCell>
        <TableCell className={classes.tableCell} colSpan={6}>Blue Alliance</TableCell>
        <TableCell className={classes.tableCell} colSpan={2}>Scores</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      { groupedMatches['qual'] ? <TableRow style={rowStyle}>
        <TableCell className={classes.tableCell} colSpan={15}>Qualifications</TableCell>
      </TableRow> : null}
      { groupedMatches['qual'] ? groupedMatches['qual'] : null}
      { groupedMatches['semi'] ? <TableRow style={rowStyle}>
        <TableCell className={classes.tableCell} colSpan={15}>Semi-Finals</TableCell>
      </TableRow> : null}
      { groupedMatches['semi'] ? groupedMatches['qual'] : null}
      { groupedMatches['final'] ? <TableRow style={rowStyle}>
        <TableCell className={classes.tableCell}colSpan={15}>Finals</TableCell>
      </TableRow> : null}
      { groupedMatches['final'] ? groupedMatches['qual'] : null}
    </TableBody>
  </Table>;
}

export default withStyles(styles)(matchTable);