import Chip from '@mui/material/Chip';
import type {components} from "../api/first-v3";

export default function ({event} : {
  event: components['schemas']['ApiV3Event'] | components['schemas']['ApiV3SimpleEvent']
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
      label: Date.parse(event.startDate) > Date.now() ? 'Upcoming' : 'Awaiting results'
    },
  } as const;

  // API does not expose a concept of in_progress at the moment
  let state = event.published ? 'finalized'  as const : 'not_started' as const;

  return <Chip style={{marginLeft: '1em'}} {...stateTag[state]}/>;

}