import Chip from '@mui/material/Chip/Chip';
import type {components} from "../api/v1";

export default function ({event} : {
  event: components['schemas']['event']
}) {
  const stateTag = {
    finalized: {
      label: 'Complete',
      color: 'primary'
    },
    in_progress: {
      label: 'In Progress',
      color: 'secondary'
    },
    not_started: {
      label: Date.parse(event.start_date) > Date.now() ? 'Upcoming' : 'Awaiting results'
    },
    canceled: {
      label: 'Canceled',
      color: 'secondary',
      variant: 'outlined'
    },
  } as const;

  return <Chip style={{marginLeft: '1em'}} {...stateTag[event.aasm_state]}/>;

}