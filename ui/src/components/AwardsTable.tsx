import TableRow from '@mui/material/TableRow/TableRow';
import Table from '@mui/material/Table/Table';
import TableHead from '@mui/material/TableHead/TableHead';
import TableBody from '@mui/material/TableBody/TableBody';
import {useState} from 'react';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import AwardDetailsDialog from './AwardDetailsDialog';
import {PaddedCell} from './util';
import {createLazyRoute, useParams} from "@tanstack/react-router";
import {useEventAwards, useTeam} from "../api";
import type {components} from "../api/v1";
import LoadingSpinner from "./LoadingSpinner";

const allianceTitles = ['Captain: ', 'First Pick: ', 'Second Pick: ', 'Backup: '];

function AwardFinalist({finalist} : {
  finalist?:  components['schemas']['awardFinalist']
}) {
  const { data: team } = useTeam(finalist?.team_id)

  if(!finalist) {
    return <PaddedCell>&nbsp;</PaddedCell>;
  }

  return <PaddedCell>
    {finalist.recipient ? finalist.recipient : null}
    {finalist.team_id ? <TextLink
        to={`/teams/${finalist.team_id}`}>{finalist.team_id}{team ? ` (${team.name})` : ''}</TextLink> : null}
  </PaddedCell>
}

function CompactAwardFinalist({finalist, isAlliance} : {
  finalist:  components['schemas']['awardFinalist'],
  isAlliance: boolean
}) {
  const { data: team } = useTeam(finalist.team_id)

  if(!finalist) {
    return <PaddedCell>&nbsp;</PaddedCell>;
  }

  return <div>
    {isAlliance ? allianceTitles[finalist.place - 1] : ''}
    {finalist.recipient ? finalist.recipient : null}
    {finalist.team_id ? <><TextLink
        to={`/teams/${finalist.team_id}`}>{finalist.team_id}{team ? ` (${team.name})` : ''}</TextLink></> : null}
    <br/>
  </div>
}

function AwardRow({award, showDetails}: {
  award: components['schemas']['award'],
  showDetails: (award: components['schemas']['award']) => void
}) {

  const lowestPlace = Math.min(...award.finalists.map((f) => f.place), 1);
  const finalistCount = award.finalists.length;
  const first = award.finalists.find((f) => f.place === lowestPlace);
  const second = award.finalists.find((f) => f.place === (lowestPlace + 1));
  const third = award.finalists.find((f) => f.place === (lowestPlace + 2));
  const isNameLink = award.description || (first && first.description);
  const isAlliance = award.name.includes('Alliance');
  const nameCell = <PaddedCell>{isNameLink ?
      <TextLink onClick={() => showDetails(award)}>{award.name}</TextLink> : award.name}</PaddedCell>;
  if(finalistCount > 3 || isAlliance) {
    return <TableRow style={{height: '2rem'}}>
      {nameCell}
      <PaddedCell>
        {award.finalists.map((f) => <CompactAwardFinalist key={f.place} finalist={f} isAlliance={isAlliance} /> )}
      </PaddedCell>
      <PaddedCell/>
      <PaddedCell/>
    </TableRow>;
  }

  return <TableRow style={{height: '2rem'}}>
    {nameCell}
    <AwardFinalist finalist={first} />
    <AwardFinalist finalist={second} />
    <AwardFinalist finalist={third} />
  </TableRow>;
}

export default function AwardsTable() {
  const [selectedAward, setSelectedAward] = useState<components['schemas']['award']>();
  const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });

  const { data: awards, isLoading } = useEventAwards(seasonYear, slug);

  if(isLoading) {
    return <LoadingSpinner />
  }

  if (!awards || awards.length === 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>Awards are not currently available</Typography>;
  }

  return <>
    <Table sx={{minWidth: '20em'}}>
      <TableHead>
        <TableRow style={{height: '2rem'}}>
          <PaddedCell>Name</PaddedCell>
          <PaddedCell>First Place</PaddedCell>
          <PaddedCell>Second Place</PaddedCell>
          <PaddedCell>Third Place</PaddedCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {awards.map((a) => <AwardRow key={a.id} award={a} showDetails={(a) => setSelectedAward(a)}/>)}
      </TableBody>
    </Table>
    <AwardDetailsDialog award={selectedAward} onClose={() => setSelectedAward(undefined)}/>
  </>;
}

export const Route = createLazyRoute("/$season/events/$slug/alliances")({
  component: AwardsTable
})
