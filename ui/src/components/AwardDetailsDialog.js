import React, {Component} from 'react';

import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';

import CloseIcon from '@material-ui/icons/Close';

import withMobileDialog from '@material-ui/core/withMobileDialog';
import IconButton from '@material-ui/core/IconButton';
import TextLink from './TextLink';

class AwardDetailsDialog extends Component {


  render () {
    if(this.props.award == null) return null;

    const {award, match, fullScreen} = this.props;

    const lowestPlace = Math.min(...award.finalists.map((f) => f.place), 1);
    const finalistCount = award.finalists.length;
    const first = award.finalists.find((f) => f.place === lowestPlace);
    const second = award.finalists.find((f) => f.place === (lowestPlace + 1));
    const third = award.finalists.find((f) => f.place === (lowestPlace + 2));

    return <Dialog
        fullScreen={fullScreen}
        open={match !== null}
        onClose={this.props.onClose}
        aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title" disableTypography style={{display: 'flex', alignItems: 'center'}}>
        <Typography variant="h6" style={{flexGrow: 1}}>{award.name}</Typography>
        <IconButton onClick={this.props.onClose}><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent>
        <div>
          { award.description ? <p style={{marginTop: 0}}>
            {award.description}
          </p> : null }

          {finalistCount > 3 ? award.finalists.map((f) => <div>
              <b>{f.team ? <TextLink
                to={`/teams/summary/${f.team.number}`}>{f.team.number} ({f.team.name})</TextLink> : null}
                {f && f.recipient ? f.recipient : null}</b></div>) : <>
            { first ? <div>
              <b>First place: {first && first.team ? <TextLink
                  to={`/teams/summary/${first.team.number}`}>{first.team.number} ({first.team.name})</TextLink> : null}
                {first && first.recipient ? first.recipient : null}</b>
              { first.description ? <p>
                Judges' comments: <br/>
                {first.description}
              </p> : null }
            </div> : null }
            { first && second && !first.description ? <br/> : null}
            { second ? <div>
            <b>Second place: {second && second.team ? <TextLink
                to={`/teams/summary/${second.team.number}`}>{second.team.number} ({second.team.name})</TextLink> : null}
              {second && second.recipient ? second.recipient : null}</b>
          </div> : null }
            { second && third ? <br/> : null}
            { third ? <div>
              <b>Third place: {third && third.team ? <TextLink
                  to={`/teams/summary/${third.team.number}`}>{third.team.number} ({third.team.name})</TextLink> : null}
                {third && third.recipient ? third.recipient : null}</b>
            </div> : null }
          </> }

        </div>
      </DialogContent>
    </Dialog>;
  }
}


export default withMobileDialog()(AwardDetailsDialog);