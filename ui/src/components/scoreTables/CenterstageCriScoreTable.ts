import ScoreTable, {toTitleCase} from './ScoreTable';
import type {components} from "../../api/v1";

const endLocationPoints = {
  NONE: 0,
  BACKSTAGE: 10,
  RIGGING: 20
};

export default ScoreTable<components['schemas']['CenterstageCriScore']>((match) => {
  const red_det = match.red_score_details;
  const blue_det = match.blue_score_details;
  return [
    {
      desc: 'Auto Backdrop',
      red: `${red_det.auto_own_backdrop} / ${red_det.auto_shared_backdrop}`,
      blue: `${blue_det.auto_own_backdrop} / ${blue_det.auto_shared_backdrop}`,
      red_pts: 5 * (red_det.auto_own_backdrop + red_det.auto_shared_backdrop),
      blue_pts: 5 * (blue_det.auto_own_backdrop + blue_det.auto_shared_backdrop)
    },
    {
      desc: 'Auto Backstage',
      red: red_det.auto_backstage,
      blue: blue_det.auto_backstage,
      value: 3
    },
    {
      desc: 'Auto Mosaics',
      red: `${red_det.auto_own_mosaics} / ${red_det.auto_shared_mosaics}`,
      blue: `${blue_det.auto_own_mosaics} / ${blue_det.auto_shared_mosaics}`,
      red_pts: 10 * (red_det.auto_own_mosaics + red_det.auto_shared_mosaics),
      blue_pts: 10 * (blue_det.auto_own_mosaics + blue_det.auto_shared_mosaics)
    },
    {
      desc: 'Auto Set Bonus',
      red: `${red_det.auto_own_max_set_line} / ${red_det.auto_shared_max_set_line}`,
      blue: `${blue_det.auto_own_max_set_line} / ${blue_det.auto_shared_max_set_line}`,
      red_pts: 10 * (red_det.auto_own_max_set_line + red_det.auto_shared_max_set_line),
      blue_pts: 10 * (blue_det.auto_own_max_set_line + blue_det.auto_shared_max_set_line)
    },
    {
      desc: 'Robot 1 Purple Spike Mark Pixel',
      red: red_det.spike_mark_pixel1 ? (red_det.init_team_prop1 ? 'Yes - team prop' : 'Yes') : 'No',
      blue: blue_det.spike_mark_pixel1 ? (blue_det.init_team_prop1 ? 'Yes - team prop' : 'Yes') : 'No',
      red_pts: red_det.spike_mark_pixel1 ? (red_det.init_team_prop1 ? 20 : 10) : 0,
      blue_pts: blue_det.spike_mark_pixel1 ? (blue_det.init_team_prop1 ? 20 : 10) : 0
    },
    {
      desc: 'Robot 2 Purple Spike Mark Pixel',
      red: red_det.spike_mark_pixel2 ? (red_det.init_team_prop2 ? 'Yes - team prop' : 'Yes') : 'No',
      blue: blue_det.spike_mark_pixel2 ? (blue_det.init_team_prop2 ? 'Yes - team prop' : 'Yes') : 'No',
      red_pts: red_det.spike_mark_pixel2 ? (red_det.init_team_prop2 ? 20 : 10) : 0,
      blue_pts: blue_det.spike_mark_pixel2 ? (blue_det.init_team_prop2 ? 20 : 10) : 0
    },
    {
      desc: 'Robot 3 Purple Spike Mark Pixel',
      red: red_det.spike_mark_pixel3 ? (red_det.init_team_prop3 ? 'Yes - team prop' : 'Yes') : 'No',
      blue: blue_det.spike_mark_pixel3 ? (blue_det.init_team_prop3 ? 'Yes - team prop' : 'Yes') : 'No',
      red_pts: red_det.spike_mark_pixel3 ? (red_det.init_team_prop3 ? 20 : 10) : 0,
      blue_pts: blue_det.spike_mark_pixel3 ? (blue_det.init_team_prop3 ? 20 : 10) : 0
    },
    {
      desc: 'Robot 1 Yellow Backdrop Pixel',
      red: red_det.target_backdrop_pixel1 ? (red_det.init_team_prop1 ? 'Yes - team prop' : 'Yes') : 'No',
      blue: blue_det.target_backdrop_pixel1 ? (blue_det.init_team_prop1 ? 'Yes - team prop' : 'Yes') : 'No',
      red_pts: red_det.target_backdrop_pixel1 ? (red_det.init_team_prop1 ? 20 : 10) : 0,
      blue_pts: blue_det.target_backdrop_pixel1 ? (blue_det.init_team_prop1 ? 20 : 10) : 0
    },
    {
      desc: 'Robot 2 Yellow Backdrop Pixel',
      red: red_det.target_backdrop_pixel2 ? (red_det.init_team_prop2 ? 'Yes - team prop' : 'Yes') : 'No',
      blue: blue_det.target_backdrop_pixel2 ? (blue_det.init_team_prop2 ? 'Yes - team prop' : 'Yes') : 'No',
      red_pts: red_det.target_backdrop_pixel2 ? (red_det.init_team_prop2 ? 20 : 10) : 0,
      blue_pts: blue_det.target_backdrop_pixel2 ? (blue_det.init_team_prop2 ? 20 : 10) : 0
    },
    {
      desc: 'Robot 3 Yellow Backdrop Pixel',
      red: red_det.target_backdrop_pixel3 ? (red_det.init_team_prop3 ? 'Yes - team prop' : 'Yes') : 'No',
      blue: blue_det.target_backdrop_pixel3 ? (blue_det.init_team_prop3 ? 'Yes - team prop' : 'Yes') : 'No',
      red_pts: red_det.target_backdrop_pixel3 ? (red_det.init_team_prop3 ? 20 : 10) : 0,
      blue_pts: blue_det.target_backdrop_pixel3 ? (blue_det.init_team_prop3 ? 20 : 10) : 0
    },
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
      desc: 'Robot 3 Parking',
      red: red_det.robot3_auto ? 'Backstage' : '-',
      blue: blue_det.robot3_auto ? 'Backstage' : '-',
      red_pts: red_det.robot3_auto ? 5 : 0,
      blue_pts: blue_det.robot3_auto ? 5 : 0,
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
      red: `${red_det.teleop_own_backdrop} / ${red_det.teleop_shared_backdrop}`,
      blue: `${blue_det.teleop_own_backdrop} / ${blue_det.teleop_shared_backdrop}`,
      red_pts: 3 * (red_det.teleop_own_backdrop + red_det.teleop_shared_backdrop),
      blue_pts: 3 * (blue_det.teleop_own_backdrop + blue_det.teleop_shared_backdrop)
    },
    {
      desc: 'Driver-controlled Mosaics',
      red: `${red_det.teleop_own_mosaics} / ${red_det.teleop_shared_mosaics}`,
      blue: `${blue_det.teleop_own_mosaics} / ${blue_det.teleop_shared_mosaics}`,
      red_pts: 10 * (red_det.teleop_own_mosaics + red_det.teleop_shared_mosaics),
      blue_pts: 10 * (blue_det.teleop_own_mosaics + blue_det.teleop_shared_mosaics)
    },
    {
      desc: 'Driver-controlled Max Set Line',
      red: `${red_det.teleop_own_max_set_line} / ${red_det.teleop_shared_max_set_line}`,
      blue: `${blue_det.teleop_own_max_set_line} / ${blue_det.teleop_shared_max_set_line}`,
      red_pts: 10 * (red_det.teleop_own_max_set_line + red_det.teleop_shared_max_set_line),
      blue_pts: 10 * (blue_det.teleop_own_max_set_line + blue_det.teleop_shared_max_set_line)
    },
    {
      desc: 'Alliance-specific pixels',
      red: red_det.alliance_pixels,
      blue: blue_det.alliance_pixels
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
      desc: 'Robot 3 Location',
      red: toTitleCase(red_det.teleop_robot3),
      blue: toTitleCase(blue_det.teleop_robot3),
      red_pts: endLocationPoints[red_det.teleop_robot3],
      blue_pts: endLocationPoints[blue_det.teleop_robot3],
    },
    {
      desc: 'Drone 1',
      red: red_det.drone1 ? `Zone ${red_det.drone1}` : '-',
      blue: blue_det.drone1 ? `Zone ${blue_det.drone1}` : '-',
      red_pts: (red_det.drone1 === 0 ? 0 : (5 - red_det.drone1) * 10),
      blue_pts: (blue_det.drone1 === 0 ? 0 : (5 - blue_det.drone1) * 10),
    },
    {
      desc: 'Drone 2',
      red: red_det.drone2 ? `Zone ${red_det.drone2}` : '-',
      blue: blue_det.drone2 ? `Zone ${blue_det.drone2}` : '-',
      red_pts: (red_det.drone2 === 0 ? 0 : (5 - red_det.drone2) * 10),
      blue_pts: (blue_det.drone2 === 0 ? 0 : (5 - blue_det.drone2) * 10),
    },
    {
      desc: 'Drone 3',
      red: red_det.drone3 ? `Zone ${red_det.drone3}` : '-',
      blue: blue_det.drone3 ? `Zone ${blue_det.drone3}` : '-',
      red_pts: (red_det.drone3 === 0 ? 0 : (5 - red_det.drone3) * 10),
      blue_pts: (blue_det.drone3 === 0 ? 0 : (5 - blue_det.drone3) * 10),
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
    },
    {
      desc: 'Collage',
      red: red_det.collage ? 'Yes' : 'No',
      blue: blue_det.collage ? 'Yes' : 'No',
    },
    {
      desc: 'Mural',
      red: red_det.mural ? 'Yes' : 'No',
      blue: blue_det.mural ? 'Yes' : 'No',
    },
    {
      desc: 'Finale',
      red: red_det.finale ? 'Yes' : 'No',
      blue: blue_det.finale ? 'Yes' : 'No',
    }
  ];
});
