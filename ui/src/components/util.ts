import {styled} from '@mui/material/styles';
import TableCell from '@mui/material/TableCell';
import { Temporal } from 'temporal-polyfill';

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

export function abbrevToState(abbrev?: string) : string | undefined {
  if(!abbrev) return undefined;

  const states: Record<string, string> = {
    'AL': 'Alabama',
    'AK': 'Alaska',
    'AZ': 'Arizona',
    'AR': 'Arkansas',
    'CA': 'California',
    'CO': 'Colorado',
    'CT': 'Connecticut',
    'DC': 'District of Columbia',
    'DE': 'Delaware',
    'FL': 'Florida',
    'GA': 'Georgia',
    'HI': 'Hawaii',
    'ID': 'Idaho',
    'IL': 'Illinois',
    'IN': 'Indiana',
    'IA': 'Iowa',
    'KS': 'Kansas',
    'KY': 'Kentucky',
    'LA': 'Louisiana',
    'ME': 'Maine',
    'MD': 'Maryland',
    'MA': 'Massachusetts',
    'MI': 'Michigan',
    'MN': 'Minnesota',
    'MS': 'Mississippi',
    'MO': 'Missouri',
    'MT': 'Montana',
    'NE': 'Nebraska',
    'NV': 'Nevada',
    'NH': 'New Hampshire',
    'NJ': 'New Jersey',
    'NM': 'New Mexico',
    'NY': 'New York',
    'NC': 'North Carolina',
    'ND': 'North Dakota',
    'OH': 'Ohio',
    'OK': 'Oklahoma',
    'OR': 'Oregon',
    'PA': 'Pennsylvania',
    'RI': 'Rhode Island',
    'SC': 'South Carolina',
    'SD': 'South Dakota',
    'TN': 'Tennessee',
    'TX': 'Texas',
    'UT': 'Utah',
    'VT': 'Vermont',
    'VA': 'Virginia',
    'WA': 'Washington',
    'WV': 'West Virginia',
    'WI': 'Wisconsin',
    'WY': 'Wyoming'
  }
  return states[abbrev] || abbrev;
}