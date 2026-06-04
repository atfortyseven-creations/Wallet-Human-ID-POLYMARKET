"use client";

import React, { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";

//  BATTERY-AWARE DPR HOOK 
// Returns the optimal Device Pixel Ratio based on battery state.
// On battery-constrained devices (< 20% or discharging), caps at 1.
// On plugged-in / high-power devices, allows up to 1.5 (never 2  WebGL cost).
function useBatteryAwareDpr(): [number, number] {
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);

  useEffect(() => {
    const nav = navigator as any;
    if (!nav.getBattery) return; // Desktop without Battery API  keep default

    nav.getBattery().then((battery: any) => {
      const update = () => {
        const isLow     = battery.level < 0.20;
        const isCharging = battery.charging;
        // Aggressive: discharge + low  1x. Plugged in  1.5x.
        setDpr(isCharging ? [1, 1.5] : isLow ? [1, 1] : [1, 1.2]);
      };
      update();
      battery.addEventListener('chargingchange', update);
      battery.addEventListener('levelchange',   update);
    }).catch(() => {/* Battery API failed silently */});
  }, []);

  return dpr;
}

//  CONFIG 
const POINT_COUNT  = 40000; // Drastically reduced for optimization
const GLOBE_RADIUS = 1.0;
const DOT_SIZE     = 2.5; // Adjusted for new point count
const DOT_COLOR    = new THREE.Color("#A0A0A0"); // Sleek grey
const BG_COLOR     = "transparent";

//  ERROR BOUNDARY 
class GlobeErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error("Globe Rendering Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

//  VISITOR MARKERS 
const VISITOR_COUNTRIES = [
  { lat: 40.4,  lon: -3.7,   scale: 2.1 }, // Spain
  { lat: 52.4,  lon: 4.9,    scale: 1.4 }, // Netherlands
  { lat: 51.2,  lon: 10.4,   scale: 1.6 }, // Germany
  { lat: 46.2,  lon: 2.2,    scale: 1.5 }, // France
  { lat: 51.5,  lon: -0.1,   scale: 1.7 }, // UK
  { lat: 41.9,  lon: 12.5,   scale: 1.2 }, // Italy
  { lat: 37.1,  lon: -95.7,  scale: 2.5 }, // US
  { lat: 40.7,  lon: -74.0,  scale: 1.8 }, // NY
  { lat: 37.8,  lon: -122.4, scale: 1.4 }, // SF
  { lat: -14.2, lon: -51.9,  scale: 1.8 }, // Brazil
  { lat: 35.7,  lon: 139.7,  scale: 1.9 }, // Tokyo
  { lat: 35.9,  lon: 104.2,  scale: 2.2 }, // China
  { lat: 1.3,   lon: 103.8,  scale: 1.3 }, // Singapore
  { lat: 22.3,  lon: 114.2,  scale: 1.2 }, // HK
  { lat: 25.2,  lon: 55.3,   scale: 1.0 }, // Dubai
  { lat: -30.6, lon: 22.9,   scale: 1.0 }, // SA
];

//  SHADERS 
const vertexShader = `
  uniform sampler2D uMap;
  uniform float uSize;
  uniform vec3 uColor;
  
  varying vec3 vColor;
  varying float vVisibility;

  void main() {
    // Calculate UV from sphere position
    vec3 nPos = normalize(position);
    float u = 0.5 + atan(nPos.z, nPos.x) / (2.0 * 3.14159265359);
    float v = 0.5 - asin(nPos.y) / 3.14159265359;
    
    // Sample texture
    vec4 texColor = texture2D(uMap, vec2(u, v));
    
    // earth-water.png is white for water, black for land
    if (texColor.r > 0.5) {
      vVisibility = 0.0;
      gl_PointSize = 0.0;
      gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // push off screen
      return;
    }
    
    vVisibility = 1.0;
    vColor = uColor;

    vec4 mvPosition = modelViewGrid * vec4(position, 1.0);
    
    // Size attenuation
    gl_PointSize = uSize * (3.0 / -mvPosition.z);
    gl_Position = projectionGrid * mvPosition;
  }
`;

const fragmentShader = `
  varying vec3 vColor;
  varying float vVisibility;

  void main() {
    if (vVisibility < 0.5) discard;
    
    // Make points circular
    vec2 coord = gl_PointCoord - vec2(0.5);
    if (length(coord) > 0.5) discard;
    
    gl_FragColor = vec4(vColor, 0.9);
  }
`;

//  CONTINENTAL DOT MESH 
function HighFidelityPointGlobe() {
  const [mapState, setMapState] = useState<{ texture: THREE.Texture | null, failed: boolean }>({ texture: null, failed: false });

  useEffect(() => {
    let isMounted = true;
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");

    // PERF-22: Local-first texture strategy.
    // /public/textures/earth-water.png is served by Next.js static assets  zero CDN dependency.
    // CDN fallback is only used if the local file is missing (should not happen in production).
    const LOCAL_URL  = '/textures/earth-water.png';
    const REMOTE_URL = 'https://raw.githubusercontent.com/vasturiano/three-globe/master/example/img/earth-water.png';

    const loadTexture = (url: string, isFallback = false) => {
      loader.load(
        url,
        (texture) => {
          if (!isMounted) return;
          texture.colorSpace = THREE.SRGBColorSpace;
          setMapState({ texture, failed: false });
        },
        undefined,
        (err) => {
          if (!isMounted) return;
          if (!isFallback) {
            // Local load failed  try remote CDN as last resort
            console.warn('[Globe] Local texture missing, falling back to CDN.');
            loadTexture(REMOTE_URL, true);
          } else {
            console.warn('[Globe] All texture sources failed. Using wireframe fallback.', err);
            setMapState({ texture: null, failed: true });
          }
        }
      );
    };

    loadTexture(LOCAL_URL);
    return () => { isMounted = false; };
  }, []);

  const { pointsGeometry, pointsMaterial, wireGeometry } = useMemo(() => {
    // 1. Point Cloud Geometry
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(POINT_COUNT * 3);
    const PHI = Math.PI * (3 - Math.sqrt(5));
    
    for (let i = 0; i < POINT_COUNT; i++) {
      const y = 1 - (i / (POINT_COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = PHI * i;
      positions[i * 3 + 0] = Math.cos(theta) * r * GLOBE_RADIUS;
      positions[i * 3 + 1] = y * GLOBE_RADIUS;
      positions[i * 3 + 2] = Math.sin(theta) * r * GLOBE_RADIUS;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uMap: { value: mapState.texture },
        uSize: { value: DOT_SIZE },
        uColor: { value: DOT_COLOR }
      },
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false
    });

    // 2. Wireframe Fallback Geometry
    const wGeo = new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(GLOBE_RADIUS, 12));

    return { pointsGeometry: geo, pointsMaterial: mat, wireGeometry: wGeo };
  }, [mapState.texture]);

  // [INSTITUTIONAL OPTIMIZATION]: Prevent WebGL VRAM leaks
  // React Three Fiber does not auto-dispose manually created objects.
  useEffect(() => {
    return () => {
      pointsGeometry.dispose();
      pointsMaterial.dispose();
      wireGeometry.dispose();
      if (mapState.texture) mapState.texture.dispose();
    };
  }, [pointsGeometry, pointsMaterial, wireGeometry, mapState.texture]);

  // If loading, show nothing
  if (!mapState.texture && !mapState.failed) return null;

  // If failed, gracefully degrade to a beautiful wireframe globe
  if (mapState.failed) {
    return (
      <lineSegments geometry={wireGeometry}>
        <lineBasicMaterial color="#CCCCCC" transparent opacity={0.3} />
      </lineSegments>
    );
  }

  // Normal optimal point rendering
  return <points geometry={pointsGeometry} material={pointsMaterial} />;
}

//  VISITOR MARKERS 
function VisitorMarkers() {
  const meshRef = useRef<THREE.InstancedMesh>(null!);
  const dummy   = useMemo(() => new THREE.Object3D(), []);

  useEffect(() => {
    if (!meshRef.current) return;
    VISITOR_COUNTRIES.forEach((c, i) => {
      const latR = c.lat * (Math.PI / 180);
      const lonR = c.lon * (Math.PI / 180); // Invert lon for correct mapping
      const x = GLOBE_RADIUS * Math.cos(latR) * Math.cos(lonR);
      const y = GLOBE_RADIUS * Math.sin(latR);
      const z = GLOBE_RADIUS * Math.cos(latR) * Math.sin(lonR);
      dummy.position.set(x * 1.01, y * 1.01, z * 1.01);
      dummy.scale.setScalar(c.scale);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.count = VISITOR_COUNTRIES.length;
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [dummy]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    VISITOR_COUNTRIES.forEach((c, i) => {
      const latR = c.lat * (Math.PI / 180);
      const lonR = c.lon * (Math.PI / 180);
      const x = GLOBE_RADIUS * Math.cos(latR) * Math.cos(lonR);
      const y = GLOBE_RADIUS * Math.sin(latR);
      const z = GLOBE_RADIUS * Math.cos(latR) * Math.sin(lonR);
      const pulse = 1 + Math.sin(t * 2.5 + i * 0.8) * 0.35;
      dummy.position.set(x * 1.01, y * 1.01, z * 1.01);
      dummy.scale.setScalar(c.scale * pulse);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, VISITOR_COUNTRIES.length]}>
      <sphereGeometry args={[0.012, 16, 16]} />
      <meshBasicMaterial color="#00C076" transparent opacity={0.9} />
    </instancedMesh>
  );
}

//  SOLID CORE 
function SolidCore() {
  return (
    <mesh>
      <sphereGeometry args={[GLOBE_RADIUS * 0.99, 32, 32]} />
      <meshBasicMaterial color="#F5F5F5" transparent opacity={1} />
    </mesh>
  );
}

//  ROTATING GROUP 
function RotatingGlobeGroup() {
  const groupRef = useRef<THREE.Group>(null!);
  useFrame(() => {
    if (groupRef.current) groupRef.current.rotation.y += 0.0015;
  });
  return (
    <group ref={groupRef}>
      <SolidCore />
      <HighFidelityPointGlobe />
      <VisitorMarkers />
    </group>
  );
}

//  MAIN EXPORT 
export function SystemGlobe3D() {
  const dpr = useBatteryAwareDpr();
  return (
    <div className="w-full h-full absolute inset-0 z-0 bg-transparent overflow-hidden flex items-center justify-center">
      <GlobeErrorBoundary>
        <Canvas
          camera={{ position: [0, 0, 2.5], fov: 45, near: 0.01, far: 10 }}
          dpr={dpr}
          gl={{ antialias: false, powerPreference: "high-performance", alpha: true, stencil: false }}
          performance={{ min: 0.5 }}
          style={{ background: "transparent", cursor: "grab" }}
        >
          <group rotation={[0.2, -0.5, 0]}>
            <React.Suspense fallback={null}>
              <RotatingGlobeGroup />
            </React.Suspense>
          </group>

          <OrbitControls
            enablePan={false}
            enableZoom={false}
            minPolarAngle={Math.PI * 0.3}
            maxPolarAngle={Math.PI * 0.7}
            autoRotate={false}
            enableDamping
            dampingFactor={0.05}
          />
        </Canvas>
      </GlobeErrorBoundary>
    </div>
  );
}

