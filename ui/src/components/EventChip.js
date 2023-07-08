import React from 'react';
import Chip from '@mui/material/Chip/Chip';

export default function ({event}) {
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
      label: Date.parse(event.start_date) > new Date() ? 'Upcoming' : 'Awaiting results'
    },
    canceled: {
      label: 'Canceled',
      color: 'secondary',
      variant: 'outlined'
    },
  };

  return <Chip style={{marginLeft: '1em'}} {...stateTag[event.aasm_state]}/>;

}