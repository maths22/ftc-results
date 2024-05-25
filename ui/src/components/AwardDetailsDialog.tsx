import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import CloseIcon from '@mui/icons-material/Close';

import IconButton from '@mui/material/IconButton';
import TextLink from './TextLink';
import type {components} from "../api/v1";
import {useTeam} from "../api";
import {PaddedCell} from "./util";

const allianceTitles = ['Captain: ', 'First Pick: ', 'Second Pick: ', 'Backup: '];

function AwardFinalist({finalist} : {
  finalist:  components['schemas']['awardFinalist']
}) {
  const { data: team } = useTeam(finalist?.team_id)

  if(!finalist) {
    return <PaddedCell>&nbsp;</PaddedCell>;
  }

  return <b>{finalist.team_id ? <TextLink
      to={`/teams/${finalist.team_id}`}>{finalist.team_id} {team ? ` (${team.name})` : ''}</TextLink> : null}
    {finalist.recipient ? finalist.recipient : null}</b>
}

export default function AwardDetailsDialog({award, onClose}: {
  award?: components['schemas']['award'],
  onClose: () => void
}) {
  if (!award) {
    return null;
  }

  const lowestPlace = Math.min(...award.finalists.map((f) => f.place), 1);
  const finalistCount = award.finalists.length;
  const first = award.finalists.find((f) => f.place === lowestPlace);
  const second = award.finalists.find((f) => f.place === (lowestPlace + 1));
  const third = award.finalists.find((f) => f.place === (lowestPlace + 2));
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

          {finalistCount > 3 || isAlliance ? award.finalists.map((f) => <div>
            <b>{isAlliance ? allianceTitles[f.place - 1]: ''}</b> <AwardFinalist finalist={f} /></div>) : <>
            { first ? <div>
              <b>First place: </b><AwardFinalist finalist={first} />
              { first.description ? <p>
                Judges' comments: <br/>
                {first.description}
              </p> : null }
            </div> : null }
            { first && second && !first.description ? <br/> : null}
            { second ? <div>
            <b>Second place: </b><AwardFinalist finalist={second} />
          </div> : null }
            { second && third ? <br/> : null}
            { third ? <div>
              <b>Third place: </b><AwardFinalist finalist={third} />
            </div> : null }
          </> }

        </div>
      </DialogContent>
    </Dialog>
  );
}
