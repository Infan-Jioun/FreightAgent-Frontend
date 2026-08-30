"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Line, PerspectiveCamera } from "@react-three/drei";
import * as THREE from "three";

const HUBS = [
  { name: "New York", lat: 40.7, lon: -74.0 },
  { name: "Rotterdam", lat: 51.9, lon: 4.5 },
  { name: "Dubai", lat: 25.2, lon: 55.3 },
  { name: "Singapore", lat: 1.35, lon: 103.8 },
  { name: "Shanghai", lat: 31.2, lon: 121.5 },
  { name: "Los Angeles", lat: 34.0, lon: -118.2 },
  { name: "Hamburg", lat: 53.5, lon: 10.0 },
  { name: "Mumbai", lat: 19.1, lon: 72.9 },
  { name: "Sydney", lat: -33.9, lon: 151.2 },
];

const ROUTES: [number, number][] = [
  [4, 2], // Shanghai -> Dubai
  [2, 1], // Dubai -> Rotterdam
  [0, 6], // New York -> Hamburg
  [5, 4], // LA -> Shanghai
  [3, 7], // Singapore -> Mumbai
  [4, 8], // Shanghai -> Sydney
  [3, 2], // Singapore -> Dubai
];

const RADIUS = 2.4;

function toVector3(lat: number, lon: number, r = RADIUS) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function arcPoints(a: THREE.Vector3, b: THREE.Vector3) {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  mid.setLength(RADIUS * 1.35);
  const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
  return curve.getPoints(48);
}

function ShipmentPulse({ points }: { points: THREE.Vector3[] }) {
  const ref = useRef<THREE.Mesh>(null);
  const offset = useMemo(() => Math.random(), []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = (state.clock.getElapsedTime() * 0.15 + offset) % 1;
    const idx = Math.floor(t * (points.length - 1));
    ref.current.position.copy(points[idx]);
  });

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshStandardMaterial
        color="#00e5c0"
        emissive="#00e5c0"
        emissiveIntensity={2}
      />
    </mesh>
  );
}

function Globe() {
  const globeRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (globeRef.current) globeRef.current.rotation.y += delta * 0.06;
  });

  const hubVectors = useMemo(
    () => HUBS.map((h) => toVector3(h.lat, h.lon)),
    []
  );

  const routeLines = useMemo(
    () => ROUTES.map(([a, b]) => arcPoints(hubVectors[a], hubVectors[b])),
    [hubVectors]
  );

  return (
    <group ref={globeRef}>
      {/* base sphere - wireframe latitude/longitude feel */}
      <mesh>
        <sphereGeometry args={[RADIUS, 48, 48]} />
        <meshStandardMaterial
          color="#0d1f1f"
          roughness={0.9}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[RADIUS * 1.001, 24, 24]} />
        <meshBasicMaterial color="#00c9a7" wireframe transparent opacity={0.08} />
      </mesh>

      {/* hub nodes */}
      {hubVectors.map((v, i) => (
        <mesh key={HUBS[i].name} position={v}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial
            color="#00e5c0"
            emissive="#00e5c0"
            emissiveIntensity={1.4}
          />
        </mesh>
      ))}

      {/* route arcs */}
      {routeLines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#00c9a7"
          transparent
          opacity={0.35}
          lineWidth={1}
        />
      ))}

      {/* traveling shipment pulses */}
      {routeLines.map((pts, i) => (
        <ShipmentPulse key={i} points={pts} />
      ))}
    </group>
  );
}

export function GlobalNetwork() {
  return (
    <section
      id="global-network"
      className="relative px-6 py-28 md:py-36"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p
            className="text-xs tracking-widest mb-3 uppercase"
            style={{ color: "var(--accent-primary)" }}
          >
            Global logistics network
          </p>
          <h2
            className="text-3xl md:text-5xl font-bold mb-6 leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            One network.
            <br />
            Every destination.
          </h2>
          <p
            className="text-base md:text-lg leading-relaxed max-w-md"
            style={{ color: "var(--text-secondary)" }}
          >
            Connect your freight operations across borders, ports, carriers,
            and destinations from one intelligent platform — from Shanghai to
            Rotterdam, Dubai to Los Angeles.
          </p>
        </div>

        <div className="relative h-[420px] md:h-[520px] rounded-3xl overflow-hidden" style={{ border: "1px solid var(--border-primary)" }}>
          <Canvas dpr={[1, 1.5]}>
            <Suspense fallback={null}>
              <PerspectiveCamera makeDefault fov={45} position={[0, 0.5, 6.5]} />
              <ambientLight intensity={0.5} />
              <directionalLight position={[3, 4, 5]} intensity={1} color="#e0faf5" />
              <Globe />
            </Suspense>
          </Canvas>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse at center, transparent 55%, rgba(10,15,15,0.7) 100%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}

export default GlobalNetwork;
