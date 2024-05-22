import TableRow from '@mui/material/TableRow/TableRow';
import Table from '@mui/material/Table/Table';
import TableHead from '@mui/material/TableHead/TableHead';
import TableBody from '@mui/material/TableBody/TableBody';
import React from 'react';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import uniq from 'lodash/uniq';
import {PaddedCell} from './util';

export default function TeamsTable({teams, showDivisionAssignments, divisions, onClickDivision}) {
  if(!teams || teams.length === 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>Team list is not currently available</Typography>;
  }

  const rowStyle = { height: '2rem' };


  return <Table sx={{minWidth: '20em'}} size="small">
    <TableHead>
      <TableRow style={rowStyle}>
        { showDivisionAssignments ? <PaddedCell>Division</PaddedCell> : null }
        <PaddedCell>Team Number</PaddedCell>
        <PaddedCell>Team Name</PaddedCell>
        <PaddedCell>Location</PaddedCell>
        <PaddedCell>Organization</PaddedCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {teams.sort((a, b) => a.team.number - b.team.number).map((td) => {
        const t = td.team;
        const division = divisions.find((d) => d.slug === td.division);
        return <TableRow key={t.number} style={rowStyle}>
          { showDivisionAssignments && division ? <PaddedCell>
            <TextLink onClick={() => onClickDivision(division.slug)}>{division.name}</TextLink>
          </PaddedCell> : ( showDivisionAssignments ? <PaddedCell/> : null) }
          <PaddedCell>
            <TextLink to={`/teams/summary/${t.number}`}>{t.number}</TextLink>
          </PaddedCell>
          <PaddedCell>{t.name}</PaddedCell>
          <PaddedCell>{[t.city, t.state, t.country].join(', ')}</PaddedCell>
          <PaddedCell>{t.organization ? uniq(t.organization.split('&').map((s) => s.trim())).join('\n') : null}</PaddedCell>
        </TableRow>;
      })}
    </TableBody>
  </Table>;
}
