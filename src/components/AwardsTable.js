import TableRow from '@material-ui/core/TableRow/TableRow';
import TableCell from '@material-ui/core/TableCell/TableCell';
import Table from '@material-ui/core/Table/Table';
import TableHead from '@material-ui/core/TableHead/TableHead';
import TableBody from '@material-ui/core/TableBody/TableBody';
import React from 'react';
import {withStyles} from '@material-ui/core';
import TextLink from './TextLink';
import Typography from '@material-ui/core/Typography';
import AwardDetailsDialog from './AwardDetailsDialog';

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
    }
  }
});

class AwardsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selectedAward: null};
  }

  showDetails = (a) => {
    this.setState({selectedAward: a});
  };

  render() {
    const {awards, classes} = this.props;
    const {selectedAward} = this.state;

    if (!awards || awards.length === 0) {
      return <Typography variant="body1" style={{textAlign: 'center'}}>Awards are not currently available</Typography>;
    }

    const rowStyle = {height: '2rem'};


    return [<Table className={classes.table} key={1}>
      <TableHead>
        <TableRow style={rowStyle}>
          <TableCell className={classes.tableCell}>Name</TableCell>
          <TableCell className={classes.tableCell}>First Place</TableCell>
          <TableCell className={classes.tableCell}>Second Place</TableCell>
          <TableCell className={classes.tableCell}>Third Place</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {awards.map((a) => {
          const first = a.finalists.find((f) => f.place === 1);
          const second = a.finalists.find((f) => f.place === 2);
          const third = a.finalists.find((f) => f.place === 3);
          const isNameLink = a.description || (first && first.description);
          return <TableRow key={a.id} style={rowStyle}>
            <TableCell className={classes.tableCell}>{isNameLink ?
                <TextLink onClick={() => this.showDetails(a)}>{a.name}</TextLink> : a.name}</TableCell>
            <TableCell className={classes.tableCell}>
              {first && first.team ? <TextLink
                  to={`/teams/summary/${first.team.number}`}>{first.team.number} ({first.team.name})</TextLink> : null}
              {first && first.recipient ? first.recipient : null}
            </TableCell>
            <TableCell className={classes.tableCell}>
              {second && second.team ? <TextLink
                  to={`/teams/summary/${second.team.number}`}>{second.team.number} ({second.team.name})</TextLink> : null}
              {second && second.recipient ? second.recipient : null}
            </TableCell>
            <TableCell className={classes.tableCell}>
              {third && third.team ? <TextLink
                  to={`/teams/summary/${third.team.number}`}>{third.team.number} ({third.team.name})</TextLink> : null}
              {third && third.recipient ? third.recipient : null}
            </TableCell>
          </TableRow>;
        })}
      </TableBody>
    </Table>, <AwardDetailsDialog key={2} award={selectedAward} onClose={() => this.setState({selectedAward: null})}/>];
  }
}

export default withStyles(styles)(AwardsTable);