import TableRow from '@mui/material/TableRow/TableRow';
import Table from '@mui/material/Table/Table';
import TableHead from '@mui/material/TableHead/TableHead';
import TableBody from '@mui/material/TableBody/TableBody';
import React from 'react';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import {PaddedCell} from './util';


export default class AlliancesTable extends React.Component {
  render() {
    const {alliances} = this.props;

    if (!alliances || alliances.length === 0) {
      return <Typography variant="body1" style={{textAlign: 'center'}}>Alliances are not currently available</Typography>;
    }

    const rowStyle = {height: '2rem'};

    const colCount = Math.max(3, ...alliances.map((a) => a.teams.length));
    return <Table sx={{minWidth: '20em'}} key={1}>
      <TableHead>
        <TableRow style={rowStyle}>
          <PaddedCell>Seed</PaddedCell>
          <PaddedCell>Captain</PaddedCell>
          <PaddedCell>First Pick</PaddedCell>
          <PaddedCell>Second Pick</PaddedCell>
          {colCount > 3 ? <PaddedCell>Backup</PaddedCell> : null}
        </TableRow>
      </TableHead>
      <TableBody>
        {alliances.map((a) => {
          return <TableRow key={a.id} style={rowStyle}>
            <PaddedCell>{a.seed}</PaddedCell>
            { a.teams.map((team) => <PaddedCell key={team.number}>
              <TextLink to={`/teams/summary/${team.number}`}>{team.number} ({team.name})</TextLink>
            </PaddedCell> )}
            {Array(colCount - a.teams.length).fill(1).map((id) => <PaddedCell key={id}>&nbsp;</PaddedCell>)}
          </TableRow>;
        })}
      </TableBody>
    </Table>;
  }
}