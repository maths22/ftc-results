import {styled} from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';

export const PaddedCell = styled(TableCell)(({theme}) => ({
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  textAlign: 'left',
  '&:last-child': {
    paddingRight: theme.spacing(1),
  },
  whiteSpace: 'pre-line'
}));

export const CompactCell = styled(TableCell)(({theme}) => ({
  paddingTop: theme.spacing(0.5),
  paddingBottom: theme.spacing(0.5),
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  textAlign: 'left',
  '&:last-child': {
    paddingRight: theme.spacing(1),
  },
  whiteSpace: 'pre-line'
}));

export function isEventHappening(startDate: string, endDate: string) {
  const today = Temporal.Now.plainDateISO();
  const isHappening = Temporal.PlainDate.compare(Temporal.PlainDate.from(startDate), today) <= 0
      && Temporal.PlainDate.compare(Temporal.PlainDate.from(endDate), today) >= 0;
  return isHappening;
}
