import React, {useMemo} from 'react';
import {Canvas, useFrame} from '@react-three/fiber';
import {useRef, useState} from 'react';

import {CameraControls, GizmoViewcube, GizmoViewport, Gltf, Html, PerspectiveCamera} from '@react-three/drei';

import fileUrl from './cri-2023-field-only.glb';
import redCone from './red-cone.glb';
import blueCone from './blue-cone.glb';
import transfomer from './transformer.glb';
import {CanvasTexture, MeshStandardMaterial, RepeatWrapping, Shape, Vector2} from 'three';
import {FullScreen, useFullScreenHandle} from 'react-full-screen';

const CONE_OFFSET = 0.03;
const GRID_OFFSET = 0.6;


const CylinderUVGenerator = {

  generateTopUV: function ( geometry, vertices, indexA, indexB, indexC ) {

    const a_x = vertices[ indexA * 3 ];
    const a_y = vertices[ indexA * 3 + 1 ];
    const b_x = vertices[ indexB * 3 ];
    const b_y = vertices[ indexB * 3 + 1 ];
    const c_x = vertices[ indexC * 3 ];
    const c_y = vertices[ indexC * 3 + 1 ];

    return [
      new Vector2( a_x, a_y ),
      new Vector2( b_x, b_y ),
      new Vector2( c_x, c_y )
    ];

  },

  generateSideWallUV: function ( geometry, vertices, indexA, indexB, indexC, indexD ) {
    const a_x = vertices[ indexA * 3 ];
    const a_y = vertices[ indexA * 3 + 1 ];
    const a_z = vertices[ indexA * 3 + 2 ];
    const b_x = vertices[ indexB * 3 ];
    const b_y = vertices[ indexB * 3 + 1 ];
    const b_z = vertices[ indexB * 3 + 2 ];
    const c_x = vertices[ indexC * 3 ];
    const c_y = vertices[ indexC * 3 + 1 ];
    const c_z = vertices[ indexC * 3 + 2 ];
    const d_x = vertices[ indexD * 3 ];
    const d_y = vertices[ indexD * 3 + 1 ];
    const d_z = vertices[ indexD * 3 + 2 ];

    return [
      new Vector2(Math.atan2(a_x, a_y) / (2 * Math.PI) + 0.5, 1),
      new Vector2(Math.atan2(b_x, b_y) / (2 * Math.PI) + 0.5, 1),
      new Vector2(Math.atan2(c_x, c_y) / (2 * Math.PI) + 0.5, 0),
      new Vector2(Math.atan2(d_x, d_y) / (2 * Math.PI) + 0.5, 0)
    ];
  }

};

function Beacon({position = [0,0,0], color, number, ...props}) {
  console.log(number);

  const shape = useMemo(() => {
    const arcShape = new Shape();
    arcShape.absarc(0, 0, 0.05, 0, Math.PI * 2, 0);
    const holePath = new Shape();
    holePath.absarc(0, 0, 0.04, 0, Math.PI * 2, 0);
    arcShape.holes.push(holePath);

    return arcShape;
  }, []);
  const colorName = color === 'red' ? 'red' : 'blue';

  const materials = useMemo(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.font = 'bold 70pt Arial';
    ctx.fillStyle = colorName;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'white';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(number, 0, canvas.height / 2);
    const texture = new CanvasTexture(canvas);
    texture.repeat.set(4, 1);
    texture.wrapS = RepeatWrapping;

    return [new MeshStandardMaterial({color: colorName}), new MeshStandardMaterial({map: texture})];
  }, [color, number]);

  const height = 0.04;
  const realPosition = [...position];
  realPosition[1] = realPosition[1] + height;

  return (
    <mesh rotation={[Math.PI / 2, 0, 0]} position={realPosition} {...props} material={materials}>
      <extrudeGeometry args={[shape, { depth: height, bevelEnabled: false, curveSegments: 48, UVGenerator: CylinderUVGenerator }]} />
    </mesh>
  );
}

export default function({grid, label, teamNumbers}) {
  const handle = useFullScreenHandle();
  return <FullScreen handle={handle}>
    <div style={{background: 'white'}}>
      <span>{label}
        <button onClick={() => handle.active ? handle.exit() : handle.enter() } style={{float: 'right'}}>
          {handle.active ? 'Exit fullscreen' : 'Enter Fullscreen'}
        </button>
      </span>
      <div style={{height: handle.active ? '95vh' : '20em'}}>
        <Canvas frameloop="demand">
          <PerspectiveCamera makeDefault position={[2, 6, 8]} />
          <CameraControls minDistance={1} maxDistance={10} distance={7}  />
          <ambientLight intensity={0.3} />
          <directionalLight position={[10, 10, 10]} intensity={0.5} />
          {/*<Box position={[0,0,0]}></Box>*/}
          {grid.map((row, i) =>
            row.map((col, j) =>
              col.map((el, k) => {
                const position = [-1.8 + GRID_OFFSET * i,-0.308 + CONE_OFFSET * k, -1.8 + GRID_OFFSET * j];
                let element = null;
                if(el === 'MY_CONE') {
                  element = redCone;
                } else if (el === 'OTHER_CONE') {
                  element = blueCone;
                } else if (el === 'TRANSFORMER') {
                  element = transfomer;
                } else {
                  const mine = el.startsWith('MY_');
                  const robotNumber = Number.parseInt(el.match('[0-9]')[0]);
                  element = <Beacon position={position} color={mine ? 'red' : 'blue'} number={`R ${robotNumber}`}/>;
                }
                if(element == null) {
                  return null;
                } else if(typeof element === 'string') {
                  return <Gltf src={element} receiveShadow castShadow position={position} rotation={[-Math.PI / 2, 0, 0]}/>;
                } else {
                  return element;
                }
              })
          ))}
          <Gltf src={fileUrl} receiveShadow castShadow position={[-0.478, -0.4, -5.802]} rotation={[-Math.PI / 2, 0, 0]}/>
        </Canvas>
      </div>
    </div>
  </FullScreen>;
}