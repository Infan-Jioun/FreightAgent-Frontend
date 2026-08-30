"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";
import { ContainerModel } from "./ContainerModel";
import { useScrollProgress } from "./useScrollProgress";

const STOPS = [
  { x: -8, label: "Warehouse" },
  { x: -4, label: "Port" },
  { x: 0, label: "Cargo Ship" },
  { x: 4, label: "Port" },
  { x: 8, label: "Destination" },
];

function Station({ x, kind }: { x: number; kind: "warehouse" | "port" | "ship" }) {
  if (kind === "warehouse")
    return (
      <mesh position={[x, -0.4, -1.5]} castShadow receiveShadow>
        <boxGeometry args={[2.2, 1.4, 1.6]} />
        <meshStandardMaterial color="#0d1f1f" roughness={0.9} />
      </mesh>
    );
  if (kind === "ship")
    return (
      <mesh position={[x, -0.9, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.9, 2]} />
        <meshStandardMaterial color="#06110f" roughness={0.8} metalness={0.3} />
      </mesh>
    );
  // port crane
  return (
    <group position={[x, 0, -1.8]}>
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[0.18, 2.4, 0.18]} />
        <meshStandardMaterial color="#00c9a7" roughness={0.4} metalness={0.7} />
      </mesh>
      <mesh position={[0.7, 2.2, 0]} castShadow>
        <boxGeometry args={[1.6, 0.12, 0.12]} />
        <meshStandardMaterial color="#00c9a7" roughness={0.4} metalness={0.7} />
      </mesh>
    </group>
  );
}

function Scene({ progress }: { progress: number }) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const trackLength = 18; // -9 .. 9
  const camX = -9 + progress * trackLength;

  useFrame(() => {
    if (!camera.current) return;
    camera.current.position.x = THREE.MathUtils.lerp(camera.current.position.x, camX, 0.1);
    camera.current.lookAt(camX + 2.2, 0, 0);
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={50} position={[-9, 1.4, 5]} />
      <fog attach="fog" args={["#0a0f0f", 8, 24]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 6, 4]} intensity={1.2} color="#e0faf5" castShadow />
      <pointLight position={[camX, 3, 2]} intensity={0.8} color="#00c9a7" />

      <ContainerModel position={[camX - 6.5, -0.1, 0.2]} rotation={[0, 0.3, 0]} scale={0.85} />

      <Station x={-8} kind="warehouse" />
      <Station x={-4} kind="port" />
      <Station x={0} kind="ship" />
      <Station x={4} kind="port" />
      <mesh position={[8, -0.5, -1.2]} castShadow receiveShadow>
        <boxGeometry args={[2, 1.2, 1.4]} />
        <meshStandardMaterial color="#0d1f1f" roughness={0.9} />
      </mesh>

      {/* ground */}
      <mesh position={[0, -1.3, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[40, 10]} />
        <meshStandardMaterial color="#050b0a" roughness={1} />
      </mesh>

      <ContactShadows position={[0, -1.28, 0]} opacity={0.5} scale={30} blur={2} far={4} />
      <Environment preset="warehouse" />
    </>
  );
}

export function LogisticsInfrastructure() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { progress } = useScrollProgress(sectionRef);
  const activeIdx = Math.min(STOPS.length - 1, Math.floor(progress * STOPS.length));

  return (
    <section ref={sectionRef} className="relative h-[220vh]" style={{ background: "var(--bg-primary)" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <div className="absolute inset-0">
          <Canvas shadows dpr={[1, 1.5]}>
            <Suspense fallback={null}>
              <Scene progress={progress} />
            </Suspense>
          </Canvas>
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(10,15,15,0.8) 100%)" }}
        />

        <div className="relative z-10 h-full flex flex-col items-center justify-between px-6 py-16 md:py-24 text-center">
          <div>
            <p className="text-xs tracking-widest mb-3 uppercase" style={{ color: "var(--accent-primary)" }}>
              Logistics infrastructure
            </p>
            <h2 className="text-3xl md:text-5xl font-bold max-w-2xl" style={{ color: "var(--text-primary)" }}>
              Every movement.
              <br />
              One intelligent system.
            </h2>
          </div>

          <div className="flex items-center gap-3 md:gap-6">
            {STOPS.map((stop, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full transition-all"
                  style={{
                    background: i <= activeIdx ? "var(--accent-primary)" : "var(--border-primary)",
                    boxShadow: i === activeIdx ? "0 0 12px var(--accent-primary)" : "none",
                  }}
                />
                <span
                  className="text-[10px] md:text-xs tracking-wide"
                  style={{ color: i <= activeIdx ? "var(--text-primary)" : "var(--text-muted)" }}
                >
                  {stop.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default LogisticsInfrastructure;
