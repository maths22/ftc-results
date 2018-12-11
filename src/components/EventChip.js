import React from 'react';
import Chip from '@material-ui/core/Chip/Chip';

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
  };

  return <Chip style={{marginLeft: '1em'}} {...stateTag[event.aasm_state]}/>

}