import classNames from 'classnames';
import TableRow from '@material-ui/core/TableRow/TableRow';
import TableCell from '@material-ui/core/TableCell/TableCell';
import Table from '@material-ui/core/Table/Table';
import TableBody from '@material-ui/core/TableBody/TableBody';
import React from 'react';
import {withStyles} from '@material-ui/core';

const styles = (theme) => ({
  table: {
    minWidth: '20em',
  },
  tableCell: {
    paddingLeft: theme.spacing.unit,
    paddingRight: theme.spacing.unit,
    textAlign: 'center',
    '&:last-child': {
      paddingRight: theme.spacing.unit,
    }
  },
  tableRow: {
    height: '2rem'
  },
  keyTableRow: {
  },
  redCell: {
    background: '#fee',
    width: '25%',
  },
  blueCell: {
    background: '#eef',
    width: '25%',
  },
  redKeyCell: {
    background: '#fdd',
    fontWeight: 'bold',
  },
  blueKeyCell: {
    background: '#ddf',
    fontWeight: 'bold',
  },
  keyCell: {
    background: '#f0f0f0',
    fontWeight: 'bold',
  },
  allianceCell: {
    fontWeight: 'bold',
  },
  surrogateCell: {
    opacity: '0.6'
  }
});

function matchTable({classes, match}) {

  const red_det = match.red_score_details;
  const blue_det = match.blue_score_details;

  const scores = [
    {
      desc: 'Robots Landed',
      red: red_det.robots_landed,
      blue: blue_det.robots_landed,
      value: 30
    },
    {
      desc: 'Depots Claimed',
      red: red_det.depots_claimed,
      blue: blue_det.depots_claimed,
      value: 15
    },
    {
      desc: 'Mineral Fields Sampled',
      red: red_det.fields_sampled,
      blue: blue_det.fields_sampled,
      value: 25
    },
    {
      desc: 'Robots Parked',
      red: red_det.robots_parked_auto,
      blue: blue_det.robots_parked_auto,
      value: 10
    },
    {
      desc: 'Auto Total',
      red: match.red_score.auto,
      blue: match.blue_score.auto,
      key: true
    },
    {
      desc: 'Minerals in Depot',
      red: red_det.depot_minerals,
      blue: blue_det.depot_minerals,
      value: 2
    },
    {
      desc: 'Gold in Gold Cargo Hold',
      red: red_det.gold_cargo,
      blue: blue_det.gold_cargo,
      value: 5
    },
    {
      desc: 'Silver in Silver Cargo Hold',
      red: red_det.silver_cargo,
      blue: blue_det.silver_cargo,
      value: 5
    },
    {
      desc: 'Teleop Total',
      red: match.red_score.teleop,
      blue: match.blue_score.teleop,
      key: true
    },
    {
      desc: 'Robots Latched',
      red: red_det.depot_minerals,
      blue: blue_det.depot_minerals,
      value: 50
    },
    {
      desc: 'Parked Robots (in Crater)',
      red: red_det.robots_in_crater,
      blue: blue_det.robots_in_crater,
      value: 15
    },
    {
      desc: 'Parked Robots (Completely in Crater)',
      red: red_det.robots_completely_in_crater,
      blue: blue_det.robots_completely_in_crater,
      value: 25
    },
    {
      desc: 'Endgame Total',
      red: match.red_score.endgame,
      blue: match.blue_score.endgame,
      key: true
    },
    {
      desc: 'Minor Penalties',
      red: red_det.minor_penalties,
      blue: blue_det.minor_penalties,
      value: 10,
      penalty: true
    },
    {
      desc: 'Major Penalties',
      red: red_det.major_penalties,
      blue: blue_det.major_penalties,
      value: 40,
      penalty: true
    },
    {
      desc: 'Total Score',
      red: match.red_score_total,
      blue: match.blue_score_total,
      key: true
    }
  ];
  scores.forEach((val) => {
    if(val.value) {
      val.red_pts = val.red * val.value;
      val.blue_pts = val.blue * val.value;
    }
  });

  return <Table className={classes.table}>
    <TableBody>
      {scores.map((sc) => (<TableRow className={classNames(classes.tableRow, {[classes.keyTableRow]: sc.key})}>
        <TableCell className={classNames(classes.tableCell, classes.redCell, {[classes.redKeyCell]: sc.key})}>
          {sc.red} {sc.red_pts ? `(+${sc.red_pts}${sc.penalty ? ' to blue' : ''})` : ''}
        </TableCell>
        <TableCell className={classNames(classes.tableCell, {[classes.keyCell]: sc.key})}>{sc.desc}</TableCell>
        <TableCell className={classNames(classes.tableCell, classes.blueCell, {[classes.blueKeyCell]: sc.key})}>
          {sc.blue} {sc.blue_pts ? `(+${sc.blue_pts}${sc.penalty ? ' to red' : ''})` : ''}
        </TableCell>
      </TableRow>))}
    </TableBody>
  </Table>;
}

export default withStyles(styles)(matchTable);