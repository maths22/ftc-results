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
import {useMediaQuery, useTheme} from "@mui/material";
const scoreTables = {
  'RoverRuckusScore': lazy(() => import('./scoreTables/RoverRuckusScoreTable.ts')),
  'RoverRuckusCriScore': lazy(() => import('./scoreTables/RoverRuckusCriScoreTable.ts')),
  'SkystoneScore': lazy(() => import('./scoreTables/SkystoneScoreTable.ts')),
  'UltimateGoalScoreRemote': lazy(() => import('./scoreTables/UltimateGoalScoreRemoteTable.ts')),
  'FreightFrenzyScore': lazy(() => import('./scoreTables/FreightFrenzyScoreTable.ts')),
  'FreightFrenzyScoreRemote': lazy(() => import('./scoreTables/FreightFrenzyScoreRemoteTable.ts')),
  'FreightFrenzyCriScore': lazy(() => import('./scoreTables/FreightFrenzyCriScoreTable.ts')),
  'PowerPlayScore': lazy(() => import('./scoreTables/PowerPlayScoreTable.ts')),
  'PowerPlayCriScore': lazy(() => import('./scoreTables/PowerPlayCriScoreTable.tsx')),
  'CenterstageScore': lazy(() => import('./scoreTables/CenterstageScoreTable.ts')),
  'CenterstageCriScore': lazy(() => import('./scoreTables/CenterstageCriScoreTable.tsx'))
}

export default function MatchDetailsDialog({event, matchName, onClose}: {
  event: components['schemas']['event'],
  matchName?: string,
  onClose: () => void
}) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
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
        fullScreen={fullScreen}
    >
      <DialogTitle id="form-dialog-title" style={{display: 'flex', alignItems: 'center'}}>
        <Typography variant="h6" style={{flexGrow: 1}}>Results for {event.name} - Match {matchName}</Typography>
        <IconButton onClick={onClose} size="large"><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent sx={{padding: '10px'}}>
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