"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { MathUtils } from 'three';
import * as THREE from 'three';

// --- SHADERS ---
// Vertex shader displaces the flat image into a rolling 3D ocean
const vertexShader = `
uniform float uTime;
uniform float uScroll;
uniform float uScrollVelocity;
varying vec2 vUv;
varying float vElevation;

// Simplex 3D Noise for physical displacement
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
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i); 
  vec4 p = permute( permute( permute( 
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
  float n_ = 0.142857142857;
  vec3  ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );
  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
}

void main() {
  vUv = uv;
  vec3 pos = position;
  
  // Base big wave
  float noiseFreq = 1.5;
  // React to scroll speed! Max amplitude increases dynamically
  float scrollFactor = min(uScrollVelocity * 0.005, 0.8);
  float noiseAmp = 0.6 + scrollFactor; 
  
  // Dynamic offset based on scroll position to ripple the geometry
  vec3 noisePos = vec3(pos.x * noiseFreq + uTime * 0.2, pos.y * noiseFreq - uScroll * 0.001, uTime * 0.2);
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
  // Parallax Scrolling: Pan the texture downwards as the user scrolls
  vec2 parallaxUv = vUv;
  
  // Make the texture repeat naturally if we scroll past bounds
  // Subtly shift the Y coordinate based on scroll to create a deep parallax effect
  parallaxUv.y += uScroll * 0.0003;
  
  // Optional: subtle water refraction distortion based on elevation
  parallaxUv.x += vElevation * 0.05;
  parallaxUv.y += vElevation * 0.05;
  
  // Wrap UVs
  parallaxUv = fract(parallaxUv);
  
  // Sample the exact image provided by the user
  vec4 texColor = texture2D(uTexture, parallaxUv);
  
  // Dynamic Lighting & Shadows based on physical wave elevation
  // Higher elevation = brighter, lower elevation = darker (valley shadow)
  float shadow = (vElevation + 0.6) * 0.8;
  texColor.rgb *= clamp(shadow, 0.6, 1.1);
  
  // Add a slight energy glow if scrolling fast
  float energy = min(uScrollVelocity * 0.002, 0.2);
  texColor.rgb += vec3(0.2, 0.5, 1.0) * energy;

  gl_FragColor = texColor;
}
`;

function VirtualizedWaveMesh() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  
  // Load the user's exact uploaded image
  const texture = useLoader(THREE.TextureLoader, '/wave.jpg');
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;

  // State for scroll tracking
  const scrollData = useRef({
    current: 0,
    target: 0,
    velocity: 0
  });

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScroll: { value: 0 },
      uScrollVelocity: { value: 0 },
      uTexture: { value: texture }
    }),
    [texture]
  );

  useEffect(() => {
    scrollData.current.target = window.scrollY;
    
    const handleScroll = () => {
      scrollData.current.target = window.scrollY;
    };
    
    // Passive true for maximum 240Hz butter smoothness
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useFrame((state, delta) => {
    // Quantum 240Hz interpolation
    const { current, target, velocity } = scrollData.current;
    
    // Smooth scroll interpolation (frame-rate independent lerp factor)
    const lerpFactor = 1.0 - Math.exp(-10.0 * delta); 
    const newCurrent = MathUtils.lerp(current, target, lerpFactor);
    
    // Instantaneous velocity
    const instantVelocity = Math.abs(newCurrent - current) / Math.max(delta, 0.001);
    
    // Smooth velocity decay
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
      {/* High-density plane for buttery smooth 240Hz geometry deformation */}
      <planeGeometry args={[18, 18, 256, 256]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        wireframe={false}
      />
    </mesh>
  );
}

export function JapaneseWaveBackground() {
  return (
    <div className="fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden" style={{ background: '#020e1f' }}>
      <Canvas
        camera={{ position: [0, 0, 3], fov: 75 }}
        dpr={[1, 2]} // Support high-DPI displays (retina) for sharpness
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }} // 240Hz optimizations
      >
        <fog attach="fog" args={['#020e1f', 2, 8]} />
        <React.Suspense fallback={null}>
          <VirtualizedWaveMesh />
        </React.Suspense>
      </Canvas>
      {/* Superposition overlay to ensure UI elements remain readable above the image */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#020e1f] via-[#020e1f]/40 to-transparent pointer-events-none mix-blend-multiply" />
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />
    </div>
  );
}
