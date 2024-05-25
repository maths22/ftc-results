import {Component, lazy, Suspense} from 'react';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import CloseIcon from '@mui/icons-material/Close';

import IconButton from '@mui/material/IconButton';
import {useMatchDetails} from '../api';
import LoadingSpinner from './LoadingSpinner';
import type {components} from "../api/v1";
import ErrorBoundary from "./ErrorBoundary";
import CenterstageScoreTable from "./scoreTables/CenterstageScoreTable";
import FreightFrenzyCriScoreTable from "./scoreTables/FreightFrenzyCriScoreTable";
import PowerPlayScoreTable from "./scoreTables/PowerPlayScoreTable";
import FreightFrenzyScoreTable from "./scoreTables/FreightFrenzyScoreTable";
import SkystoneScoreTable from "./scoreTables/SkystoneScoreTable";
import RoverRuckusCriScoreTable from "./scoreTables/RoverRuckusCriScoreTable";
import RoverRuckusScoreTable from "./scoreTables/RoverRuckusScoreTable";
import PowerPlayCriScoreTable from "./scoreTables/PowerPlayCriScoreTable";
import FreightFrenzyScoreRemoteTable from "./scoreTables/FreightFrenzyScoreRemoteTable";
import UltimateGoalScoreRemoteTable from "./scoreTables/UltimateGoalScoreRemoteTable";

const scoreTables = {
  'RoverRuckusScore': RoverRuckusScoreTable,
  'RoverRuckusCriScore': RoverRuckusCriScoreTable,
  'SkystoneScore': SkystoneScoreTable,
  'UltimateGoalScoreRemote': UltimateGoalScoreRemoteTable,
  'FreightFrenzyScore': FreightFrenzyScoreTable,
  'FreightFrenzyScoreRemote': FreightFrenzyScoreRemoteTable,
  'FreightFrenzyCriScore': FreightFrenzyCriScoreTable,
  'PowerPlayScore': PowerPlayScoreTable,
  'PowerPlayCriScore': PowerPlayCriScoreTable,
  'CenterstageScore': CenterstageScoreTable
}

export default function MatchDetailsDialog({event, matchName, onClose}: {
  event: components['schemas']['event'],
  matchName?: string,
  onClose: () => void
}) {
  const { isPending, isError, data: match } = useMatchDetails(event.season, event.slug, matchName);
  if(isError) {
    return;
  }

  const ScoreTable = match ? scoreTables[match.season_score_type] : null;

  return (
    <Dialog
        onClose={onClose}
        open={!!matchName}
        aria-labelledby="form-dialog-title"
        // maxWidth="xl" fullWidth
    >
      <DialogTitle id="form-dialog-title" style={{display: 'flex', alignItems: 'center'}}>
        <Typography variant="h6" style={{flexGrow: 1}}>Results for {event.name} - Match {matchName}</Typography>
        <IconButton onClick={onClose} size="large"><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent>
        {isPending ? <LoadingSpinner /> : null}
        {isError ? <span>Error Loading match data</span> : null}
        {match ? <ErrorBoundary message={'Match details cannot be shown for this match'}>
          <Suspense fallback={<div>Loading...</div>}>
            {/* @ts-expect-error I wish I could figure out how to make this happy */}
            {ScoreTable ? <ScoreTable match={match}/> : null}
          </Suspense>
        </ErrorBoundary> : null}
      </DialogContent>
    </Dialog>
  );
}