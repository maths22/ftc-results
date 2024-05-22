import {styled} from '@mui/material/styles';
import TableCell from '@mui/material/TableCell/TableCell';

export const PaddedCell = styled(TableCell)(({theme}) => ({
  paddingLeft: theme.spacing(1),
  paddingRight: theme.spacing(1),
  textAlign: 'left',
  '&:last-child': {
    paddingRight: theme.spacing(1),
  },
  whiteSpace: 'pre-line'
}));
