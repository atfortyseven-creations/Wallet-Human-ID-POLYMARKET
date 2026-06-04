"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrthographicCamera, Trail, Sparkles } from "@react-three/drei";
import * as THREE from "three";

// ─── Config ──────────────────────────────────────────────────────────────────
const LIMIT = 11.5;
const SPEED = 6.5;
const ACCEL = 18;
const FRICTION = 10;
const ISO_ANGLE = Math.atan(1 / Math.sqrt(2));

// ─── Materials (singleton) ───────────────────────────────────────────────────
const MAT_BODY = new THREE.MeshStandardMaterial({ color: "#0a0a0a", roughness: 0.4, metalness: 0.1 });
const MAT_ARMOR = new THREE.MeshStandardMaterial({ color: "#1c1c1c", roughness: 0.6, metalness: 0.3 });
const MAT_SWORD = new THREE.MeshStandardMaterial({ color: "#d4d4d4", roughness: 0.05, metalness: 0.98, envMapIntensity: 2 });
const MAT_GUARD = new THREE.MeshStandardMaterial({ color: "#888", roughness: 0.3, metalness: 0.8 });
const MAT_GLOW = new THREE.MeshBasicMaterial({ color: "#aaddff", transparent: true, opacity: 0.3 });
const MAT_EDGE = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.6 });

// ─── Dust Particle ────────────────────────────────────────────────────────────
function DustParticle({ origin }: { origin: THREE.Vector3 }) {
  const mesh = useRef<THREE.Mesh>(null);
  const vel = useRef(new THREE.Vector3(
    (Math.random() - 0.5) * 1.5,
    Math.random() * 1.5 + 0.5,
    (Math.random() - 0.5) * 1.5
  ));
  const life = useRef(0);

  useFrame((_, delta) => {
    if (!mesh.current) return;
    life.current += delta;
    const t = life.current / 0.9;
    mesh.current.position.addScaledVector(vel.current, delta);
    vel.current.y -= 3 * delta;
    mesh.current.scale.setScalar(Math.max(0, (1 - t) * 0.12));
    (mesh.current.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 1 - t) * 0.7;
  });

  return (
    <mesh ref={mesh} position={origin.clone()}>
      <sphereGeometry args={[0.1, 4, 4]} />
      <meshBasicMaterial color="#888" transparent opacity={0.7} />
    </mesh>
  );
}

// ─── Dust Emitter ─────────────────────────────────────────────────────────────
function DustEmitter({ pos, moving }: { pos: THREE.Vector3; moving: boolean }) {
  const [particles, setParticles] = useState<{ id: number; origin: THREE.Vector3 }[]>([]);
  const timer = useRef(0);
  const id = useRef(0);

  useFrame((_, delta) => {
    if (!moving) return;
    timer.current += delta;
    if (timer.current > 0.08) {
      timer.current = 0;
      const origin = pos.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.4,
        0.05,
        (Math.random() - 0.5) * 0.4
      ));
      const newId = ++id.current;
      setParticles(p => [...p.slice(-12), { id: newId, origin }]);
    }
  });

  return (
    <>
      {particles.map(p => <DustParticle key={p.id} origin={p.origin} />)}
    </>
  );
}

// ─── Sword Glow Pulse ─────────────────────────────────────────────────────────
function SwordGlow({ moving }: { moving: boolean }) {
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime;
    const pulse = 0.18 + Math.sin(t * 4) * 0.06 + (moving ? 0.08 : 0);
    mesh.current.scale.setScalar(pulse / 0.18);
    (mesh.current.material as THREE.MeshBasicMaterial).opacity = 0.25 + Math.sin(t * 3) * 0.08;
  });

  return (
    <mesh ref={mesh} position={[0.12, -0.55, 0.9]} rotation={[-Math.PI / 4, 0, 0]}>
      <boxGeometry args={[0.22, 0.22, 2.6]} />
      <meshBasicMaterial color="#88ccff" transparent opacity={0.28} />
    </mesh>
  );
}

// ─── Character ────────────────────────────────────────────────────────────────
function Character({
  targetPos,
  moving,
  facingAngle,
}: {
  targetPos: [number, number, number];
  moving: boolean;
  facingAngle: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const lLegRef = useRef<THREE.Mesh>(null);
  const rLegRef = useRef<THREE.Mesh>(null);
  const lArmRef = useRef<THREE.Mesh>(null);
  const rArmRef = useRef<THREE.Mesh>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const swordRef = useRef<THREE.Group>(null);

  const smoothPos = useRef(new THREE.Vector3(...targetPos));
  const smoothRot = useRef(facingAngle);

  useFrame(({ clock }, delta) => {
    if (!groupRef.current || !bodyRef.current) return;
    const t = clock.elapsedTime;

    // Smooth position follow
    smoothPos.current.lerp(new THREE.Vector3(...targetPos), 1 - Math.exp(-12 * delta));
    groupRef.current.position.copy(smoothPos.current);

    // Smooth rotation towards facing direction
    const angleDiff = facingAngle - smoothRot.current;
    const wrapped = ((angleDiff + Math.PI) % (2 * Math.PI)) - Math.PI;
    smoothRot.current += wrapped * (1 - Math.exp(-14 * delta));
    groupRef.current.rotation.y = smoothRot.current;

    // Walk cycle
    const walkSpeed = moving ? 8 : 0;
    const walkAmt = moving ? 1 : 0;
    const phase = t * walkSpeed;

    // Bob body
    bodyRef.current.position.y = moving ? Math.abs(Math.sin(phase)) * 0.12 : 0;

    // Swing legs
    if (lLegRef.current) lLegRef.current.rotation.x = Math.sin(phase) * 0.55 * walkAmt;
    if (rLegRef.current) rLegRef.current.rotation.x = -Math.sin(phase) * 0.55 * walkAmt;

    // Swing arms (opposite to legs)
    if (lArmRef.current) lArmRef.current.rotation.x = -Math.sin(phase) * 0.4 * walkAmt;
    // Sword arm has limited swing
    if (rArmRef.current) rArmRef.current.rotation.x = Math.sin(phase) * 0.2 * walkAmt;

    // Idle head bob + moving tilt
    if (headRef.current) {
      headRef.current.rotation.z = moving ? Math.sin(phase * 0.5) * 0.04 : Math.sin(t * 1.1) * 0.015;
      headRef.current.rotation.x = moving ? -0.05 : Math.sin(t * 0.7) * 0.02;
    }

    // Sword idle sway
    if (swordRef.current) {
      swordRef.current.rotation.z = Math.sin(t * 1.3) * 0.04;
      swordRef.current.rotation.x = moving
        ? -Math.PI / 4 + Math.sin(phase * 0.5) * 0.12
        : -Math.PI / 4 + Math.sin(t * 0.9) * 0.04;
    }
  });

  return (
    <group ref={groupRef} position={targetPos}>
      <group ref={bodyRef}>
        {/* Shadow blob */}
        <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.55, 16]} />
          <meshBasicMaterial color="#000" transparent opacity={0.18} />
        </mesh>

        {/* Torso */}
        <mesh position={[0, 1.15, 0]} material={MAT_BODY} castShadow>
          <boxGeometry args={[0.72, 1.0, 0.36]} />
        </mesh>
        {/* Chest plate */}
        <mesh position={[0, 1.25, 0.19]} material={MAT_ARMOR} castShadow>
          <boxGeometry args={[0.58, 0.7, 0.08]} />
        </mesh>

        {/* Head */}
        <mesh ref={headRef} position={[0, 1.87, 0]} material={MAT_BODY} castShadow>
          <boxGeometry args={[0.54, 0.54, 0.54]} />
        </mesh>
        {/* Visor slit */}
        <mesh position={[0, 1.93, 0.28]} material={MAT_EDGE}>
          <boxGeometry args={[0.36, 0.06, 0.02]} />
        </mesh>

        {/* Left Leg */}
        <mesh ref={lLegRef} position={[-0.18, 0.38, 0]} material={MAT_BODY} castShadow>
          <boxGeometry args={[0.28, 0.76, 0.28]} />
        </mesh>
        {/* Right Leg */}
        <mesh ref={rLegRef} position={[0.18, 0.38, 0]} material={MAT_BODY} castShadow>
          <boxGeometry args={[0.28, 0.76, 0.28]} />
        </mesh>

        {/* Left Arm */}
        <mesh ref={lArmRef} position={[-0.5, 1.1, 0]} material={MAT_ARMOR} castShadow>
          <boxGeometry args={[0.24, 0.8, 0.24]} />
        </mesh>

        {/* Right Arm + Sword Group */}
        <group position={[0.5, 1.2, 0]}>
          <mesh ref={rArmRef} material={MAT_ARMOR} castShadow>
            <boxGeometry args={[0.24, 0.8, 0.24]} />
          </mesh>
          {/* Sword hand grip */}
          <group ref={swordRef} position={[0.06, -0.55, 0.18]}>
            {/* Hilt */}
            <mesh position={[0, 0, 0]} rotation={[-Math.PI / 4, 0, 0]} material={MAT_ARMOR} castShadow>
              <boxGeometry args={[0.12, 0.12, 0.35]} />
            </mesh>
            {/* Cross guard */}
            <mesh position={[0, 0, 0.2]} rotation={[-Math.PI / 4, 0, 0]} material={MAT_GUARD} castShadow>
              <boxGeometry args={[0.56, 0.1, 0.1]} />
            </mesh>
            {/* Blade */}
            <mesh position={[0, 0, 1.15]} rotation={[-Math.PI / 4, 0, 0]} material={MAT_SWORD} castShadow>
              <boxGeometry args={[0.08, 0.04, 2.0]} />
            </mesh>
            {/* Blade edge highlight */}
            <mesh position={[0.04, 0, 1.15]} rotation={[-Math.PI / 4, 0, 0]} material={MAT_EDGE}>
              <boxGeometry args={[0.01, 0.01, 1.98]} />
            </mesh>
            {/* Glow aura around sword */}
            <SwordGlow moving={moving} />
          </group>
        </group>
      </group>

      {/* Dust particles under feet */}
      <DustEmitter pos={new THREE.Vector3(...targetPos)} moving={moving} />
    </group>
  );
}

// ─── Path cross indicator ─────────────────────────────────────────────────────
function CrossPath() {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
      {/* Horizontal arm */}
      <mesh>
        <planeGeometry args={[LIMIT * 2, 0.6]} />
        <meshBasicMaterial color="#111" transparent opacity={0.06} />
      </mesh>
      {/* Vertical arm */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <planeGeometry args={[LIMIT * 2, 0.6]} />
        <meshBasicMaterial color="#111" transparent opacity={0.06} />
      </mesh>
      {/* Center marker */}
      <mesh position={[0, 0, 0]}>
        <circleGeometry args={[0.25, 16]} />
        <meshBasicMaterial color="#444" transparent opacity={0.25} />
      </mesh>
    </group>
  );
}

// ─── Controls HUD ─────────────────────────────────────────────────────────────
function ControlsHUD({ moving }: { moving: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: "100px",
        left: "50%",
        transform: "translateX(-50%)",
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "6px",
        zIndex: 30,
      }}
    >
      <div
        style={{
          background: moving ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.45)",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(255,255,255,0.15)",
          borderRadius: "10px",
          padding: "10px 16px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "6px",
          transition: "background 0.3s",
        }}
      >
        <span style={{ fontFamily: "monospace", fontSize: "9px", color: "rgba(255,255,255,0.5)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
          {moving ? "◈ Moving" : "Navigate"}
        </span>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
          {/* Top row */}
          <div style={{ display: "flex", gap: "3px" }}>
            {["W", "↑"].map(k => (
              <kbd key={k} style={keyStyle}>{k}</kbd>
            ))}
          </div>
          <div style={{ display: "flex", gap: "3px" }}>
            {["A", "←", "S", "↓", "D", "→"].map(k => (
              <kbd key={k} style={keyStyle}>{k}</kbd>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const keyStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.12)",
  border: "1px solid rgba(255,255,255,0.2)",
  borderRadius: "4px",
  padding: "3px 7px",
  fontFamily: "monospace",
  fontSize: "10px",
  color: "rgba(255,255,255,0.85)",
  minWidth: "22px",
  textAlign: "center",
  userSelect: "none",
};

// ─── Scene (physics + controls) ───────────────────────────────────────────────
function Scene({ onMoving }: { onMoving: (v: boolean) => void }) {
  const keys = useRef<Record<string, boolean>>({});
  const velX = useRef(0);
  const velZ = useRef(0);

  // Canonical position (restricted to cross)
  const posX = useRef(0);
  const posZ = useRef(0);

  // Facing angle
  const facingAngle = useRef(0);

  const [renderState, setRenderState] = useState({
    pos: [0, 0, 0] as [number, number, number],
    moving: false,
    angle: 0,
  });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
      // Prevent page scroll on arrow keys
      if (["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e.code)) {
        e.preventDefault();
      }
    };
    const up = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);

  useFrame((_, delta) => {
    const up    = keys.current["ArrowUp"]    || keys.current["KeyW"];
    const down  = keys.current["ArrowDown"]  || keys.current["KeyS"];
    const left  = keys.current["ArrowLeft"]  || keys.current["KeyA"];
    const right = keys.current["ArrowRight"] || keys.current["KeyD"];

    const inputX = (right ? 1 : 0) - (left ? 1 : 0);
    const inputZ = (down ? 1 : 0)  - (up ? 1 : 0);

    const onCrossX = Math.abs(posZ.current) < 0.35;
    const onCrossZ = Math.abs(posX.current) < 0.35;

    // Determine which axis is allowed
    let allowX = false, allowZ = false;
    if (onCrossX && onCrossZ) {
      // At intersection — allow any direction
      allowX = true;
      allowZ = true;
    } else if (onCrossX) {
      // On horizontal arm — allow X movement and small Z correction
      allowX = true;
      allowZ = false;
    } else if (onCrossZ) {
      // On vertical arm — allow Z movement and small X correction
      allowZ = true;
      allowX = false;
    }

    // Apply acceleration
    if (allowX && inputX !== 0) {
      velX.current += inputX * ACCEL * delta;
    } else {
      velX.current *= Math.pow(1 - Math.min(1, FRICTION * delta), 1);
    }
    if (allowZ && inputZ !== 0) {
      velZ.current += inputZ * ACCEL * delta;
    } else {
      velZ.current *= Math.pow(1 - Math.min(1, FRICTION * delta), 1);
    }

    // Clamp speed
    const sp = Math.sqrt(velX.current ** 2 + velZ.current ** 2);
    if (sp > SPEED) {
      velX.current = (velX.current / sp) * SPEED;
      velZ.current = (velZ.current / sp) * SPEED;
    }

    // Integrate position
    posX.current = THREE.MathUtils.clamp(posX.current + velX.current * delta, -LIMIT, LIMIT);
    posZ.current = THREE.MathUtils.clamp(posZ.current + velZ.current * delta, -LIMIT, LIMIT);

    // Snap to cross arm if drifting off path
    if (!onCrossX && Math.abs(velZ.current) < 0.1) posZ.current *= 0.85;
    if (!onCrossZ && Math.abs(velX.current) < 0.1) posX.current *= 0.85;

    // Update facing angle from velocity
    const moving = sp > 0.15;
    if (moving) {
      const targetAngle = Math.atan2(velX.current, velZ.current);
      facingAngle.current = targetAngle;
    }

    onMoving(moving);

    setRenderState({
      pos: [posX.current, 0, posZ.current],
      moving,
      angle: facingAngle.current,
    });
  });

  return (
    <>
      {/* Lights */}
      <ambientLight intensity={1.8} />
      <directionalLight
        position={[12, 18, 12]}
        intensity={2.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.1}
        shadow-camera-far={80}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
      />
      <directionalLight position={[-8, 6, -8]} intensity={0.6} color="#8888ff" />
      <pointLight position={[0, 8, 0]} intensity={1.2} color="#aaddff" distance={25} />

      {/* Subtle cross path overlay */}
      <CrossPath />

      {/* Character */}
      <Character
        targetPos={renderState.pos}
        moving={renderState.moving}
        facingAngle={renderState.angle}
      />

      {/* Ambient sparkles when idle */}
      {!renderState.moving && (
        <Sparkles
          count={18}
          scale={[6, 3, 6]}
          position={[renderState.pos[0], 1.5, renderState.pos[2]]}
          size={0.6}
          speed={0.25}
          opacity={0.3}
          color="#aaddff"
        />
      )}
    </>
  );
}

// ─── Camera Controller ────────────────────────────────────────────────────────
function IsometricCamera() {
  const { camera } = useThree();
  useEffect(() => {
    // Perfect isometric: 45° around Y, then tilt ~35.26°
    camera.position.set(24, 24, 24);
    camera.lookAt(0, 0, 0);
  }, [camera]);
  return null;
}

// ─── Root Export ─────────────────────────────────────────────────────────────
export function InteractiveHeroImage() {
  const [mounted, setMounted] = useState(false);
  const [moving, setMoving] = useState(false);

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
      {/* Monochrome pixel art background */}
      <img
        src="/system-shots/monochrome-illustration-science-fiction-arch-pixel-art-Devine-Lu-Linvega-2268380-wallhere.com (1).jpg"
        alt="Architecture Background"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: "contrast(1.05) brightness(0.97)" }}
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(250,250,250,0.45) 100%)",
        }}
      />

      {/* 3D Canvas — pointer-events none so page scrolls freely */}
      <div className="absolute inset-0 w-full h-full" style={{ pointerEvents: "none" }}>
        <Canvas shadows gl={{ antialias: true, alpha: true }}>
          <OrthographicCamera
            makeDefault
            position={[24, 24, 24]}
            zoom={46}
            near={-200}
            far={200}
          />
          <IsometricCamera />
          <Scene onMoving={setMoving} />
        </Canvas>
      </div>

      {/* HUD overlay */}
      <ControlsHUD moving={moving} />
    </div>
  );
}
