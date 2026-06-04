"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";

// 
// VERTEX SHADER  GPU runs this for every single particle simultaneously
// 
const VERTEX_SHADER = `
  uniform float uTime;
  uniform float uExplode;
  uniform vec2  uMouse;
  uniform float uSize;

  attribute float aScale;
  attribute float aSpeed;
  attribute float aOffset;
  attribute vec3  aRandom;
  attribute float aIsGold;

  varying float vScale;
  varying float vDepth;
  varying float vIsGold;
  varying float vAlpha;

  void main() {
    vScale  = aScale;
    vIsGold = aIsGold;

    // Sphere surface position from attribute
    vec3 spherePos = position;

    // Explosion target: scatter in random direction
    vec3 explodeDir = normalize(aRandom) * (600.0 + aOffset * 900.0);
    float t = smoothstep(0.0, 1.0, uExplode * aSpeed);
    vec3 pos = mix(spherePos, explodeDir, t);

    // Subtle breathing/pulse
    float pulse = sin(uTime * 0.8 + aOffset * 6.28) * 0.008;
    pos *= 1.0 + pulse * (1.0 - uExplode);

    // Mouse parallax  only when sphere is whole
    float mp = 1.0 - uExplode;
    pos.x += uMouse.x * 30.0 * mp * (pos.z / 300.0);
    pos.y += uMouse.y * 20.0 * mp * (pos.z / 300.0);

    vec4 mvPosition = modelViewGrid * vec4(pos, 1.0);
    vDepth = (-mvPosition.z + 400.0) / 800.0;
    vAlpha = mix(0.15, 1.0, vDepth) * (1.0 - uExplode * 0.85);

    float dynamicSize = uSize * aScale * vDepth;
    gl_PointSize = dynamicSize * (300.0 / -mvPosition.z);
    gl_Position  = projectionGrid * mvPosition;
  }
`;

// 
// FRAGMENT SHADER  Per-pixel: round soft particle, gold vs blue tint
// 
const FRAGMENT_SHADER = `
  varying float vScale;
  varying float vDepth;
  varying float vIsGold;
  varying float vAlpha;

  void main() {
    // Soft circle
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;

    float softness = smoothstep(0.5, 0.1, d);

    // Color: deep ocean blue  cyan  white core; gold accents
    vec3 blueColor  = mix(vec3(0.05, 0.35, 0.95), vec3(0.0, 0.85, 1.0), vDepth);
    vec3 goldColor  = vec3(0.95, 0.8, 0.25);
    vec3 coreColor  = mix(blueColor, vec3(1.0), smoothstep(0.0, 0.2, d));
    vec3 finalColor = mix(coreColor, goldColor, vIsGold);

    gl_FragColor = vec4(finalColor, softness * vAlpha);
  }
`;

// 
// RING SHADER  the equatorial energy ring
// 
const RING_VERTEX = `
  uniform float uTime;
  uniform float uExplode;
  varying float vUv;

  void main() {
    vUv = position.x;
    float scale = 1.0 - uExplode * 1.5;
    vec3 pos = position * max(0.0, scale);
    gl_Position = projectionGrid * modelViewGrid * vec4(pos, 1.0);
  }
`;

const RING_FRAGMENT = `
  uniform float uTime;
  uniform float uExplode;
  varying float vUv;

  void main() {
    float pulse = 0.5 + 0.5 * sin(uTime * 2.0 + vUv * 6.28 * 8.0);
    float alpha = pulse * (1.0 - uExplode * 2.0) * 0.4;
    alpha = max(0.0, alpha);
    vec3 col = mix(vec3(0.0, 0.85, 1.0), vec3(0.95, 0.8, 0.25), pulse * 0.3);
    gl_FragColor = vec4(col, alpha);
  }
`;

// 
// PARTICLE GEOMETRY FACTORY  Fibonacci sphere, 60k particles
// 
function buildSphereGeometry(count: number) {
  const positions = new Float32Array(count * 3);
  const scales    = new Float32Array(count);
  const speeds    = new Float32Array(count);
  const offsets   = new Float32Array(count);
  const randoms   = new Float32Array(count * 3);
  const isGold    = new Float32Array(count);

  const RADIUS  = 220;
  const golden  = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < count; i++) {
    // Fibonacci lattice  perfect uniform sphere distribution
    const y   = 1 - (i / (count - 1)) * 2;
    const rad = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;

    // Add slight radial noise for organic feel
    const r = RADIUS + (Math.random() - 0.5) * 22;
    positions[i * 3 + 0] = Math.cos(theta) * rad * r;
    positions[i * 3 + 1] = y * r;
    positions[i * 3 + 2] = Math.sin(theta) * rad * r;

    scales[i]     = 0.5 + Math.random() * 2.5;
    speeds[i]     = 0.6 + Math.random() * 0.8;
    offsets[i]    = Math.random();

    // Random explosion target
    const phi2    = Math.random() * Math.PI * 2;
    const theta2  = Math.acos(2 * Math.random() - 1);
    randoms[i * 3 + 0] = Math.sin(theta2) * Math.cos(phi2);
    randoms[i * 3 + 1] = Math.sin(theta2) * Math.sin(phi2);
    randoms[i * 3 + 2] = Math.cos(theta2);

    // 8% of particles are gold
    isGold[i] = Math.random() < 0.08 ? 1 : 0;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setAttribute("aScale",   new THREE.BufferAttribute(scales,    1));
  geo.setAttribute("aSpeed",   new THREE.BufferAttribute(speeds,    1));
  geo.setAttribute("aOffset",  new THREE.BufferAttribute(offsets,   1));
  geo.setAttribute("aRandom",  new THREE.BufferAttribute(randoms,   3));
  geo.setAttribute("aIsGold",  new THREE.BufferAttribute(isGold,    1));
  return geo;
}

// 
// PARTICLES MESH  live WebGL object
// 
function ParticleMesh({ explode, mouse }: { explode: number; mouse: [number, number] }) {
  const meshRef = useRef<THREE.Points>(null!);
  const ringRef = useRef<THREE.Line>(null!);
  const { viewport } = useThree();

  const PARTICLE_COUNT = 25000;
  const geometry = useMemo(() => buildSphereGeometry(PARTICLE_COUNT), []);

  const particleMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader:   VERTEX_SHADER,
        fragmentShader: FRAGMENT_SHADER,
        uniforms: {
          uTime:    { value: 0 },
          uExplode: { value: 0 },
          uMouse:   { value: new THREE.Vector2(0, 0) },
          uSize:    { value: Math.min(viewport.width, viewport.height) * 0.015 },
        },
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      }),
    [viewport]
  );

  // Ring geometry
  const ringGeo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * 230, 0, Math.sin(a) * 230));
    }
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);

  const ringMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader:   RING_VERTEX,
        fragmentShader: RING_FRAGMENT,
        uniforms: {
          uTime:    { value: 0 },
          uExplode: { value: 0 },
        },
        transparent: true,
        depthWrite:  false,
        blending:    THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;

    // Particle mesh
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.0015;
      meshRef.current.rotation.x += 0.0003;
      const u = (meshRef.current.material as THREE.ShaderMaterial).uniforms;
      u.uTime.value    = t;
      u.uExplode.value = explode;
      u.uMouse.value.set(mouse[0], mouse[1]);
    }

    // Ring
    if (ringRef.current) {
      ringRef.current.rotation.y += 0.004;
      ringRef.current.rotation.z  = Math.sin(t * 0.3) * 0.15;
      const u = (ringRef.current.material as THREE.ShaderMaterial).uniforms;
      u.uTime.value    = t;
      u.uExplode.value = explode;
    }
  });

  return (
    <>
      <points ref={meshRef} geometry={geometry} material={particleMaterial} />
      {/* @ts-ignore - TS confuses R3F line with SVG line */}
      <line ref={ringRef as any} geometry={ringGeo} material={ringMaterial} />
    </>
  );
}

// 
// DUST FIELD  ambient micro-particles beyond the sphere
// 
function DustField() {
  const ref = useRef<THREE.Points>(null!);
  const count = 3000;

  const geo = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sc  = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      const r = 350 + Math.random() * 800;
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pos[i * 3 + 0] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
      sc[i] = 0.2 + Math.random() * 0.6;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    g.setAttribute("aScale",   new THREE.BufferAttribute(sc,  1));
    return g;
  }, []);

  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `
      attribute float aScale;
      varying float vAlpha;
      uniform float uTime;
      void main() {
        float twinkle = 0.3 + 0.7 * sin(uTime * 0.5 + position.x * 0.01 + position.y * 0.007);
        vAlpha = twinkle * 0.25;
        vec4 mvPos = modelViewGrid * vec4(position, 1.0);
        gl_PointSize = aScale * 1.8 * (300.0 / -mvPos.z);
        gl_Position  = projectionGrid * mvPos;
      }
    `,
    fragmentShader: `
      varying float vAlpha;
      void main() {
        vec2 uv = gl_PointCoord - 0.5;
        if (length(uv) > 0.5) discard;
        float s = smoothstep(0.5, 0.0, length(uv));
        gl_FragColor = vec4(0.65, 0.75, 1.0, s * vAlpha);
      }
    `,
    uniforms: { uTime: { value: 0 } },
    transparent: true,
    depthWrite:  false,
    blending:    THREE.AdditiveBlending,
  }), []);

  useFrame(({ clock }) => {
    if (ref.current) {
      ref.current.rotation.y += 0.00015;
      (ref.current.material as THREE.ShaderMaterial).uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return <points ref={ref} geometry={geo} material={mat} />;
}

// 
// EXPORTED COMPONENT
// 
export function WhaleGlobeGL({
  explode = 0,
  mouse = [0, 0] as [number, number],
}) {
  return (
    <Canvas
      camera={{ position: [0, 0, 650], fov: 60, near: 1, far: 3000 }}
      gl={{
        antialias: false,
        alpha: true,
        powerPreference: "high-performance",
        stencil: false,
        depth: false,
      }}
      dpr={[1, 1.5]}
      performance={{ min: 0.5 }}
      style={{ background: "transparent" }}
    >
      <DustField />
      <ParticleMesh explode={explode} mouse={mouse} />

      {/*  POST PROCESSING  */}
      <EffectComposer autoClear={false}>
        <Bloom
          intensity={1.6}
          luminanceThreshold={0.05}
          luminanceSmoothing={0.9}
          mipmapBlur
          radius={0.8}
        />
        <Vignette darkness={0.55} offset={0.3} />
      </EffectComposer>
    </Canvas>
  );
}
