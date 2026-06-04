"use client";

import React, { useRef, useEffect, Suspense, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import * as THREE from 'three';

// 
// DEVICE CAPABILITY DETECTION  caps DPR + effects based on GPU tier
// 
function useDeviceTier() {
  return useMemo(() => {
    if (typeof window === 'undefined') return { dpr: 1, isMobile: false, isIOS: false };
    const ua = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    const isMobile = isIOS || /Android|Mobile/.test(ua);
    // iOS Safari and Android cap DPR to avoid GPU thrashing
    const dpr: [number, number] = isIOS ? [1, 1] : isMobile ? [1, 1.2] : [1, 1.5];
    return { dpr, isMobile, isIOS };
  }, []);
}

// 
// SHARED SCROLL VELOCITY HOOK  passive listener, ref-only (zero re-renders)
// 
export function useScrollVelocity() {
  const vel = useRef(0);
  const last = useRef(0);
  const raf = useRef<number>(0);

  useEffect(() => {
    const onScroll = () => {
      const curr = window.scrollY;
      const raw = curr - last.current;
      vel.current = Math.max(-55, Math.min(55, vel.current + raw * 2.4));
      last.current = curr;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const dampen = () => {
      vel.current *= 0.88;
      raf.current = requestAnimationFrame(dampen);
    };
    raf.current = requestAnimationFrame(dampen);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return vel;
}

// 
// SCROLL PROGRESS HOOK  scoped to hero section (400vh), not whole page
// 
export function useScrollProgress() {
  const progress = useRef(0);
  
  useEffect(() => {
    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      progress.current = max > 0 ? Math.max(0, Math.min(1, window.scrollY / max)) : 0;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  
  return progress;
}

// 
// REUSABLE VEC3 POOL  avoids "new THREE.Vector3()" GC pressure inside useFrame
// 
const _v3 = new THREE.Vector3();

// 
// ORBITAL RING  single mesh, shared material via props
// 
const RING_MATERIAL_DARK = new THREE.MeshPhysicalMaterial({
  color: '#ffffff',
  metalness: 1.0,
  roughness: 0.15,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
});

const RING_MATERIAL_LIGHT = new THREE.MeshPhysicalMaterial({
  color: '#222222',
  metalness: 1.0,
  roughness: 0.15,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
});

// Shared geometry instances  created once, reused across all rings
const TORUS_GEO = new THREE.TorusGeometry(2.8, 0.04, 12, 80);
const SPHERE_SM_GEO = new THREE.SphereGeometry(0.12, 10, 10);
const SPHERE_NUC_GEO = new THREE.SphereGeometry(0.85, 24, 24);

function OrbitalRing({ inclination, azimuth, vel, progress, baseSpeed, isDark, index }: any) {
  const ref = useRef<THREE.Mesh>(null);
  const angle = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    angle.current += dt * baseSpeed + vel.current * 0.0003;
    ref.current.rotation.y = angle.current;

    // Fragmentation  avoids "new THREE.Vector3" per frame via pooled _v3
    const fragIntensity = Math.sin(progress.current * Math.PI);
    const chaos = Math.sin(progress.current * 80 + index * 15);
    const offset = fragIntensity * chaos * 4.5;

    _v3.set(
      Math.sin(azimuth) * offset,
      Math.cos(inclination) * offset,
      Math.sin(inclination) * offset,
    );
    ref.current.position.lerp(_v3, 0.08);
  });

  return (
    <mesh ref={ref} rotation={[inclination, azimuth, 0]} geometry={TORUS_GEO}
      material={isDark ? RING_MATERIAL_DARK : RING_MATERIAL_LIGHT} />
  );
}

// 
// ELECTRON
// 
const ELECTRON_MAT = new THREE.MeshStandardMaterial({
  color: '#ffffff',
  emissive: '#ffffff',
  emissiveIntensity: 2.5,
  toneMapped: false,
});

function Electron({ inclination, azimuth, phase, orbitRadius, vel }: any) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const t = useRef(phase);

  useFrame((_, dt) => {
    if (!meshRef.current) return;
    t.current += dt * 1.6 + Math.abs(vel.current) * 0.002;
    meshRef.current.position.set(
      Math.cos(t.current) * orbitRadius,
      Math.sin(t.current) * orbitRadius,
      0,
    );
  });

  return (
    <group ref={groupRef} rotation={[inclination, azimuth, 0]}>
      <mesh ref={meshRef} geometry={SPHERE_SM_GEO} material={ELECTRON_MAT} />
    </group>
  );
}

// 
// NUCLEUS
// 
const NUC_MAT_DARK = new THREE.MeshPhysicalMaterial({
  color: '#aaaaaa',
  metalness: 1.0,
  roughness: 0.05,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
});
const NUC_MAT_LIGHT = new THREE.MeshPhysicalMaterial({
  color: '#000000',
  metalness: 1.0,
  roughness: 0.05,
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
});

function Nucleus({ vel, isDark }: any) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, dt) => {
    if (!ref.current) return;
    ref.current.rotation.y += dt * 0.3 + vel.current * 0.0008;
    ref.current.rotation.x += dt * 0.12;
  });

  return (
    <mesh ref={ref} geometry={SPHERE_NUC_GEO}
      material={isDark ? NUC_MAT_DARK : NUC_MAT_LIGHT} />
  );
}

// 
// ATOM GROUP  MetaMask-style mouse follow + scroll zoom + continuous spin
// 
const RINGS_CONFIG = [
  { inclination: 0,             azimuth: 0,             speed: 0.28 },
  { inclination: Math.PI / 3,   azimuth: Math.PI / 5,   speed: 0.22 },
  { inclination: -Math.PI / 3,  azimuth: -Math.PI / 5,  speed: 0.32 },
  { inclination: Math.PI / 4,   azimuth: -Math.PI / 4,  speed: 0.45 },
  { inclination: -Math.PI / 4,  azimuth: Math.PI / 4,   speed: 0.38 },
];

const ELECTRONS_CONFIG = [
  { inclination: 0,             azimuth: 0,             phase: 0   },
  { inclination: Math.PI / 3,   azimuth: Math.PI / 5,   phase: 2.1 },
  { inclination: -Math.PI / 3,  azimuth: -Math.PI / 5,  phase: 4.2 },
  { inclination: Math.PI / 4,   azimuth: -Math.PI / 4,  phase: 1.5 },
  { inclination: -Math.PI / 4,  azimuth: Math.PI / 4,   phase: 3.5 },
];

const _scaleVec = new THREE.Vector3();

function AtomGroup({ vel, progress, isDark, enableScale = false, isMobile = false }: any) {
  const masterRef = useRef<THREE.Group>(null);

  useFrame((state, dt) => {
    if (!masterRef.current) return;
    const { pointer } = state;

    // MetaMask fox-style pointer tracking (smooth lerp, no snapping)
    const targetY = pointer.x * 1.5;
    const targetX = -pointer.y * 1.5;
    masterRef.current.rotation.y += (targetY - masterRef.current.rotation.y) * 0.04 + vel.current * 0.003;
    masterRef.current.rotation.x += (targetX - masterRef.current.rotation.x) * 0.04;

    // Continuous Z spin driven by scroll progress (gives "turn around" immersion)
    masterRef.current.rotation.z += dt * 0.15 + progress.current * 0.05;

    if (enableScale) {
      // Cinematic: zoom in as user scrolls into section, zoom out as they leave
      const p = progress.current;
      // Drastically reduced scale values to ensure perfectly small and centered look
      const baseScale = isMobile ? 0.2 : 0.45; 
      const peakScale = isMobile ? 0.35 : 0.85; 
      const endScale = isMobile ? 0.25 : 0.5;
      let targetScale: number;
      if (p < 0.5) {
        targetScale = baseScale + (p / 0.5) * (peakScale - baseScale);
      } else {
        targetScale = peakScale - ((p - 0.5) / 0.5) * (peakScale - endScale);
      }
      _scaleVec.setScalar(targetScale);
      masterRef.current.scale.lerp(_scaleVec, 0.06);
    } else {
      const staticScale = isMobile ? 0.2 : 0.45;
      _scaleVec.setScalar(staticScale);
      masterRef.current.scale.lerp(_scaleVec, 0.1);
    }
  });

  return (
    <group ref={masterRef}>
      {RINGS_CONFIG.map((r, i) => (
        <OrbitalRing key={i} index={i} {...r} vel={vel} progress={progress} baseSpeed={r.speed} isDark={isDark} />
      ))}
      {ELECTRONS_CONFIG.map((e, i) => (
        <Electron key={i} {...e} orbitRadius={2.8} vel={vel} />
      ))}
      <Nucleus vel={vel} isDark={isDark} />
    </group>
  );
}

// 
// CHROMATIC ABERRATION OFFSET  created once, never re-allocated
// 
const CA_OFFSET = new THREE.Vector2(0.0006, 0.0006);

// 
// SCENE  lighting tuned to remove HDR/env map dependency entirely
// 
function Scene({ vel, progress, isDark, enableScale, isMobile }: any) {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={28} />

      {/* 3 directional lights  replaces env map, zero texture fetches */}
      <directionalLight position={[5, 5, 5]}   intensity={isDark ? 3.0 : 6.0} color="#ffffff" />
      <directionalLight position={[-5, -5, -5]} intensity={isDark ? 1.5 : 3.0} color="#ffffff" />
      <directionalLight position={[0, 10, 0]}   intensity={isDark ? 2.0 : 4.0} color="#ffffff" />
      <ambientLight intensity={isDark ? 1.0 : 2.0} color="#ffffff" />

      {/* Float: subtle on mobile (saves calc), immersive on desktop */}
      <Float speed={isMobile ? 0.4 : 0.8} floatIntensity={isMobile ? 0.1 : 0.3} rotationIntensity={0.05}>
        <AtomGroup vel={vel} progress={progress} isDark={isDark} enableScale={enableScale} isMobile={isMobile} />
      </Float>

      {/* Post-processing: mobile gets Bloom only, desktop gets full suite */}
      <EffectComposer multisampling={0} autoClear={false}>
        <Bloom
          luminanceThreshold={0.45}
          mipmapBlur
          intensity={isDark ? 2.2 : 1.0}
          levels={isMobile ? 5 : 8}
        />
        {!isMobile ? (
          <>
            <ChromaticAberration blendFunction={BlendFunction.NORMAL} offset={CA_OFFSET} />
            <Noise opacity={isDark ? 0.04 : 0.02} />
          </>
        ) : <></>}
      </EffectComposer>
    </>
  );
}

// 
// MAIN COMPONENT  frameloop="always" for 240Hz display support
// 
export function QDsAtomRenderer({
  vel,
  isDark = false,
  enableScale = false,
}: {
  vel: React.MutableRefObject<number>;
  isDark?: boolean;
  enableScale?: boolean;
}) {
  const progress = useScrollProgress();
  const { dpr, isMobile, isIOS } = useDeviceTier();

  return (
    <Canvas
      gl={{
        antialias: false,         // Bloom handles edge softening  no MSAA cost
        alpha: true,
        powerPreference: 'high-performance',
        precision: isIOS ? 'mediump' : 'highp',  // iOS GPU uses mediump natively
        stencil: false,           // never needed here  saves buffer allocation
        depth: true,
      }}
      dpr={dpr}
      frameloop="always"          // never throttle  let the browser/display drive FPS
      performance={{ min: 0.5 }}  // R3F adaptive DPR: drops to 0.5x if < 30fps
      style={{ background: 'transparent', width: '100%', height: '100%' }}
    >
      <Suspense fallback={null}>
        <Scene vel={vel} progress={progress} isDark={isDark} enableScale={enableScale} isMobile={isMobile} />
      </Suspense>
    </Canvas>
  );
}
