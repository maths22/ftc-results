import TableRow from '@mui/material/TableRow/TableRow';
import Table from '@mui/material/Table/Table';
import TableHead from '@mui/material/TableHead/TableHead';
import TableBody from '@mui/material/TableBody/TableBody';
import React from 'react';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import AwardDetailsDialog from './AwardDetailsDialog';
import {PaddedCell} from './util';

const allianceTitles = ['Captain: ', 'First Pick: ', 'Second Pick: ', 'Backup: '];

export default class AwardsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {selectedAward: null};
  }

  showDetails = (a) => {
    this.setState({selectedAward: a});
  };

  render() {
    const {awards} = this.props;
    const {selectedAward} = this.state;

    if (!awards || awards.length === 0) {
      return <Typography variant="body1" style={{textAlign: 'center'}}>Awards are not currently available</Typography>;
    }

    const rowStyle = {height: '2rem'};


    return [<Table sx={{minWidth: '20em'}} key={1}>
      <TableHead>
        <TableRow style={rowStyle}>
          <PaddedCell>Name</PaddedCell>
          <PaddedCell>First Place</PaddedCell>
          <PaddedCell>Second Place</PaddedCell>
          <PaddedCell>Third Place</PaddedCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {awards.map((a) => {
          const lowestPlace = Math.min(...a.finalists.map((f) => f.place), 1);
          const finalistCount = a.finalists.length;
          const first = a.finalists.find((f) => f.place === lowestPlace);
          const second = a.finalists.find((f) => f.place === (lowestPlace + 1));
          const third = a.finalists.find((f) => f.place === (lowestPlace + 2));
          const isNameLink = a.description || (first && first.description);
          const isAlliance = a.name.includes('Alliance');
          const nameCell = <PaddedCell>{isNameLink ?
            <TextLink onClick={() => this.showDetails(a)}>{a.name}</TextLink> : a.name}</PaddedCell>;
          if(finalistCount > 3 || isAlliance) {
            return <TableRow key={a.id} style={rowStyle}>
              {nameCell}
              <PaddedCell>
                {a.finalists.map((f) => <>
                  {isAlliance ? allianceTitles[f.place - 1]: ''}
                  {f && f.recipient ? f.recipient : null}
                  {f && f.team ? <><TextLink
                    to={`/teams/summary/${f.team.number}`}>{f.team.number} ({f.team.name})</TextLink></> : null}
                    <br/>
                  </>)}
              </PaddedCell>
              <PaddedCell/>
              <PaddedCell/>
            </TableRow>;
          }

          return <TableRow key={a.id} style={rowStyle}>
            {nameCell}
            <PaddedCell>
              {first && first.recipient ? first.recipient : null}
              {first && first.team ? <TextLink
                  to={`/teams/summary/${first.team.number}`}>{first.team.number} ({first.team.name})</TextLink> : null}
            </PaddedCell>
            <PaddedCell>
              {second && second.recipient ? second.recipient : null}
              {second && second.team ? <TextLink
                  to={`/teams/summary/${second.team.number}`}>{second.team.number} ({second.team.name})</TextLink> : null}
            </PaddedCell>
            <PaddedCell>
              {third && third.recipient ? third.recipient : null}
              {third && third.team ? <TextLink
                  to={`/teams/summary/${third.team.number}`}>{third.team.number} ({third.team.name})</TextLink> : null}
            </PaddedCell>
          </TableRow>;
        })}
      </TableBody>
    </Table>, <AwardDetailsDialog key={2} award={selectedAward} onClose={() => this.setState({selectedAward: null})}/>];
  }
}
