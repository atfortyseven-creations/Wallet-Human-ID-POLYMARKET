"use client";

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// 
// Starfield  each star is one BoxGeometry (streak), rendered as individual meshes.
// 800 meshes  each has its own draw call. This is fine for a fixed background.
// Star count reduced 800400 for mobile safety. Still visually full and dense.
// 

// Shared geometry and material  created ONCE at module scope
const STAR_GEO  = new THREE.BoxGeometry(0.8, 0.8, 40);
const STAR_MAT_WHITE = new THREE.MeshBasicMaterial({
  color: '#ffffff',
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});
const STAR_MAT_BLUE = new THREE.MeshBasicMaterial({
  color: '#60a5fa',
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  depthWrite: false,
});

// Pre-compute star data at module scope  no allocation inside components
const STAR_COUNT = 400;
const starData = (() => {
  const rand = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
  return Array.from({ length: STAR_COUNT }, (_, i) => {
    const angle  = rand() * Math.PI * 2;
    const radius = rand() * 500 + 50;
    return {
      x:      Math.cos(angle) * radius,
      y:      Math.sin(angle) * radius,
      z:      rand() * -2000,
      angle,
      speed:  rand() * 0.8 + 0.2,
      isBlue: i % 10 === 0,
    };
  });
})();

function Star({ idx }: { idx: number }) {
  const mesh = useRef<THREE.Mesh>(null!);
  const d    = starData[idx];

  useFrame((_, delta) => {
    const m = mesh.current;
    // delta-correct motion  same speed at 60, 120, or 240 Hz
    const spd = d.speed * delta;
    m.position.z += spd * 2000;
    m.position.x += Math.cos(d.angle) * spd * 100;
    m.position.y += Math.sin(d.angle) * spd * 100;

    if (m.position.z > 500) {
      m.position.z = -1500;
      const r = (crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296) * 500 + 50;
      m.position.x = Math.cos(d.angle) * r;
      m.position.y = Math.sin(d.angle) * r;
    }
    m.scale.z = 1 + d.speed * 10;
  });

  return (
    <mesh
      ref={mesh}
      geometry={STAR_GEO}
      material={d.isBlue ? STAR_MAT_BLUE : STAR_MAT_WHITE}
      position={[d.x, d.y, d.z]}
      rotation={[0, 0, d.angle]}
    />
  );
}

// Memoized scene  star list never changes
const StarfieldScene = React.memo(function StarfieldScene() {
  const indices = useMemo(() => Array.from({ length: STAR_COUNT }, (_, i) => i), []);
  return (
    <>
      <color attach="background" args={['#000000']} />
      {indices.map(i => <Star key={i} idx={i} />)}
      <fog attach="fog" args={['#000000', 100, 1500]} />
    </>
  );
});

export default function Starfield() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas
        camera={{ position: [0, 0, 500], fov: 75, near: 0.1, far: 2000 }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: false, // Stars have no depth relationship  saves depth buffer
          alpha: false,
        }}
        dpr={[1, 1.5]}
        performance={{ min: 0.5 }}
      >
        <StarfieldScene />
      </Canvas>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_90%)] pointer-events-none" />
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />
    </div>
  );
}
