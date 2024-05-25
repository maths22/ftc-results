import ScoreTable, {toTitleCase} from './ScoreTable';
import type {components} from "../../api/v1";

const endLocationPoints = {
  NONE: 0,
  BACKSTAGE: 5,
  RIGGING: 20
};

export default ScoreTable<components['schemas']['CenterstageScore']>((match) => {
  const red_det = match.red_score_details;
  const blue_det = match.blue_score_details;
  return [
    {
      desc: 'Robot 1 Parking',
      red: red_det.robot1_auto ? 'Backstage' : '-',
      blue: blue_det.robot1_auto ? 'Backstage' : '-',
      red_pts: red_det.robot1_auto ? 5 : 0,
      blue_pts: blue_det.robot1_auto ? 5 : 0,
    },
    {
      desc: 'Robot 2 Parking',
      red: red_det.robot2_auto ? 'Backstage' : '-',
      blue: blue_det.robot2_auto ? 'Backstage' : '-',
      red_pts: red_det.robot2_auto ? 5 : 0,
      blue_pts: blue_det.robot2_auto ? 5 : 0,
    },
    {
      desc: 'Auto Backdrop',
      red: red_det.auto_backdrop,
      blue: blue_det.auto_backdrop,
      value: 5
    },
    {
      desc: 'Auto Backstage',
      red: red_det.auto_backstage,
      blue: blue_det.auto_backstage,
      value: 3
    },
    {
      desc: 'Robot 1 Purple Spike Mark Pixel',
      red: red_det.spike_mark_pixel1 ? 'Yes' : 'No',
      blue: blue_det.spike_mark_pixel1 ? 'Yes' : 'No',
      red_pts: red_det.spike_mark_pixel1 ? 10 : 0,
      blue_pts: blue_det.spike_mark_pixel1 ? 10 : 0,
      bonus: {
        value: 10,
        redAccomplished: red_det.spike_mark_pixel1 && red_det.init_team_prop1,
        blueAccomplished: blue_det.spike_mark_pixel1 && blue_det.init_team_prop1,
        label: 'Using Team Prop'
      }
    },
    {
      desc: 'Robot 2 Purple Spike Mark Pixel',
      red: red_det.spike_mark_pixel2 ? 'Yes' : 'No',
      blue: blue_det.spike_mark_pixel2 ? 'Yes' : 'No',
      red_pts: red_det.spike_mark_pixel2 ? 10 : 0,
      blue_pts: blue_det.spike_mark_pixel2 ? 10 : 0,
      bonus: {
        value: 10,
        redAccomplished: red_det.spike_mark_pixel2 && red_det.init_team_prop2,
        blueAccomplished: blue_det.spike_mark_pixel2 && blue_det.init_team_prop2,
        label: 'Using Team Prop'
      }
    },
    {
      desc: 'Robot 1 Yellow Backdrop Pixel',
      red: red_det.target_backdrop_pixel1 ? 'Yes' : 'No',
      blue: blue_det.target_backdrop_pixel1 ? 'Yes' : 'No',
      red_pts: red_det.target_backdrop_pixel1 ? 10 : 0,
      blue_pts: blue_det.target_backdrop_pixel1 ? 10 : 0,
      bonus: {
        value: 10,
        redAccomplished: red_det.target_backdrop_pixel1 && red_det.init_team_prop1,
        blueAccomplished: blue_det.target_backdrop_pixel1 && blue_det.init_team_prop1,
        label: 'Using Team Prop'
      }
    },
    {
      desc: 'Robot 2 Yellow Backdrop Pixel',
      red: red_det.target_backdrop_pixel2 ? 'Yes' : 'No',
      blue: blue_det.target_backdrop_pixel2 ? 'Yes' : 'No',
      red_pts: red_det.target_backdrop_pixel2 ? 10 : 0,
      blue_pts: blue_det.target_backdrop_pixel2 ? 10 : 0,
      bonus: {
        value: 10,
        redAccomplished: red_det.target_backdrop_pixel2 && red_det.init_team_prop2,
        blueAccomplished: blue_det.target_backdrop_pixel2 && blue_det.init_team_prop2,
        label: 'Using Team Prop'
      }
    },
    {
      desc: 'Auto Total',
      red: match.red_score.auto,
      blue: match.blue_score.auto,
      key: true
    },
    {
      desc: 'Driver-controlled Backstage',
      red: red_det.teleop_backstage,
      blue: blue_det.teleop_backstage,
      value: 1
    },
    {
      desc: 'Driver-controlled Backdrop',
      red: red_det.teleop_backdrop,
      blue: blue_det.teleop_backdrop,
      value: 3
    },
    {
      desc: 'Mosaics',
      red: red_det.mosaics,
      blue: blue_det.mosaics,
      value: 10
    },
    {
      desc: 'Max Set Line',
      red: red_det.max_set_line,
      blue: blue_det.max_set_line,
      value: 10
    },
    {
      desc: 'Driver-controlled Total',
      red: match.red_score.teleop,
      blue: match.blue_score.teleop,
      key: true
    },
    {
      desc: 'Robot 1 Location',
      red: toTitleCase(red_det.teleop_robot1),
      blue: toTitleCase(blue_det.teleop_robot1),
      red_pts: endLocationPoints[red_det.teleop_robot1],
      blue_pts: endLocationPoints[blue_det.teleop_robot1],
    },
    {
      desc: 'Robot 2 Location',
      red: toTitleCase(red_det.teleop_robot2),
      blue: toTitleCase(blue_det.teleop_robot2),
      red_pts: endLocationPoints[red_det.teleop_robot2],
      blue_pts: endLocationPoints[blue_det.teleop_robot2],
    },
    {
      desc: 'Drone 1',
      red: red_det.drone1 ? `Zone ${red_det.drone1}` : '-',
      blue: blue_det.drone1 ? `Zone ${blue_det.drone1}` : '-',
      red_pts: (red_det.drone1 === 0 ? 0 : (4 - red_det.drone1) * 10),
      blue_pts: (blue_det.drone1 === 0 ? 0 : (4 - blue_det.drone1) * 10),
    },
    {
      desc: 'Drone 2',
      red: red_det.drone2 ? `Zone ${red_det.drone2}` : '-',
      blue: blue_det.drone2 ? `Zone ${blue_det.drone2}` : '-',
      red_pts: (red_det.drone2 === 0 ? 0 : (4 - red_det.drone2) * 10),
      blue_pts: (blue_det.drone2 === 0 ? 0 : (4 - blue_det.drone2) * 10),
    },
    {
      desc: 'Endgame Total',
      red: match.red_score.endgame,
      blue: match.blue_score.endgame,
      key: true
    },
    {
      desc: 'Minor Penalties',
      red: blue_det.minor_penalties,
      blue: red_det.minor_penalties,
      value: 10,
      penalty: true
    },
    {
      desc: 'Major Penalties',
      red: blue_det.major_penalties,
      blue: red_det.major_penalties,
      value: 30,
      penalty: true
    },
    {
      desc: 'Total Score',
      red: match.red_score_total,
      blue: match.blue_score_total,
      key: true
    }
  ];
});
