'use client';
import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Colores según el modo del Feed
const MODE_COLORS = {
    LIVE: '#00f2ea',   // Cyan (Normal)
    WHALES: '#8b5cf6', // Violeta (Misterio)
    GAS: '#ef4444',    // Rojo (Alerta/Calor)
    GOV: '#f59e0b',    // Dorado (Poder)
    YIELD: '#10b981'   // Verde (Dinero)
};

interface CoreProps {
    mode: string;
}

//  Shared geometries  created once, never re-allocated 
const OCTA_GEO = new THREE.OctahedronGeometry(1.2, 0);
const INNER_GEO = new THREE.SphereGeometry(0.8, 12, 12);

function CoreMesh({ mode }: CoreProps) {
    const mesh = useRef<THREE.Mesh>(null);
    const innerMesh = useRef<THREE.Mesh>(null);

    // Stable material ref  mutated in place to avoid material recreation
    const innerMat = useMemo(() => new THREE.MeshStandardMaterial({
        color: '#00f2ea',
        emissive: '#00f2ea',
        emissiveIntensity: 3,
        wireframe: true,
        toneMapped: false,
    }), []);

    const outerMat = useMemo(() => new THREE.MeshPhysicalMaterial({
        transparent: true,
        transmission: 0.9,
        thickness: 0.5,
        roughness: 0.1,
        color: '#ffffff',
        metalness: 0.1,
        ior: 1.5,
    }), []);

    const targetColor = useMemo(() =>
        new THREE.Color(MODE_COLORS[mode as keyof typeof MODE_COLORS] || '#00f2ea'),
    [mode]);

    useFrame((state, delta) => {
        if (!mesh.current || !innerMesh.current) return;

        const { x, y } = state.mouse;
        // lerp factor capped so it's frame-rate independent
        const lerpFactor = 1 - Math.pow(0.05, delta);

        mesh.current.rotation.x = THREE.MathUtils.lerp(mesh.current.rotation.x, y * 0.5, lerpFactor);
        mesh.current.rotation.y = THREE.MathUtils.lerp(mesh.current.rotation.y, x * 0.5, lerpFactor);

        const t = state.clock.getElapsedTime();
        innerMesh.current.scale.setScalar(0.5 + Math.sin(t * 2) * 0.05);

        // Mutate existing material colors  avoids any allocation
        (innerMesh.current.material as THREE.MeshStandardMaterial).color.lerp(targetColor, lerpFactor);
        (innerMesh.current.material as THREE.MeshStandardMaterial).emissive.lerp(targetColor, lerpFactor);
    });

    return (
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
            {/* Cáscara exterior */}
            <mesh ref={mesh} geometry={OCTA_GEO} material={outerMat}>
                {/* Alma interna */}
                <mesh ref={innerMesh} geometry={INNER_GEO} material={innerMat} scale={[0.5, 0.5, 0.5]} />
            </mesh>

            {/* Partículas de energía */}
            <Sparkles count={30} scale={3} size={2} speed={0.4} opacity={0.5} color={targetColor} />
        </Float>
    );
}

export default function IdentityCore({ mode = 'LIVE' }: { mode: string }) {
    return (
        <div className="w-full h-full">
            <Canvas
                camera={{ position: [0, 0, 4], fov: 45 }}
                gl={{
                    alpha: true,
                    antialias: false,
                    powerPreference: 'high-performance',
                    stencil: false,
                    depth: true,
                }}
                dpr={[1, 1.5]}
                performance={{ min: 0.5 }}
            >
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <directionalLight position={[-5, 5, 5]} intensity={0.8} />
                <CoreMesh mode={mode} />
            </Canvas>
        </div>
    );
}
