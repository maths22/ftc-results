import TableRow from '@material-ui/core/TableRow/TableRow';
import TableCell from '@material-ui/core/TableCell/TableCell';
import Table from '@material-ui/core/Table/Table';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableBody from '@material-ui/core/TableBody/TableBody';
import React from 'react';
import {withStyles} from '@material-ui/core';
import TextLink from './TextLink';
import Typography from '@material-ui/core/Typography';
import uniq from 'lodash/uniq';

const styles = (theme) => ({
  table: {
    minWidth: '20em',
  },
  tableCell: {
    paddingLeft: 1 * theme.spacing.unit,
    paddingRight: 1 * theme.spacing.unit,
    textAlign: 'left',
    '&:last-child': {
      paddingRight: 1 * theme.spacing.unit,
    },
    whiteSpace: 'pre-line',
  }
});

function teamsTable({teams, classes, showDivisionAssignments, divisions, onClickDivision}) {
  if(!teams || teams.length === 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>Team list is not currently available</Typography>;
  }

  const rowStyle = { height: '2rem' };


  return <Table className={classes.table}>
    <TableHead>
      <TableRow style={rowStyle}>
        { showDivisionAssignments ? <TableCell className={classes.tableCell}>Division</TableCell> : null }
        <TableCell className={classes.tableCell}>Team Number</TableCell>
        <TableCell className={classes.tableCell}>Team Name</TableCell>
        <TableCell className={classes.tableCell}>Location</TableCell>
        <TableCell className={classes.tableCell}>Organization</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {teams.sort((a, b) => a.team.number - b.team.number).map((td) => {
        const t = td.team;
        const division = divisions.find((d) => d.number === td.division);
        return <TableRow key={t.number} style={rowStyle}>
          { showDivisionAssignments && division ? <TableCell className={classes.tableCell}>
            <TextLink onClick={() => onClickDivision(division.number)}>{division.name}</TextLink>
          </TableCell> : ( showDivisionAssignments ? <TableCell className={classes.tableCell}/> : null) }
          <TableCell className={classes.tableCell}>
            <TextLink to={`/teams/summary/${t.number}`}>{t.number}</TextLink>
          </TableCell>
          <TableCell className={classes.tableCell}>{t.name}</TableCell>
          <TableCell className={classes.tableCell}>{[t.city, t.state, t.country].join(', ')}</TableCell>
          <TableCell className={classes.tableCell}>{uniq(t.organization.split('&').map((s) => s.trim())).join('\n')}</TableCell>
        </TableRow>
      })}
    </TableBody>
  </Table>;
}

export default withStyles(styles)(teamsTable);