import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import CloseIcon from '@mui/icons-material/Close';

import IconButton from '@mui/material/IconButton';
import TextLink from './TextLink';
import type {components} from "../api/first-v3";
import {useTeam} from "../api";
import {PaddedCell} from "./util";

const allianceTitles = ['Captain: ', 'First Pick: ', 'Second Pick: ', 'Backup: '];

function AwardFinalist({seasonYear, finalist} : {
  seasonYear: string,
  finalist:  components['schemas']['ApiV3AwardRecipient']
}) {
  const { data: team } = useTeam(seasonYear, finalist?.team?.number)

  if(!finalist) {
    return <PaddedCell>&nbsp;</PaddedCell>;
  }

  return <>
    <b>{finalist.team ? <TextLink
        to={`/${seasonYear}/teams/${finalist.team.number}`}>{finalist.team.displayNumber} {team ? ` (${team.name})` : ''}</TextLink> : null}
        {finalist.name ? finalist.name : null}</b>
            { finalist.comment ? <p>
        Judges' comments: <br/>
        {finalist.comment}
      </p> : null }
    </>
  }

export default function AwardDetailsDialog({seasonYear, award, onClose}: {
  seasonYear: string,
  award?: components['schemas']['ApiV3Award'],
  onClose: () => void
}) {
  if (!award) {
    return null;
  }

  const finalistCount = award.recipients.length;
  const first = award.recipients.find((f) => f.place === 1);
  const second = award.recipients.find((f) => f.place === 2);
  const third = award.recipients.find((f) => f.place === 3);
  const isAlliance = award.name.includes('Alliance');

  return (
    <Dialog
        open={true}
        onClose={onClose}
        aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title" style={{display: 'flex', alignItems: 'center'}}>
        <Typography variant="h6" style={{flexGrow: 1}}>{award.name}</Typography>
        <IconButton onClick={onClose} size="large"><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent>
        <div>
          { award.description ? <p style={{marginTop: 0}}>
            {award.description}
          </p> : null }

          {finalistCount > 3 || isAlliance ? award.recipients.map((f) => <div>
            <b>{isAlliance && f.place != undefined ? allianceTitles[f.place - 1]: ''}</b> <AwardFinalist seasonYear={seasonYear} finalist={f} /></div>) : <>
            { first ? <div>
              <b>First place: </b><AwardFinalist seasonYear={seasonYear} finalist={first} />
            </div> : null }
            { first && second && !first.comment ? <br/> : null}
            { second ? <div>
            <b>Second place: </b><AwardFinalist seasonYear={seasonYear} finalist={second} />
          </div> : null }
            { second && third && !second.comment ? <br/> : null}
            { third ? <div>
              <b>Third place: </b><AwardFinalist seasonYear={seasonYear} finalist={third} />
            </div> : null }
          </> }

        </div>
      </DialogContent>
    </Dialog>
  );
}
