"use client";

import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { MathUtils } from 'three';
import * as THREE from 'three';

// --- SHADERS ---
const vertexShader = `
uniform float uTime;
uniform float uScroll;
uniform float uScrollVelocity;
varying vec2 vUv;
varying float vElevation;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
float snoise(vec3 v) { 
  const vec2 C = vec2(1.0/6.0, 1.0/3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i  = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i); 
  vec4 p = permute(permute(permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0)) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
}

void main() {
  vUv = uv;
  vec3 pos = position;
  float scrollFactor = min(uScrollVelocity * 0.005, 0.8);
  float noiseAmp = 0.6 + scrollFactor; 
  vec3 noisePos = vec3(pos.x * 1.5 + uTime * 0.2, pos.y * 1.5 - uScroll * 0.001, uTime * 0.2);
  float elevation = snoise(noisePos) * noiseAmp;
  pos.z += elevation;
  vElevation = elevation;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
`;

const fragmentShader = `
uniform sampler2D uTexture;
uniform float uScroll;
uniform float uScrollVelocity;
uniform float uTime;
varying vec2 vUv;
varying float vElevation;

void main() {
  vec2 parallaxUv = vUv;
  parallaxUv.y += uScroll * 0.0003;
  parallaxUv.x += vElevation * 0.04;
  parallaxUv.y += vElevation * 0.04;
  parallaxUv = fract(parallaxUv);
  vec4 texColor = texture2D(uTexture, parallaxUv);
  float shadow = (vElevation + 0.6) * 0.85;
  texColor.rgb *= clamp(shadow, 0.6, 1.1);
  float energy = min(uScrollVelocity * 0.002, 0.2);
  texColor.rgb += vec3(0.1, 0.3, 0.8) * energy;
  gl_FragColor = texColor;
}
`;

function VirtualizedWaveMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const texture = useLoader(THREE.TextureLoader, '/wave.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  const scrollData = useRef({ current: 0, target: 0, velocity: 0 });

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uScroll: { value: 0 },
    uScrollVelocity: { value: 0 },
    uTexture: { value: texture }
  }), [texture]);

  useEffect(() => {
    scrollData.current.target = window.scrollY;
    const handleScroll = () => { scrollData.current.target = window.scrollY; };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state, delta) => {
    const { current, target, velocity } = scrollData.current;
    const lerpFactor = 1.0 - Math.exp(-10.0 * delta); 
    const newCurrent = MathUtils.lerp(current, target, lerpFactor);
    const instantVelocity = Math.abs(newCurrent - current) / Math.max(delta, 0.001);
    const velLerpFactor = 1.0 - Math.exp(-5.0 * delta);
    const newVelocity = MathUtils.lerp(velocity, instantVelocity, velLerpFactor);
    scrollData.current.current = newCurrent;
    scrollData.current.velocity = newVelocity;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
      materialRef.current.uniforms.uScroll.value = newCurrent;
      materialRef.current.uniforms.uScrollVelocity.value = newVelocity;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 3.5, 0, 0]} position={[0, -0.5, -2.0]}>
      <planeGeometry args={[18, 18, 256, 256]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// Desktop: full 3D WebGL animated wave
function DesktopWave() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      >
        <fog attach="fog" args={['#020e1f', 2, 8]} />
        <React.Suspense fallback={null}>
          <VirtualizedWaveMesh />
        </React.Suspense>
      </Canvas>
      {/* Subtle darkening overlay so UI elements stay readable */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
    </div>
  );
}

// Mobile: plain static wallpaper (the exact same image, no WebGL overhead)
function MobileWallpaper() {
  return (
    <div
      className="fixed inset-0 w-full h-full z-0 pointer-events-none"
      style={{
        backgroundImage: "url('/wave.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />
    </div>
  );
}

export function JapaneseWaveBackground() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check, { passive: true });
    return () => window.removeEventListener('resize', check);
  }, []);

  return isMobile ? <MobileWallpaper /> : <DesktopWave />;
}
