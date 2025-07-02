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

export function stringToDate(str: string) {
  const parts = str.split('-');
  return new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
}
