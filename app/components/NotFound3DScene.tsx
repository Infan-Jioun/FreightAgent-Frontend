"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls, Text } from "@react-three/drei";
import * as THREE from "three";

interface NotFound3DSceneProps {
  isScanning: boolean;
  reducedMotion?: boolean;
}

/* ──────────────────────────────────────────────────────────────────────────
 * High-Tech Lost Cargo Container (FAZU-404)
 * ────────────────────────────────────────────────────────────────────────── */
function LostContainer({ isScanning }: { isScanning: boolean }) {
  const containerRef = useRef<THREE.Group>(null);
  const beaconLightRef = useRef<THREE.PointLight>(null);
  const scanCageRef = useRef<THREE.Mesh>(null);

  // Corrugation ribs along long faces
  const ribs = useMemo(() => {
    const list: number[] = [];
    const count = 18;
    for (let i = 0; i < count; i++) {
      list.push(-1.9 + (i * 3.8) / (count - 1));
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Gentle slow tumbling drift in zero-gravity / deep-ocean coordinates
    if (containerRef.current) {
      containerRef.current.rotation.y += delta * 0.08;
      containerRef.current.rotation.z = Math.sin(t * 0.3) * 0.08;
      containerRef.current.rotation.x = Math.cos(t * 0.25) * 0.05;
    }

    // Holographic scan cage counter-rotation
    if (scanCageRef.current) {
      scanCageRef.current.rotation.y -= delta * 0.15;
      scanCageRef.current.rotation.x = Math.sin(t * 0.5) * 0.1;
    }

    // Emergency distress beacon blink (dual flash pattern: blinks like an ELT transponder)
    if (beaconLightRef.current) {
      const flash = Math.sin(t * 4) > 0.6 ? 2.5 : 0.2;
      beaconLightRef.current.intensity = isScanning ? 4.0 : flash;
    }
  });

  const L = 4.2;
  const H = 2.0;
  const W = 1.9;

  return (
    <group ref={containerRef}>
      {/* Main Container Shell */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[L, H, W]} />
        <meshStandardMaterial
          color="#0c1f1f"
          roughness={0.45}
          metalness={0.8}
          envMapIntensity={0.6}
        />
      </mesh>

      {/* Corrugation ribs (Front & Back) */}
      {ribs.map((x, i) => (
        <group key={`rib-${i}`}>
          {/* Front Rib */}
          <mesh position={[x, 0, W / 2 + 0.03]} castShadow>
            <boxGeometry args={[0.08, H * 0.94, 0.04]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#0a1717" : "#0f2b2b"}
              metalness={0.85}
              roughness={0.5}
            />
          </mesh>
          {/* Back Rib */}
          <mesh position={[x, 0, -W / 2 - 0.03]} castShadow>
            <boxGeometry args={[0.08, H * 0.94, 0.04]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? "#0a1717" : "#0f2b2b"}
              metalness={0.85}
              roughness={0.5}
            />
          </mesh>
        </group>
      ))}

      {/* ISO Corner Castings */}
      {[-1, 1].map((cx) =>
        [-1, 1].map((cy) =>
          [-1, 1].map((cz) => (
            <mesh
              key={`corner-${cx}-${cy}-${cz}`}
              position={[(cx * L) / 2, (cy * H) / 2, (cz * W) / 2]}
              castShadow
            >
              <boxGeometry args={[0.22, 0.22, 0.22]} />
              <meshStandardMaterial
                color="#060c0c"
                metalness={0.9}
                roughness={0.3}
              />
            </mesh>
          ))
        )
      )}

      {/* Door End (Right Side) */}
      <group position={[L / 2 + 0.02, 0, 0]}>
        <mesh castShadow>
          <boxGeometry args={[0.04, H * 0.96, W * 0.96]} />
          <meshStandardMaterial
            color="#091818"
            metalness={0.85}
            roughness={0.5}
          />
        </mesh>
        {/* Vertical locking rods */}
        {[-0.5, -0.16, 0.16, 0.5].map((zPos, i) => (
          <mesh key={`lock-${i}`} position={[0.03, 0, zPos]} castShadow>
            <cylinderGeometry args={[0.02, 0.02, H * 0.9, 8]} />
            <meshStandardMaterial
              color="#00c9a7"
              emissive="#00c9a7"
              emissiveIntensity={0.2}
              metalness={0.9}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>

      {/* Glowing Brand Accent Stripe */}
      <mesh position={[0, 0.55, W / 2 + 0.045]}>
        <planeGeometry args={[L * 0.85, 0.12]} />
        <meshStandardMaterial
          color="#00c9a7"
          emissive="#00c9a7"
          emissiveIntensity={isScanning ? 1.8 : 0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Emergency Distress Beacon atop Front-Right Corner */}
      <group position={[L / 2 - 0.15, H / 2 + 0.15, W / 2 - 0.15]}>
        {/* Beacon Mount */}
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.12, 12]} />
          <meshStandardMaterial color="#1a1a1a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Glowing Lens */}
        <mesh position={[0, 0.1, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial
            color="#ff6b6b"
            emissive="#ff6b6b"
            emissiveIntensity={isScanning ? 3.5 : 1.8}
            roughness={0.1}
          />
        </mesh>
        <pointLight
          ref={beaconLightRef}
          position={[0, 0.15, 0]}
          color="#ff6b6b"
          distance={6}
          decay={2}
        />
      </group>

      {/* Stenciled 3D Markings */}
      <Text
        position={[-0.8, 0.1, W / 2 + 0.05]}
        fontSize={0.22}
        color="#e0faf5"
        letterSpacing={0.06}
        anchorX="left"
        anchorY="middle"
      >
        FAZU-404-LOST
      </Text>
      <Text
        position={[-0.8, -0.22, W / 2 + 0.05]}
        fontSize={0.11}
        color="#00c9a7"
        letterSpacing={0.08}
        anchorX="left"
        anchorY="middle"
      >
        STATUS: TELEMETRY DESYNC
      </Text>
      <Text
        position={[-0.8, -0.42, W / 2 + 0.05]}
        fontSize={0.09}
        color="#ff6b6b"
        letterSpacing={0.05}
        anchorX="left"
        anchorY="middle"
      >
        SECTOR: [UNMAPPED_COORDINATE]
      </Text>

      {/* Holographic Wireframe Scan Cage */}
      <mesh ref={scanCageRef}>
        <boxGeometry args={[L * 1.16, H * 1.25, W * 1.25]} />
        <meshBasicMaterial
          color={isScanning ? "#00e5c0" : "#00c9a7"}
          wireframe
          transparent
          opacity={isScanning ? 0.45 : 0.18}
        />
      </mesh>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Holographic Sonar Radar Rings & Rotating Scan Sweep
 * ────────────────────────────────────────────────────────────────────────── */
function HolographicRadar({ isScanning }: { isScanning: boolean }) {
  const sweepRef = useRef<THREE.Group>(null);
  const pulseRingRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime();

    // Constant rotation for radar sweep
    if (sweepRef.current) {
      sweepRef.current.rotation.y += delta * (isScanning ? 2.5 : 0.8);
    }

    // Pulsing expand ring
    if (pulseRingRef.current) {
      const scaleCycle = ((t * (isScanning ? 1.6 : 0.7)) % 1);
      const s = 1 + scaleCycle * 3.5;
      pulseRingRef.current.scale.set(s, s, s);
      const mat = pulseRingRef.current.material as THREE.MeshBasicMaterial;
      if (mat) {
        mat.opacity = (1 - scaleCycle) * (isScanning ? 0.6 : 0.25);
      }
    }
  });

  return (
    <group position={[0, -2.4, 0]}>
      {/* Concentric Base Radar Rings */}
      {[2.2, 4.0, 5.8, 7.6].map((radius, idx) => (
        <mesh key={`ring-${idx}`} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius - 0.025, radius + 0.025, 64]} />
          <meshBasicMaterial
            color="#00c9a7"
            transparent
            opacity={0.12 + idx * 0.04}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {/* Expanding Sonar Pulse Wave */}
      <mesh ref={pulseRingRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.8, 1.95, 64]} />
        <meshBasicMaterial
          color={isScanning ? "#00e5c0" : "#00b4d8"}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Rotating Radar Sweep Cone/Line */}
      <group ref={sweepRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 7.6, 32, 1, 0, Math.PI / 3]} />
          <meshBasicMaterial
            color="#00c9a7"
            transparent
            opacity={0.08}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Leading edge line */}
        <mesh position={[3.8, 0, 0]} rotation={[0, 0, 0]}>
          <boxGeometry args={[7.6, 0.02, 0.02]} />
          <meshBasicMaterial color="#00e5c0" transparent opacity={0.4} />
        </mesh>
      </group>
    </group>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Drifting Deep-Ocean / Space Telemetry Particle Field
 * ────────────────────────────────────────────────────────────────────────── */
function TelemetryParticles({ isScanning }: { isScanning: boolean }) {
  const pointsRef = useRef<THREE.Points>(null);

  const [positions, colors] = useMemo(() => {
    const count = 160;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    const teal = new THREE.Color("#00c9a7");
    const cyan = new THREE.Color("#00b4d8");
    const amber = new THREE.Color("#ff6b6b");

    for (let i = 0; i < count; i++) {
      // Spread across a sphere radius of 14
      const radius = 2.5 + Math.random() * 11.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      pos[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = radius * Math.cos(phi);

      const chosenColor = Math.random() > 0.85 ? amber : Math.random() > 0.5 ? cyan : teal;
      col[i * 3] = chosenColor.r;
      col[i * 3 + 1] = chosenColor.g;
      col[i * 3 + 2] = chosenColor.b;
    }

    return [pos, col];
  }, []);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * (isScanning ? 0.08 : 0.02);
    pointsRef.current.rotation.x += delta * (isScanning ? 0.04 : 0.01);
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute
          attach="attributes-color"
          args={[colors, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        vertexColors
        transparent
        opacity={isScanning ? 0.9 : 0.65}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}

/* ──────────────────────────────────────────────────────────────────────────
 * Root 3D Scene Component
 * ────────────────────────────────────────────────────────────────────────── */
export default function NotFound3DScene({ isScanning, reducedMotion = false }: NotFound3DSceneProps) {
  const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setDpr([1, Math.min(window.devicePixelRatio, 1.75)]);
    }
  }, []);

  return (
    <Canvas
      dpr={dpr}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      }}
      camera={{ position: [0, 0.8, 8.5], fov: 38 }}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      style={{ touchAction: "pan-y" }}
    >
      <fog attach="fog" args={["#0a0f0f", 9, 26]} />

      {/* Atmospheric Cinematic Lighting */}
      <ambientLight intensity={0.45} color="#0c2b28" />
      <directionalLight
        position={[5, 8, 5]}
        intensity={1.5}
        color="#e0faf5"
        castShadow
      />
      <directionalLight
        position={[-6, -3, -4]}
        intensity={0.9}
        color="#00b4d8"
      />
      <pointLight
        position={[0, 0, 4]}
        intensity={isScanning ? 2.5 : 0.8}
        color="#00c9a7"
        distance={12}
      />

      {/* Floating 3D Elements */}
      <Float
        speed={reducedMotion ? 0 : 1.2}
        rotationIntensity={reducedMotion ? 0 : 0.3}
        floatIntensity={reducedMotion ? 0 : 0.6}
      >
        <LostContainer isScanning={isScanning} />
      </Float>

      {/* Radar Sonar & Telemetry Field */}
      <HolographicRadar isScanning={isScanning} />
      <TelemetryParticles isScanning={isScanning} />

      {/* Controlled Interactive Orbiting (Parallax + Drag Inspection) */}
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.5}
        dampingFactor={0.05}
        maxPolarAngle={Math.PI * 0.65}
        minPolarAngle={Math.PI * 0.35}
      />
    </Canvas>
  );
}
