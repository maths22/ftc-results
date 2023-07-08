import TableRow from '@mui/material/TableRow/TableRow';
import TableCell from '@mui/material/TableCell/TableCell';
import Table from '@mui/material/Table/Table';
import TableHead from '@mui/material/TableHead/TableHead';
import TableBody from '@mui/material/TableBody/TableBody';
import React from 'react';
import withStyles from '@mui/styles/withStyles';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';

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

    const colCount = Math.max(3, ...alliances.map((a) => a.teams.length));
    return <Table className={classes.table} key={1}>
      <TableHead>
        <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell}>Seed</TableCell>
          <TableCell className={classes.tableCell}>Captain</TableCell>
          <TableCell className={classes.tableCell}>First Pick</TableCell>
          <TableCell className={classes.tableCell}>Second Pick</TableCell>
          {colCount > 3 ? <TableCell className={classes.tableCell}>Backup</TableCell> : null}
        </TableRow>
      </TableHead>
      <TableBody>
        {alliances.map((a) => {
          return <TableRow key={a.id} style={rowStyle}>
            <TableCell className={classes.tableCell}>{a.seed}</TableCell>
            { a.teams.map((team) => <TableCell className={classes.tableCell} key={team.number}>
              <TextLink to={`/teams/summary/${team.number}`}>{team.number} ({team.name})</TextLink>
            </TableCell> )}
            {Array(colCount - a.teams.length).fill(1).map((id) => <TableCell key={id} className={classes.tableCell}>&nbsp;</TableCell>)}
          </TableRow>;
        })}
      </TableBody>
    </Table>;
  }
}

export default withStyles(styles)(AlliancesTable);