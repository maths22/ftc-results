import ScoreTable, {SeasonScore, toTitleCase} from './ScoreTable';
import type {components} from "../../api/v1";

const endLocationPoints = {
  NONE: 0,
  BACKSTAGE: 10,
  RIGGING: 20
};

function allianceToRobots(starts: ("NO_SHOW" | "NO_ROBOT" | "FRONT" | "MIDDLE" | "BACK")[] | undefined, teams: number[]): [number | undefined, number | undefined, number | undefined] {
  const robot1Pos = starts?.indexOf("FRONT")
  const robot2Pos = starts?.indexOf("MIDDLE")
  const robot3Pos = starts?.indexOf("BACK")

  return [
      robot1Pos != undefined ? teams[robot1Pos] : undefined,
      robot2Pos != undefined ? teams[robot2Pos] : undefined,
      robot3Pos != undefined ? teams[robot3Pos] : undefined,
  ]
}

// @ts-expect-error Not sure a trivial way to fix this right now but scoretable should be a component anyways...
const BaseScoreTable = ScoreTable<components['schemas']['CenterstageCriScore']>((match) => {
  const red_det = match.red_score_details;
  const blue_det = match.blue_score_details;

  const redRobots = allianceToRobots(match.red_starts, match.red_teams)
  const blueRobots = allianceToRobots(match.blue_starts, match.blue_teams)

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
      desc: `${redRobots[0] || 'No Robot'} | ${blueRobots[0] || 'No Robot'}<br/> Purple Spike Mark Pixel`,
      red: red_det.spike_mark_pixel1 ? (red_det.init_team_prop1 ? 'Team prop' : 'White pixel') : '-',
      blue: blue_det.spike_mark_pixel1 ? (blue_det.init_team_prop1 ? 'Team prop' : 'White pixel') : '-',
      red_pts: red_det.spike_mark_pixel1 ? (red_det.init_team_prop1 ? 20 : 10) : 0,
      blue_pts: blue_det.spike_mark_pixel1 ? (blue_det.init_team_prop1 ? 20 : 10) : 0
    },
    {
      desc: `${redRobots[1] || 'No Robot'} | ${blueRobots[1] || 'No Robot'}<br/> Purple Spike Mark Pixel`,
      red: red_det.spike_mark_pixel2 ? (red_det.init_team_prop2 ? 'Team prop' : 'White pixel') : '-',
      blue: blue_det.spike_mark_pixel2 ? (blue_det.init_team_prop2 ? 'Team prop' : 'White pixel') : '-',
      red_pts: red_det.spike_mark_pixel2 ? (red_det.init_team_prop2 ? 20 : 10) : 0,
      blue_pts: blue_det.spike_mark_pixel2 ? (blue_det.init_team_prop2 ? 20 : 10) : 0
    },
    {
      desc: `${redRobots[2] || 'No Robot'} | ${blueRobots[2] || 'No Robot'}<br/> Purple Spike Mark Pixel`,
      red: red_det.spike_mark_pixel3 ? (red_det.init_team_prop3 ? 'Team prop' : 'White pixel') : '-',
      blue: blue_det.spike_mark_pixel3 ? (blue_det.init_team_prop3 ? 'Team prop' : 'White pixel') : '-',
      red_pts: red_det.spike_mark_pixel3 ? (red_det.init_team_prop3 ? 20 : 10) : 0,
      blue_pts: blue_det.spike_mark_pixel3 ? (blue_det.init_team_prop3 ? 20 : 10) : 0
    },
    {
      desc: `${redRobots[0] || 'No Robot'} | ${blueRobots[0] || 'No Robot'}<br/> Yellow Backdrop Pixel`,
      red: red_det.target_backdrop_pixel1 ? (red_det.init_team_prop1 ? 'Team prop' : 'White pixel') : '-',
      blue: blue_det.target_backdrop_pixel1 ? (blue_det.init_team_prop1 ? 'Team prop' : 'White pixel') : '-',
      red_pts: red_det.target_backdrop_pixel1 ? (red_det.init_team_prop1 ? 20 : 10) : 0,
      blue_pts: blue_det.target_backdrop_pixel1 ? (blue_det.init_team_prop1 ? 20 : 10) : 0
    },
    {
      desc: `${redRobots[1] || 'No Robot'} | ${blueRobots[1] || 'No Robot'}<br/> Yellow Backdrop Pixel`,
      red: red_det.target_backdrop_pixel2 ? (red_det.init_team_prop2 ? 'Team prop' : 'White pixel') : '-',
      blue: blue_det.target_backdrop_pixel2 ? (blue_det.init_team_prop2 ? 'Team prop' : 'White pixel') : '-',
      red_pts: red_det.target_backdrop_pixel2 ? (red_det.init_team_prop2 ? 20 : 10) : 0,
      blue_pts: blue_det.target_backdrop_pixel2 ? (blue_det.init_team_prop2 ? 20 : 10) : 0
    },
    {
      desc: `${redRobots[2] || 'No Robot'} | ${blueRobots[2] || 'No Robot'}<br/> Yellow Backdrop Pixel`,
      red: red_det.target_backdrop_pixel3 ? (red_det.init_team_prop3 ? 'Team prop' : 'White pixel') : '-',
      blue: blue_det.target_backdrop_pixel3 ? (blue_det.init_team_prop3 ? 'Team prop' : 'White pixel') : '-',
      red_pts: red_det.target_backdrop_pixel3 ? (red_det.init_team_prop3 ? 20 : 10) : 0,
      blue_pts: blue_det.target_backdrop_pixel3 ? (blue_det.init_team_prop3 ? 20 : 10) : 0
    },
    {
      desc: `${redRobots[0] || 'No Robot'} | ${blueRobots[0] || 'No Robot'}<br/> Parking`,
      red: red_det.robot1_auto ? 'Backstage' : '-',
      blue: blue_det.robot1_auto ? 'Backstage' : '-',
      red_pts: red_det.robot1_auto ? 5 : 0,
      blue_pts: blue_det.robot1_auto ? 5 : 0,
    },
    {
      desc: `${redRobots[1] || 'No Robot'} | ${blueRobots[1] || 'No Robot'}<br/> Parking`,
      red: red_det.robot2_auto ? 'Backstage' : '-',
      blue: blue_det.robot2_auto ? 'Backstage' : '-',
      red_pts: red_det.robot2_auto ? 5 : 0,
      blue_pts: blue_det.robot2_auto ? 5 : 0,
    },
    {
      desc: `${redRobots[2] || 'No robot'} | ${blueRobots[2] || 'No robot'}<br/> Parking`,
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
      desc: `${redRobots[0] || 'No Robot'} | ${blueRobots[0] || 'No Robot'}<br/> Location`,
      red: toTitleCase(red_det.teleop_robot1),
      blue: toTitleCase(blue_det.teleop_robot1),
      red_pts: endLocationPoints[red_det.teleop_robot1],
      blue_pts: endLocationPoints[blue_det.teleop_robot1],
    },
    {
      desc: `${redRobots[1] || 'No Robot'} | ${blueRobots[1] || 'No Robot'}<br/> Location`,
      red: toTitleCase(red_det.teleop_robot2),
      blue: toTitleCase(blue_det.teleop_robot2),
      red_pts: endLocationPoints[red_det.teleop_robot2],
      blue_pts: endLocationPoints[blue_det.teleop_robot2],
    },
    {
      desc: `${redRobots[2] || 'No Robot'} | ${blueRobots[2] || 'No Robot'}<br/> Location`,
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
    match.phase == 'qual' ? {
      desc: 'Collage',
      red: red_det.collage ? '✓' : '-',
      blue: blue_det.collage ? '✓' : '-',
    } : null,
    match.phase == 'qual' ? {
      desc: 'Mural',
      red: red_det.mural ? '✓' : '-',
      blue: blue_det.mural ? '✓' : '-',
    } : null,
    match.phase == 'qual' ? {
      desc: 'Finale',
      red: red_det.finale ? '✓' : '-',
      blue: blue_det.finale ? '✓' : '-',
    } : null,
  ].filter(m => m != null);
});

export default function CenterstageCriScoreTable({match}: {
  match: SeasonScore<components['schemas']['CenterstageCriScore']>
}) {
  return <>
    <BaseScoreTable match={match}/>
    <small>
      Team-specific achievements are in rows labeled with "[red] | [blue]" for the applicable teams.
      Achievements that can be completed on both the alliance-specific backdrops and the shared backdrops are
      shown with "[alliance]/[shared]", and the points for both regions are added together.
    </small>
  </>
}