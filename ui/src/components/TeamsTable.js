import TableRow from '@mui/material/TableRow/TableRow';
import TableCell from '@mui/material/TableCell/TableCell';
import Table from '@mui/material/Table/Table';
import TableHead from '@mui/material/TableHead/TableHead';
import TableBody from '@mui/material/TableBody/TableBody';
import React from 'react';
import withStyles from '@mui/styles/withStyles';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import uniq from 'lodash/uniq';

const styles = (theme) => ({
  table: {
    minWidth: '20em',
  },
  tableCell: {
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    textAlign: 'left',
    '&:last-child': {
      paddingRight: theme.spacing(1),
    },
    whiteSpace: 'pre-line',
  }
});

function teamsTable({teams, classes, showDivisionAssignments, divisions, onClickDivision}) {
  if(!teams || teams.length === 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>Team list is not currently available</Typography>;
  }

  const rowStyle = { height: '2rem' };


  return <Table className={classes.table} size="small">
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
          <TableCell className={classes.tableCell}>{t.organization ? uniq(t.organization.split('&').map((s) => s.trim())).join('\n') : null}</TableCell>
        </TableRow>;
      })}
    </TableBody>
  </Table>;
}

export default withStyles(styles)(teamsTable);