import {Component, lazy, Suspense} from 'react';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import CloseIcon from '@mui/icons-material/Close';

import IconButton from '@mui/material/IconButton';
import {useEvent, useMatchDetails} from '../api';
import LoadingSpinner from './LoadingSpinner';
import type {components} from "../api/v1";
import ErrorBoundary from "./ErrorBoundary";
import {useMediaQuery, useTheme} from "@mui/material";
import {useNavigate, useSearch} from "@tanstack/react-router";
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
  'CenterstageCriScore': lazy(() => import('./scoreTables/CenterstageCriScoreTable.tsx')),
  'IntoTheDeepScore': lazy(() => import('./scoreTables/IntoTheDeepScoreTable.ts')),
  'IntoTheDeepCriScore': lazy(() => import('./scoreTables/IntoTheDeepCriScoreTable.ts')),
  'DecodeScore': lazy(() => import('./scoreTables/DecodeScoreTable.tsx')),
  'DecodeCriScore': lazy(() => import('./scoreTables/DecodeCriScoreTable.tsx'))
}

export default function MatchDetailsDialog() {
  const navigate = useNavigate();

  const search = useSearch({strict: false});
  const isOpen = 'matchDetails' in search
  const [season, eventCode, matchName] = isOpen ? search['matchDetails'].split('_') : [undefined, undefined, undefined];

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const hideMatchDetail = () => navigate({ search: { ...search, matchDetails: undefined } });
  // TODO fix division bug
  const { isPending, isError, data: match } = useMatchDetails(season, eventCode, matchName);
  const { data: event } = useEvent(season, eventCode || '');
  if(isError) {
    return;
  }

  const ScoreTable = match ? scoreTables[match.season_score_type] : null;

  return (
    <Dialog
        onClose={hideMatchDetail}
        open={isOpen}
        aria-labelledby="form-dialog-title"
        fullScreen={fullScreen}
        maxWidth="md"
    >
      <DialogTitle id="form-dialog-title" style={{display: 'flex', alignItems: 'center'}}>
        <Typography variant="h6" component="span" style={{flexGrow: 1}}>Results for {event?.name} - Match {matchName}</Typography>
        <IconButton onClick={hideMatchDetail} size="large"><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent sx={{padding: '10px'}}>
        {isPending ? <LoadingSpinner /> : null}
        {isError ? <span>Error Loading match data</span> : null}
        {match ? <ErrorBoundary message={'Match details cannot be shown for this match'}>
          <Suspense fallback={<div>Loading...</div>}>
            {/* @ts-expect-error I wish I could figure out how to make this happy */}
            {ScoreTable ? <ScoreTable match={match}/> : <span>
              Score table is not defined for {match.season_score_type}
            </span>}
          </Suspense>
        </ErrorBoundary> : null}
      </DialogContent>
    </Dialog>
  );
}