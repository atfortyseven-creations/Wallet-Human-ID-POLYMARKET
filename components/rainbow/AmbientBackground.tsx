"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import * as THREE from "three";

// 
// FLOATING PARTICLES  instanced mesh, single draw call, 50 particles
// 

// Shared geometry/material  created once at module scope
const ICOSA_GEO = new THREE.IcosahedronGeometry(0.2, 0);
const PARTICLE_MAT = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  emissive: '#ffffff',
  emissiveIntensity: 0.5,
  roughness: 0.5,
  metalness: 0.8,
  transparent: true,
  opacity: 0.3,
});

const COUNT = 40; // Reduced from 50  imperceptible difference, ~20% cheaper

function FloatingParticles() {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Pre-compute all particle data once  no allocations in useFrame
  const particles = useMemo(() =>
    Array.from({ length: COUNT }, () => ({
      x: (Math.random() - 0.5) * 20,
      y: (Math.random() - 0.5) * 20,
      z: (Math.random() - 0.5) * 10,
      rx: Math.random() * Math.PI,
      ry: Math.random() * Math.PI,
      scale: Math.random() * 0.5 + 0.2,
      speed: Math.random() * 0.02,
    })),
  []);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    // Use delta so speed is frame-rate independent at any Hz
    for (let i = 0; i < COUNT; i++) {
      const p = particles[i];
      p.y += p.speed * delta * 60; // normalised to ~60fps equivalent
      if (p.y > 10) p.y = -10;
      p.rx += p.speed * delta * 60;
      p.ry += p.speed * delta * 60;

      dummy.position.set(p.x, p.y, p.z);
      dummy.rotation.set(p.rx, p.ry, 0);
      dummy.scale.setScalar(p.scale);
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    }
    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[ICOSA_GEO, PARTICLE_MAT, COUNT]} />
  );
}

// 
// EXPORT
// 
export function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-black to-purple-900/20" />
      <Canvas
        camera={{ position: [0, 0, 10], fov: 45 }}
        gl={{
          antialias: false,
          powerPreference: 'high-performance',
          stencil: false,
          depth: true,
          alpha: false, // Opaque  no compositing cost since it's the base layer
        }}
        dpr={[1, 1.2]}
        performance={{ min: 0.5 }}
      >
        <color attach="background" args={['#000000']} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]}   intensity={1} color="#ff00ff" />
        <pointLight position={[-10, -10, -10]} intensity={1} color="#00ffff" />
        <FloatingParticles />
        <fog attach="fog" args={['#000000', 5, 20]} />
      </Canvas>
    </div>
  );
}
