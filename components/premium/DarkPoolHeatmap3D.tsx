"use client";

import { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';
import { useVIPStore } from '@/lib/vip-store';

// --- DATA SIMULATION ---
// We simulate "liquidity nodes" in a dark pool grid.
const GRID_SIZE = 30; // 30x30 grid
const CUBE_SIZE = 1;
const SPACING = 1.4;

interface NodeData {
  position: [number, number, number];
  baseY: number;
  heat: number; // 0 to 1
  phase: number;
  speed: number;
}

function generateNodes(): NodeData[] {
  const nodes: NodeData[] = [];
  const offset = (GRID_SIZE * SPACING) / 2;

  for (let x = 0; x < GRID_SIZE; x++) {
    for (let z = 0; z < GRID_SIZE; z++) {
      // Create some hotspots using sine waves
      const u = x / GRID_SIZE;
      const v = z / GRID_SIZE;
      
      const hotspot1 = Math.sin(u * Math.PI * 4) * Math.cos(v * Math.PI * 4);
      const hotspot2 = Math.sin(u * Math.PI * 2 + 2) * Math.cos(v * Math.PI * 3 - 1);
      
      let baseHeat = (hotspot1 + hotspot2 + 2) / 4; // normalize 0 to 1
      baseHeat = Math.pow(baseHeat, 2); // sharpen peaks

      nodes.push({
        position: [x * SPACING - offset, 0, z * SPACING - offset],
        baseY: 0,
        heat: baseHeat,
        phase: ((x * 13.5) + (z * 7.1)) % (Math.PI * 2),
        speed: 0.5 + Math.abs(Math.sin(x * z)) * 2,
      });
    }
  }
  return nodes;
}

// --- INSTANCED MESH FOR PERFORMANCE ---
function HeatmapGrid() {
  const whaleEvents = useVIPStore(state => state.whaleEvents);
  
  const nodes = useMemo(() => {
    const baseNodes = generateNodes(); // Base ambient liquidity
    
    // Inject REAL $1M+ On-Chain Whale Movements 
    whaleEvents.forEach(event => {
      // @ts-ignore
      const usdValue = event.rawUsd || event.usdNum || 0;
      if (usdValue >= 1_000_000) {
        // Hash wallet address to a deterministic X/Z coordinate on the dark pool grid
        let hash = 0;
        for(let i=0; i<event.wallet.length; i++) {
           hash = ((hash << 5) - hash) + event.wallet.charCodeAt(i);
           hash |= 0;
        }
        const x = Math.abs(hash) % GRID_SIZE;
        const z = Math.abs(hash >> 8) % GRID_SIZE;
        
        // Find node index (nested loop was x then z)
        const index = x * GRID_SIZE + z;
        if (baseNodes[index]) {
            baseNodes[index].heat = 1.5; // Overcharge heat (Red)
            baseNodes[index].speed = 10.0; // Hyper pulsing
        }
      }
    });
    
    return baseNodes;
  }, [whaleEvents]);

  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.MeshPhysicalMaterial>(null);
  
  // Create a color scale
  // Cold (Low Volume) -> Deep Blue
  // Medium -> Purple
  // Hot (High Volume / Whales) -> Neon Pink / Red
  const coldColor = new THREE.Color("#0f172a"); // slate-900
  const midColor = new THREE.Color("#7e22ce");  // purple-700
  const hotColor = new THREE.Color("#f43f5e");  // rose-500
  
  const tempColor = new THREE.Color();
  const tempObject = new THREE.Object3D();

  // Animation Loop
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    
    // Rotate the whole heatmap slowly
    if (groupRef.current) {
      groupRef.current.rotation.y = time * 0.05;
    }

    // Since we are using Instances component from drei, 
    // the children <NodeInstance> handle their own animation matrices.
  });

  return (
    <group ref={groupRef}>
      <Instances 
        limit={GRID_SIZE * GRID_SIZE} 
        range={GRID_SIZE * GRID_SIZE}
      >
        <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
        <meshPhysicalMaterial 
          ref={materialRef}
          roughness={0.2}
          metalness={0.8}
          transmission={0.5}
          thickness={1.5}
          ior={1.5}
          clearcoat={1}
          clearcoatRoughness={0.1}
          toneMapped={false} // Crucial for bloom
        />
        {nodes.map((node, i) => (
          <NodeInstance key={i} data={node} coldColor={coldColor} midColor={midColor} hotColor={hotColor} />
        ))}
      </Instances>
    </group>
  );
}

// Individual Instance logic inside <Instances>
function NodeInstance({ data, coldColor, midColor, hotColor }: { data: NodeData, coldColor: THREE.Color, midColor: THREE.Color, hotColor: THREE.Color }) {
  const ref = useRef<any>(null);
  const color = useMemo(() => new THREE.Color(), []);
  
  useFrame((state) => {
    if (!ref.current) return;
    
    const time = state.clock.getElapsedTime();
    
    // Calculate dynamic heat based on <ctrl61>initial map + time (simulating live volume)
    const dynamicHeat = Math.max(0, Math.min(1, data.heat + Math.sin(time * data.speed + data.phase) * 0.2));
    
    // Dynamic height based on heat
    const height = 1 + dynamicHeat * 15; // Max height 16
    const dynamicY = data.position[1] + height / 2;

    ref.current.position.set(data.position[0], dynamicY, data.position[2]);
    ref.current.scale.set(1, height, 1);
    
    // Calculate Color based on heat
    if (dynamicHeat < 0.5) {
      color.lerpColors(coldColor, midColor, dynamicHeat * 2);
    } else {
      color.lerpColors(midColor, hotColor, (dynamicHeat - 0.5) * 2);
    }
    
    // IMPORTANT: Multiply by scalar to make it emit light for the Bloom pass
    // Hotter nodes glow infinitely brighter
    const glowIntensity = 1 + Math.pow(dynamicHeat, 3) * 10;
    color.multiplyScalar(glowIntensity);
    
    ref.current.color = color;
    
  });

  return <Instance ref={ref} />;
}


// --- MAIN COMPONENT ---
export function DarkPoolHeatmap3D() {
  return (
    <div className="w-full h-full min-h-[500px] bg-black rounded-3xl overflow-hidden border border-white/10 relative shadow-[0_0_50px_rgba(0,0,0,0.5)]">
      
      {/* HUD OVERLAY */}
      <div className="absolute top-6 border border-white/10 left-6 z-10 pointer-events-none bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl">
        <h3 className="text-white font-mono font-bold tracking-[0.2em] uppercase text-sm mb-1">
          Dark Pool Liquidity
        </h3>
        <p className="text-white/40 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
          Active 3D Topography
        </p>
      </div>

      <div className="absolute bottom-6 left-6 z-10 pointer-events-none flex gap-4">
         <div className="flex flex-col gap-1">
            <span className="text-white/40 font-mono text-[9px] uppercase tracking-widest">Cold Volumes</span>
            <div className="h-1 w-12 bg-slate-900 rounded-full" />
         </div>
         <div className="flex flex-col gap-1">
            <span className="text-white/40 font-mono text-[9px] uppercase tracking-widest">Anomalies</span>
            <div className="h-1 w-12 bg-purple-700 rounded-full" />
         </div>
         <div className="flex flex-col gap-1">
            <span className="text-white/40 font-mono text-[9px] uppercase tracking-widest">Whale Hotspots</span>
            <div className="h-1 w-12 bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,1)] rounded-full" />
         </div>
      </div>

      {/* 3D CANVAS */}
      <Canvas 
        camera={{ position: [0, 20, 35], fov: 45 }}
        gl={{ antialias: false, powerPreference: "high-performance" }} // Optimized for post-processing
      >
        <color attach="background" args={['#000000']} />
        
        {/* Fog to hide the grid edges gracefully */}
        <fog attach="fog" args={['#000000', 30, 60]} />

        {/* Lighting */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" />
        <pointLight position={[0, -10, 0]} intensity={2} color="#7e22ce" /> {/* Underside glow */}

        {/* The Grid Simulator */}
        <HeatmapGrid />

        {/* Controls */}
        <OrbitControls 
          enablePan={false}
          enableZoom={true}
          maxPolarAngle={Math.PI / 2.2} // Prevent looking directly from bottom
          minPolarAngle={Math.PI / 6}
          minDistance={20}
          maxDistance={60}
          autoRotate={false}
        />

        {/* Legendary Post-Processing */}
        {/* Legendary Post-Processing (Temporarily removed to prevent Context Lost) */}


        {/* Reflective city-like ambiance via in-scene lights (no external HDR fetch) */}
        <pointLight position={[-20, 10, -20]} intensity={3} color="#4f46e5" />
        <pointLight position={[20, 5, 20]} intensity={2} color="#c026d3" />
      </Canvas>
    </div>
  );
}

