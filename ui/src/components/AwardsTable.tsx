import TableRow from '@mui/material/TableRow';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableBody from '@mui/material/TableBody';
import {useState} from 'react';
import TextLink from './TextLink';
import Typography from '@mui/material/Typography';
import AwardDetailsDialog from './AwardDetailsDialog';
import {PaddedCell} from './util';
import {createLazyRoute, useParams} from "@tanstack/react-router";
import {useEventAwards, useTeam} from "../api";
import type {components} from "../api/first-v3";
import LoadingSpinner from "./LoadingSpinner";

const allianceTitles = ['Captain: ', 'First Pick: ', 'Second Pick: ', 'Backup: '];

function AwardFinalist({seasonYear, finalist} : {
  seasonYear: string,
  finalist?:  components['schemas']['ApiV3AwardRecipient']
}) {
  const { data: team } = useTeam(seasonYear, finalist?.team?.number)

  if(!finalist) {
    return <PaddedCell>&nbsp;</PaddedCell>;
  }

  return <PaddedCell>
    {finalist.name ? finalist.name : null}
    {finalist.name && finalist.team ? <br/> : null}
    {finalist.team ? <TextLink
        to={`/${seasonYear}/teams/${finalist.team.number}`}>{finalist.team.displayNumber}{team ? ` (${team.name})` : ''}</TextLink> : null}
  </PaddedCell>
}

function CompactAwardFinalist({seasonYear, finalist, isAlliance} : {
  seasonYear: string,
  finalist:  components['schemas']['ApiV3AwardRecipient'],
  isAlliance: boolean
}) {
  const { data: team } = useTeam(seasonYear, finalist.team?.number)

  if(!finalist) {
    return <PaddedCell>&nbsp;</PaddedCell>;
  }

  return <div>
    {isAlliance && finalist.place != undefined ? allianceTitles[finalist.place - 1] : ''}
    {finalist.name ? <>{finalist.name}&nbsp;</> : null}
    {finalist.team ? <><TextLink
        to={`/${seasonYear}/teams/${finalist.team.number}`}>{finalist.team.displayNumber}{team ? ` (${team.name})` : ''}</TextLink></> : null}
    <br/>
  </div>
}

function AwardRow({seasonYear, award, showDetails}: {
  seasonYear: string,
  award: components['schemas']['ApiV3Award'],
  showDetails: (award: components['schemas']['ApiV3Award']) => void
}) {
  const finalistCount = award.recipients.length;
  const isNameLink = award.description || award.recipients.some(r => r.comment);
  const isAlliance = award.name.includes('Alliance');
  const nameCell = <PaddedCell>{isNameLink ?
      <TextLink onClick={() => showDetails(award)}>{award.name}</TextLink> : award.name}</PaddedCell>;
  if(finalistCount > 3 || isAlliance || !award.ordered) {
    return <TableRow style={{height: '2rem'}}>
      {nameCell}
      <PaddedCell>
        {award.recipients.map((f, idx) => <CompactAwardFinalist key={idx} seasonYear={seasonYear} finalist={f} isAlliance={isAlliance} /> )}
      </PaddedCell>
      <PaddedCell/>
      <PaddedCell/>
    </TableRow>;
  }

  return <TableRow style={{height: '2rem'}}>
    {nameCell}
    <AwardFinalist seasonYear={seasonYear} finalist={award.recipients.find(r => r.place === 1)} />
    <AwardFinalist seasonYear={seasonYear} finalist={award.recipients.find(r => r.place === 2)} />
    <AwardFinalist seasonYear={seasonYear} finalist={award.recipients.find(r => r.place === 3)} />
  </TableRow>;
}

export default function AwardsTable() {
  const [selectedAward, setSelectedAward] = useState<components['schemas']['ApiV3Award']>();
  const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });

  const { data: awards, isLoading } = useEventAwards(seasonYear, slug);

  if(isLoading) {
    return <LoadingSpinner />
  }

  if (!awards || awards.length === 0) {
    return <Typography variant="body1" style={{textAlign: 'center'}}>Awards are not currently available</Typography>;
  }
  console.log(awards)

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
        {awards.map((a, idx) => <AwardRow key={idx} seasonYear={seasonYear} award={a} showDetails={(a) => setSelectedAward(a)}/>)}
      </TableBody>
    </Table>
    <AwardDetailsDialog seasonYear={seasonYear} award={selectedAward} onClose={() => setSelectedAward(undefined)}/>
  </>;
}

export const Route = createLazyRoute("/$season/events/$slug/alliances")({
  component: AwardsTable
})
