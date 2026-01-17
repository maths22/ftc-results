import {Component, lazy, Suspense} from 'react';

import Typography from '@mui/material/Typography';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';

import CloseIcon from '@mui/icons-material/Close';

import IconButton from '@mui/material/IconButton';
import {GOV_CUP_SEASON, useEvent, useMatchDetails, useSeason} from '../api';
import LoadingSpinner from './LoadingSpinner';
import type {components} from "../api/first-v3.d.ts";
import ErrorBoundary from "./ErrorBoundary";
import {useMediaQuery, useTheme} from "@mui/material";
import { useNavigate, useParams, useSearch } from '@tanstack/react-router';

const traditionalScoreTables = {
  'ApiV3RoverRuckusScoreDetail': lazy(() => import('./scoreTables/RoverRuckusScoreTable.ts')),
  'ApiV3SkystoneScoreDetail': lazy(() => import('./scoreTables/SkystoneScoreTable.ts')),
  'ApiV3UltimateGoalScoreDetail': null,
  'ApiV3FreightFrenzyScoreDetail': lazy(() => import('./scoreTables/FreightFrenzyScoreTable.ts')),
  'ApiV3PowerPlayScoreDetail': lazy(() => import('./scoreTables/PowerPlayScoreTable.ts')),
  'ApiV3CenterStageScoreDetail': lazy(() => import('./scoreTables/CenterstageScoreTable.ts')),
  'ApiV3IntoTheDeepScoreDetail': lazy(() => import('./scoreTables/IntoTheDeepScoreTable.ts')),
  'ApiV3DecodeScoreDetail': lazy(() => import('./scoreTables/DecodeScoreTable.tsx')),
}

const remoteScoreTables = {
  'ApiV3UltimateGoalRemoteScoreDetail': lazy(() => import('./scoreTables/UltimateGoalScoreRemoteTable.ts')),
  'ApiV3FreightFrenzyRemoteScoreDetail': lazy(() => import('./scoreTables/FreightFrenzyScoreRemoteTable.ts')),
  'ApiV3PowerPlayRemoteScoreDetail': null,
  'ApiV3CenterStageRemoteScoreDetail': null,
}

export default function MatchDetailsDialog() {
  const navigate = useNavigate();
  const seasonYear = GOV_CUP_SEASON;

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const search = useSearch({strict: false});
  const isOpen = 'matchDetails' in search
  const [eventCode, tournamentLevel, series, matchNumber] = isOpen ? search['matchDetails'].split('-') : [undefined, undefined, undefined, undefined];
  const hideMatchDetail = () => navigate({ search: { ...search, matchDetails: undefined } });
  const { isPending, isError, data: match } = useMatchDetails(seasonYear, eventCode, tournamentLevel, series, matchNumber);
  const { data: event } = useEvent(seasonYear, eventCode || '');
  const { data: season } = useSeason(seasonYear);
  if(isError) {
    return;
  }

  const ScoreTable = match && match.matchResultsDetails ? (match.type == 'ApiV3AllianceMatchDetails' ? traditionalScoreTables[match.matchResultsDetails.redDetails.type] : remoteScoreTables[match.matchResultsDetails.details.type]) : null;

  return (
    <Dialog
        onClose={hideMatchDetail}
        open={isOpen}
        aria-labelledby="form-dialog-title"
        fullScreen={fullScreen}
        maxWidth="md"
    >
      <DialogTitle id="form-dialog-title" style={{display: 'flex', alignItems: 'center'}}>
        <Typography variant="h6" component="span" style={{flexGrow: 1}}>Results for {event?.name} - Match {match?.shortName}</Typography>
        <IconButton onClick={hideMatchDetail} size="large"><CloseIcon/></IconButton>
      </DialogTitle>
      <DialogContent sx={{padding: '10px'}}>
        {isPending ? <LoadingSpinner /> : null}
        {isError ? <span>Error Loading match data</span> : null}
        {match ? <ErrorBoundary message={'Match details cannot be shown for this match'}>
          <Suspense fallback={<div>Loading...</div>}>
            {/* @ts-expect-error I wish I could figure out how to make this happy */}
            {ScoreTable ? <ScoreTable match={match} seasonYear={seasonYear}/> : <span>
              Score table is not defined for {season?.gameName}
            </span>}
          </Suspense>
        </ErrorBoundary> : null}
      </DialogContent>
    </Dialog>
  );
}