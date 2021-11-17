import TableRow from '@material-ui/core/TableRow/TableRow';
import TableCell from '@material-ui/core/TableCell/TableCell';
import Table from '@material-ui/core/Table/Table';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableBody from '@material-ui/core/TableBody/TableBody';
import React from 'react';
import {withStyles} from '@material-ui/core';
import TextLink from './TextLink';
import Typography from '@material-ui/core/Typography';

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
    }
  }
});

class AlliancesTable extends React.Component {
  render() {
    const {alliances, classes} = this.props;

    if (!alliances || alliances.length === 0) {
      return <Typography variant="body1" style={{textAlign: 'center'}}>Alliances are not currently available</Typography>;
    }

    const rowStyle = {height: '2rem'};

    // const colCount = Math.max(alliances.map((a) => a.teams.length));
    return <Table className={classes.table} key={1}>
      <TableHead>
        <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell}>Seed</TableCell>
          <TableCell className={classes.tableCell}>Captain</TableCell>
          <TableCell className={classes.tableCell}>First Pick</TableCell>
          <TableCell className={classes.tableCell}>Second Pick</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {alliances.map((a) => {
          return <TableRow key={a.id} style={rowStyle}>
            <TableCell className={classes.tableCell}>{a.seed}</TableCell>
            { a.teams.map((team) => <TableCell className={classes.tableCell}>
              <TextLink to={`/teams/summary/${team.number}`}>{team.number} ({team.name})</TextLink>
            </TableCell> )}
          </TableRow>;
        })}
      </TableBody>
    </Table>;
  }
}

export default withStyles(styles)(AlliancesTable);