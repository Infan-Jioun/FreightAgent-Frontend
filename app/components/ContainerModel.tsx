"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Procedural shipping container.
 *
 * This is intentionally built as a self-contained group so it can be
 * swapped later for a real GLB/GLTF model:
 *
 *   const { scene } = useGLTF("/models/container.glb");
 *   return <primitive object={scene} />;
 *
 * Keep the outer group API (position/rotation/scale via props) identical
 * so Hero3D / LogisticsInfrastructure / FinalCTA don't need to change.
 */

const CONTAINER_TEAL = "#0c2b28";
const CONTAINER_ACCENT = "#00c9a7";
const CORTEN_RUST = "#3a2418";

function CorrugatedPanel({
  width,
  height,
  position,
  rotation,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [number, number, number];
}) {
  const ridgeCount = Math.round(width / 0.22);
  const ridges = Array.from({ length: ridgeCount });
  return (
    <group position={position} rotation={rotation}>
      <mesh receiveShadow castShadow>
        <boxGeometry args={[width, height, 0.06]} />
        <meshStandardMaterial
          color={CONTAINER_TEAL}
          roughness={0.65}
          metalness={0.75}
        />
      </mesh>
      {ridges.map((_, i) => (
        <mesh
          key={i}
          position={[-width / 2 + 0.11 + i * 0.22, 0, 0.035]}
          castShadow
        >
          <boxGeometry args={[0.05, height * 0.98, 0.03]} />
          <meshStandardMaterial
            color={CONTAINER_TEAL}
            roughness={0.5}
            metalness={0.85}
          />
        </mesh>
      ))}
    </group>
  );
}

function CornerCasting({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position} castShadow>
      <boxGeometry args={[0.22, 0.22, 0.22]} />
      <meshStandardMaterial color="#111a1a" roughness={0.4} metalness={0.9} />
    </mesh>
  );
}

export function ContainerModel({
  position = [0, 0, 0] as [number, number, number],
  rotation = [0, 0.5, 0] as [number, number, number],
  scale = 1,
  drift = true,
}: {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  drift?: boolean;
}) {
  const group = useRef<THREE.Group>(null);
  const L = 4.0; // length (x)
  const H = 1.9; // height (y)
  const W = 1.6; // width/depth (z)

  useFrame((state) => {
    if (!drift || !group.current) return;
    const t = state.clock.getElapsedTime();
    group.current.position.y = position[1] + Math.sin(t * 0.5) * 0.04;
    group.current.rotation.y = rotation[1] + Math.sin(t * 0.15) * 0.03;
  });

  return (
    <group ref={group} position={position} rotation={rotation} scale={scale}>
      {/* main body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[L, H, W]} />
        <meshStandardMaterial
          color={CONTAINER_TEAL}
          roughness={0.6}
          metalness={0.7}
        />
      </mesh>

      {/* corrugated long sides */}
      <CorrugatedPanel
        width={L}
        height={H}
        position={[0, 0, W / 2 + 0.005]}
        rotation={[0, 0, 0]}
      />
      <CorrugatedPanel
        width={L}
        height={H}
        position={[0, 0, -W / 2 - 0.005]}
        rotation={[0, Math.PI, 0]}
      />

      {/* rear doors */}
      <group position={[L / 2 + 0.02, 0, 0]}>
        {[-1, 1].map((side) => (
          <group key={side} position={[0, 0, (side * W) / 4]}>
            <mesh castShadow>
              <boxGeometry args={[0.05, H * 0.95, W / 2 - 0.03]} />
              <meshStandardMaterial
                color={CONTAINER_TEAL}
                roughness={0.5}
                metalness={0.8}
              />
            </mesh>
            {/* locking bars */}
            {[-0.5, 0.5].map((yOff) => (
              <mesh key={yOff} position={[0.04, yOff * H * 0.35, 0]} castShadow>
                <boxGeometry args={[0.03, 0.85, 0.06]} />
                <meshStandardMaterial
                  color="#c9d6d4"
                  roughness={0.3}
                  metalness={0.95}
                />
              </mesh>
            ))}
          </group>
        ))}
      </group>

      {/* corner castings */}
      {[-1, 1].map((xs) =>
        [-1, 1].map((ys) =>
          [-1, 1].map((zs) => (
            <CornerCasting
              key={`${xs}-${ys}-${zs}`}
              position={[
                (xs * L) / 2,
                (ys * H) / 2,
                (zs * W) / 2,
              ]}
            />
          ))
        )
      )}

      {/* accent stripe / brand marking */}
      <mesh position={[0, H * 0.05, W / 2 + 0.045]}>
        <planeGeometry args={[L * 0.4, H * 0.14]} />
        <meshStandardMaterial
          color={CONTAINER_ACCENT}
          emissive={CONTAINER_ACCENT}
          emissiveIntensity={0.25}
          roughness={0.4}
        />
      </mesh>

      {/* subtle rust / weathering streaks */}
      {[-1.2, -0.2, 1.1].map((x, i) => (
        <mesh
          key={i}
          position={[x, -H / 2 + 0.3, W / 2 + 0.046]}
          rotation={[0, 0, 0]}
        >
          <planeGeometry args={[0.05, 0.5]} />
          <meshStandardMaterial
            color={CORTEN_RUST}
            transparent
            opacity={0.35}
            roughness={0.9}
          />
        </mesh>
      ))}
    </group>
  );
}
