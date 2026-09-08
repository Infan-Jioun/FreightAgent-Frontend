/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/immutability */
"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, Instance, Instances, PerspectiveCamera } from "@react-three/drei";
import { motion } from "framer-motion";
import Link from "next/link";
import * as THREE from "three";
import { useScrollProgress, usePointerParallax } from "./useScrollProgress";
import { ROUTES } from "@/app/constants/routes";

/* ------------------------------------------------------------------ */
/* Shared ship dimensions                                             */
/* ------------------------------------------------------------------ */

const SHIP_LENGTH = 14;
const SHIP_BEAM = 3.2;
const HULL_HEIGHT = 1.0;
const BOW_TAPER = 3.2;

// Mirrors the FreightAgent CSS variables (--accent-primary / --accent-secondary /
// --accent-blue). Three.js light/material `color` props take real color
// values, not CSS custom properties, so these are hardcoded to match.
const COLOR_ACCENT_PRIMARY = "#00C9A7";
const COLOR_ACCENT_SECONDARY = "#00e5c0";
const COLOR_ACCENT_BLUE = "#3B82F6";

const CONTAINER_COLORS = ["#0f5c52", "#1a2a44", "#8c3a3a", "#4a4a4a", "#a6742f", "#123a44"];

/* ------------------------------------------------------------------ */
/* Small local hook: coarse mobile flag to trim 3D complexity          */
/* ------------------------------------------------------------------ */

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    setIsMobile(mq.matches);
    const listener = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);
  return isMobile;
}

/* ------------------------------------------------------------------ */
/* Ocean: large plane with sin/cos vertex displacement                */
/* ------------------------------------------------------------------ */

function Ocean({ segments, reducedMotion }: { segments: number; reducedMotion: boolean }) {
  const geometry = useMemo(() => {
    return new THREE.PlaneGeometry(140, 100, segments, Math.round(segments * 0.7));
  }, [segments]);

  const basePositions = useMemo(() => {
    return Float32Array.from(geometry.attributes.position.array as Float32Array);
  }, [geometry]);

  useFrame((state) => {
    if (reducedMotion) return;
    const t = state.clock.getElapsedTime();
    const posAttr = geometry.attributes.position as THREE.BufferAttribute;
    const arr = posAttr.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      const x = basePositions[i];
      const y = basePositions[i + 1];
      // Layered slow waves + small ripples — cheap CPU displacement is
      // plenty for a background ocean at this scale; normals are left
      // as-is (not recomputed every frame) to keep this affordable.
      const wave =
        Math.sin(x * 0.12 + t * 0.55) * 0.22 +
        Math.cos(y * 0.18 + t * 0.4) * 0.14 +
        Math.sin((x + y) * 0.3 + t * 1.0) * 0.05;
      arr[i + 2] = wave;
    }
    posAttr.needsUpdate = true;
  });

  return (
    <mesh geometry={geometry} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, -8]} receiveShadow>
      <meshStandardMaterial color="#0a2f33" roughness={0.35} metalness={0.2} side={THREE.DoubleSide} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Ship wake: soft foam trail behind the stern, gently scrolling       */
/* ------------------------------------------------------------------ */

function ShipWake({ reducedMotion }: { reducedMotion: boolean }) {
  const texture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const gradient = ctx.createRadialGradient(size / 2, size * 0.18, 4, size / 2, size * 0.18, size * 0.8);
    gradient.addColorStop(0, "rgba(255,255,255,0.5)");
    gradient.addColorStop(0.45, "rgba(255,255,255,0.16)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    return tex;
  }, []);

  useFrame((_, delta) => {
    if (!texture || reducedMotion) return;
    texture.offset.y = (texture.offset.y - delta * 0.1) % 1;
  });

  if (!texture) return null;

  return (
    <mesh position={[0, -0.05, -SHIP_LENGTH / 2 - 3.4]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[2.6, 7.5]} />
      <meshBasicMaterial
        map={texture}
        transparent
        opacity={0.45}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Bow wedge: hand-built tapered geometry for the ship's pointed bow   */
/* ------------------------------------------------------------------ */

function createBowWedgeGeometry(length: number, width: number, height: number): THREE.BufferGeometry {
  const hw = width / 2;
  const positions = new Float32Array([
    -hw, 0, 0, // 0 back-bottom-left
    hw, 0, 0, // 1 back-bottom-right
    -hw, height, 0, // 2 back-top-left
    hw, height, 0, // 3 back-top-right
    0, 0, length, // 4 front-bottom tip
    0, height, length, // 5 front-top tip
  ]);

  const indices = [
    0, 1, 3, 0, 3, 2, // back face
    0, 4, 1, // bottom, tapering to the tip
    3, 5, 2, // deck, tapering to the tip
    0, 2, 5, 0, 5, 4, // left hull plate
    1, 4, 5, 1, 5, 3, // right hull plate
  ];

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

/* ------------------------------------------------------------------ */
/* Container stacks: instanced boxes so 20-40 containers stay cheap    */
/* ------------------------------------------------------------------ */

interface ContainerInstanceData {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
  color: string;
}

function buildContainerLayout(
  rows: number,
  cols: number,
  deckY: number,
  beam: number,
  zStart: number,
  zEnd: number,
  maxLayers: number
): ContainerInstanceData[] {
  const items: ContainerInstanceData[] = [];
  const unitW = 0.55;
  const unitL = 0.9;
  const unitH = 0.5;
  const marginX = (beam - rows * unitW) / 2;
  const totalLen = zEnd - zStart;
  const gapZ = cols > 1 ? (totalLen - cols * unitL) / (cols - 1) : 0;

  // Deterministic pseudo-random so layout is stable across re-renders.
  let seed = 0;
  const rand = () => {
    seed += 1;
    const x = Math.sin(seed * 999.123) * 43758.5453;
    return x - Math.floor(x);
  };

  for (let c = 0; c < cols; c++) {
    const z = zStart + c * (unitL + gapZ) + unitL / 2;
    for (let r = 0; r < rows; r++) {
      const x = -beam / 2 + marginX + r * unitW + unitW / 2;
      const layerCount = Math.max(1, Math.round(1 + rand() * (maxLayers - 1)));
      for (let l = 0; l < layerCount; l++) {
        const y = deckY + unitH / 2 + l * unitH;
        const color = CONTAINER_COLORS[Math.floor(rand() * CONTAINER_COLORS.length)];
        const jitter = (rand() - 0.5) * 0.03;
        items.push({
          position: [x + jitter, y, z],
          rotation: [0, (rand() - 0.5) * 0.04, 0],
          scale: [unitW * 0.92, unitH * 0.92, unitL * 0.92],
          color,
        });
      }
    }
  }
  return items;
}

function ContainerStacks({
  rows,
  cols,
  deckY,
  beam,
  zStart,
  zEnd,
  maxLayers,
}: {
  rows: number;
  cols: number;
  deckY: number;
  beam: number;
  zStart: number;
  zEnd: number;
  maxLayers: number;
}) {
  const items = useMemo(
    () => buildContainerLayout(rows, cols, deckY, beam, zStart, zEnd, maxLayers),
    [rows, cols, deckY, beam, zStart, zEnd, maxLayers]
  );

  return (
    <Instances limit={items.length} range={items.length}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.75} metalness={0.12} />
      {items.map((item, i) => (
        <Instance key={i} position={item.position} rotation={item.rotation} scale={item.scale} color={item.color} />
      ))}
    </Instances>
  );
}

/* ------------------------------------------------------------------ */
/* Ship hull: rectangular midbody + tapered bow + bridge + cranes      */
/* ------------------------------------------------------------------ */

function ShipHull({ isMobile }: { isMobile: boolean }) {
  const bowGeo = useMemo(() => createBowWedgeGeometry(BOW_TAPER, SHIP_BEAM, HULL_HEIGHT), []);

  const rows = isMobile ? 3 : 4;
  const cols = isMobile ? 5 : 7;
  const maxLayers = isMobile ? 2 : 3;

  const rectLength = SHIP_LENGTH - BOW_TAPER;
  const rectZStart = -SHIP_LENGTH / 2;
  const rectZEnd = rectZStart + rectLength;
  const bridgeDepth = 2.6;
  const containerZStart = rectZStart + bridgeDepth + 0.3;
  const containerZEnd = rectZEnd - 0.4;

  const craneZPositions = [
    containerZStart - 0.5,
    containerZStart + (containerZEnd - containerZStart) * 0.55,
  ];

  return (
    <group>
      {/* Main rectangular hull */}
      <mesh position={[0, HULL_HEIGHT / 2, rectZStart + rectLength / 2]} castShadow receiveShadow>
        <boxGeometry args={[SHIP_BEAM, HULL_HEIGHT, rectLength]} />
        <meshStandardMaterial color="#0d2530" roughness={0.55} metalness={0.35} />
      </mesh>

      {/* Boot-stripe band along the waterline */}
      <mesh position={[0, 0.12, rectZStart + rectLength / 2]} castShadow>
        <boxGeometry args={[SHIP_BEAM + 0.02, 0.22, rectLength]} />
        <meshStandardMaterial color="#7a2e2e" roughness={0.7} metalness={0.15} />
      </mesh>

      {/* Bow wedge — DoubleSide guards against any winding-order surprises */}
      <mesh geometry={bowGeo} position={[0, 0, rectZEnd]} castShadow>
        <meshStandardMaterial color="#0d2530" roughness={0.55} metalness={0.35} side={THREE.DoubleSide} />
      </mesh>

      {/* Deck plate */}
      <mesh position={[0, HULL_HEIGHT + 0.03, rectZStart + rectLength / 2]} receiveShadow>
        <boxGeometry args={[SHIP_BEAM - 0.06, 0.06, rectLength - 0.1]} />
        <meshStandardMaterial color="#1c1f22" roughness={0.85} metalness={0.1} />
      </mesh>

      {/* Bridge / superstructure near the stern */}
      <group position={[0, HULL_HEIGHT, rectZStart + bridgeDepth / 2]}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[SHIP_BEAM * 0.7, 1.1, bridgeDepth * 0.9]} />
          <meshStandardMaterial color="#e6e6e6" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[0, 1.35, -bridgeDepth * 0.1]} castShadow>
          <boxGeometry args={[SHIP_BEAM * 0.5, 0.7, bridgeDepth * 0.55]} />
          <meshStandardMaterial color="#d8d8d8" roughness={0.6} metalness={0.1} />
        </mesh>
        <mesh position={[0, 1.9, -bridgeDepth * 0.2]} castShadow>
          <boxGeometry args={[SHIP_BEAM * 0.34, 0.4, bridgeDepth * 0.3]} />
          <meshStandardMaterial
            color={COLOR_ACCENT_PRIMARY}
            roughness={0.4}
            metalness={0.2}
            emissive={COLOR_ACCENT_PRIMARY}
            emissiveIntensity={0.15}
          />
        </mesh>
        <mesh position={[0, 2.6, -bridgeDepth * 0.2]}>
          <cylinderGeometry args={[0.03, 0.03, 1.4, 8]} />
          <meshStandardMaterial color="#0a0f0f" roughness={0.5} metalness={0.6} />
        </mesh>
        <mesh position={[0, 3.32, -bridgeDepth * 0.2]}>
          <boxGeometry args={[0.16, 0.06, 0.16]} />
          <meshStandardMaterial
            color={COLOR_ACCENT_BLUE}
            emissive={COLOR_ACCENT_BLUE}
            emissiveIntensity={0.6}
            roughness={0.4}
          />
        </mesh>
      </group>

      {/* Two simple deck cranes between the bridge and the container blocks */}
      {craneZPositions.map((z, i) => (
        <group key={i} position={[0, HULL_HEIGHT, z]}>
          <mesh position={[-SHIP_BEAM * 0.32, 1.1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2.2, 8]} />
            <meshStandardMaterial color="#1c2a2a" roughness={0.6} metalness={0.4} />
          </mesh>
          <mesh position={[SHIP_BEAM * 0.32, 1.1, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 2.2, 8]} />
            <meshStandardMaterial color="#1c2a2a" roughness={0.6} metalness={0.4} />
          </mesh>
          <mesh position={[0, 2.15, 0]}>
            <boxGeometry args={[SHIP_BEAM * 0.74, 0.07, 0.12]} />
            <meshStandardMaterial color="#1c2a2a" roughness={0.6} metalness={0.4} />
          </mesh>
        </group>
      ))}

      <ContainerStacks
        rows={rows}
        cols={cols}
        deckY={HULL_HEIGHT + 0.06}
        beam={SHIP_BEAM - 0.3}
        zStart={containerZStart}
        zEnd={containerZEnd}
        maxLayers={maxLayers}
      />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Scene: wide establishing shot that slowly, gently approaches        */
/* ------------------------------------------------------------------ */

function HeroScene({
  progress,
  pointer,
  reducedMotion,
  isMobile,
}: {
  progress: number;
  pointer: { x: number; y: number };
  reducedMotion: boolean;
  isMobile: boolean;
}) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const rig = useRef<THREE.Group>(null);
  const angleRef = useRef(0.4);

  useFrame((_, delta) => {
    if (!camera.current) return;

    if (!reducedMotion) {
      // Extremely slow orbit — a full pass takes several minutes, so it
      // reads as "cinematic drift" rather than a spin.
      angleRef.current += delta * 0.015;
    }
    const pointerInfluence = reducedMotion ? 0 : pointer.x * 0.12;
    const angle = angleRef.current + pointerInfluence;
    const clampedProgress = Math.min(1, Math.max(0, progress));

    // 0 -> wide ocean establishing shot, 1 -> cinematic medium shot.
    // Radius never drops low enough to pass through the hull.
    const targetRadius = THREE.MathUtils.lerp(26, 13, clampedProgress);
    const targetHeight =
      THREE.MathUtils.lerp(5.4, 3.2, clampedProgress) + (reducedMotion ? 0 : pointer.y * -0.25);

    const targetX = Math.sin(angle) * targetRadius;
    const targetZ = Math.cos(angle) * targetRadius;

    camera.current.position.x = THREE.MathUtils.lerp(camera.current.position.x, targetX, 0.06);
    camera.current.position.y = THREE.MathUtils.lerp(camera.current.position.y, targetHeight, 0.06);
    camera.current.position.z = THREE.MathUtils.lerp(camera.current.position.z, targetZ, 0.06);

    // Look-at stays centered on the ship — it's the background now, sitting
    // behind the centered headline rather than framed off to one side.
    camera.current.lookAt(0, 0.6, 0);

    if (rig.current && !reducedMotion) {
      rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, pointer.x * 0.02, 0.04);
    }
  });

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={38} position={[10.1, 5.4, 23.9]} />
      <fog attach="fog" args={["#0a1418", 14, 42]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[8, 10, 4]} intensity={1.5} color="#fff3e0" castShadow />
      <pointLight position={[-6, 3, -4]} intensity={0.55} color={COLOR_ACCENT_PRIMARY} />
      <pointLight position={[5, -1, 6]} intensity={0.35} color={COLOR_ACCENT_BLUE} />

      <group ref={rig}>
        <Float
          speed={reducedMotion ? 0 : 0.6}
          rotationIntensity={reducedMotion ? 0 : 0.02}
          floatIntensity={reducedMotion ? 0 : 0.08}
        >
          <ShipHull isMobile={isMobile} />
        </Float>
        <ShipWake reducedMotion={reducedMotion} />
      </group>

      <Ocean segments={isMobile ? 28 : 64} reducedMotion={reducedMotion} />

      <ContactShadows position={[0, -0.05, 0]} opacity={0.22} scale={20} blur={3} far={6} color="#000000" />
      <Environment preset="dawn" environmentIntensity={0.3} />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Floating HUD cards (unchanged component, new shipping-data content) */
/* ------------------------------------------------------------------ */

function HudCard({
  className,
  style,
  children,
}: {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`absolute rounded-xl px-4 py-3 backdrop-blur-xl ${className ?? ""}`}
      style={{
        background: "rgba(10,20,20,0.55)",
        border: "1px solid var(--border-primary)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.35)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Subtle global route lines (SVG, low opacity, corner placement)      */
/* ------------------------------------------------------------------ */

function GlobalRouteOverlay() {
  const points = [
    { x: 14, y: 18, label: "Shanghai" },
    { x: 62, y: 52, label: "Dubai" },
    { x: 132, y: 92, label: "Rotterdam" },
  ];

  return (
    <svg
      className="pointer-events-none absolute bottom-8 left-6 z-10 hidden sm:block"
      width="150"
      height="110"
      viewBox="0 0 150 110"
      fill="none"
    >
      <defs>
        <linearGradient id="heroRouteGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={COLOR_ACCENT_PRIMARY} stopOpacity="0.5" />
          <stop offset="100%" stopColor={COLOR_ACCENT_BLUE} stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <path
        d="M14 18 Q45 30 62 52 Q95 78 132 92"
        stroke="url(#heroRouteGradient)"
        strokeWidth="1.4"
        strokeDasharray="3 5"
        fill="none"
      />
      {points.map((p) => (
        <g key={p.label}>
          <circle cx={p.x} cy={p.y} r="2.4" fill={COLOR_ACCENT_PRIMARY} fillOpacity={0.8} />
          <text x={p.x + 5} y={p.y + 3} fontSize="7" fill="#8b949e" fontFamily="sans-serif" letterSpacing="0.5">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Exported component                                                  */
/* ------------------------------------------------------------------ */

export function Hero3D() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { progress, reducedMotion } = useScrollProgress(sectionRef);
  const pointer = usePointerParallax(reducedMotion);
  const isMobile = useIsMobile();
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[92vh] md:min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-8"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="absolute inset-0 w-full h-full overflow-hidden">
        {/* 3D canvas with performance optimization */}
        <div className="absolute inset-0">
          <Canvas
            frameloop={inView ? "always" : "never"}
            dpr={1}
            gl={{ powerPreference: "high-performance", antialias: false, alpha: true }}
          >
            <Suspense fallback={null}>
              <HeroScene progress={progress} pointer={pointer} reducedMotion={reducedMotion} isMobile={isMobile} />
            </Suspense>
          </Canvas>
        </div>

        {/* vignette / atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at 50% 42%, transparent 25%, rgba(10,15,15,0.78) 100%)",
          }}
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 45% at 50% 46%, rgba(5,10,10,0.55) 0%, rgba(5,10,10,0.2) 55%, transparent 80%)",
          }}
        />
      </div>

      {/* Content: centered overlay */}
      <div className="relative z-10 flex flex-col items-center justify-center px-4 sm:px-6 py-12 text-center w-full">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-8"
              style={{
                background: "rgba(0,229,192,0.08)",
                border: "1px solid var(--border-accent)",
                color: "var(--accent-secondary)",
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse inline-block"
                style={{ background: "var(--accent-primary)" }}
              />
              GLOBAL FREIGHT INTELLIGENCE
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]"
              style={{ color: "var(--text-primary)" }}
            >
              Move the{" "}
              <motion.span
                style={{
                  background: "var(--gradient-accent)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                world.
              </motion.span>
              <br />
              Track every{" "}
              <motion.span
                style={{
                  background: "var(--gradient-accent)",
                  backgroundSize: "200% 100%",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
                animate={{ backgroundPosition: ["100% 50%", "0% 50%", "100% 50%"] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.3 }}
              >
                shipment.
              </motion.span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg md:text-xl mb-10 leading-relaxed"
              style={{ color: "var(--text-secondary)" }}
            >
              One intelligent platform for managing, tracking, and optimizing
              freight anywhere in the world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                href={ROUTES.REGISTER}
                className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-105"
                style={{ background: "var(--gradient-brand)", color: "#0a0f0f" }}
              >
                Start Shipping →
              </Link>
              <a
                href="#global-network"
                className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
                style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}
              >
                Explore Global Network
              </a>
            </motion.div>

            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: 1, delay: 0.8 }}
              className="mt-14 inline-block text-[11px] tracking-[0.3em] uppercase"
              style={{ color: "var(--text-muted)" }}
            >
              Scroll — Vessel approaching
            </motion.span>
          </div>
        </div>

        {/* Floating logistics HUD cards, flanking the centered text so
            they frame the scene without overlapping the headline. */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ opacity: Math.min(1, progress * 2.2) }}
        >
          <HudCard className="hidden md:block" style={{ top: "18%", left: "6%" }}>
            <p className="text-[10px] tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
              LIVE VESSEL · FA-20491
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              Shanghai → Rotterdam
            </p>
            <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: "var(--accent-secondary)" }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--accent-primary)" }} />
              IN TRANSIT · ETA 14h 32m
            </p>
          </HudCard>

          <HudCard className="hidden md:block" style={{ bottom: "22%", right: "7%" }}>
            <p className="text-[10px] tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
              VESSEL · FA-4829137
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              STATUS
            </p>
            <p className="text-xs mt-1 flex items-center gap-1.5" style={{ color: "var(--accent-secondary)" }}>
              <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: "var(--accent-primary)" }} />
              ON ROUTE
            </p>
          </HudCard>

          <HudCard className="hidden lg:block" style={{ top: "58%", left: "10%" }}>
            <p className="text-[10px] tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
              CARGO LOAD
            </p>
            <p className="text-lg font-bold" style={{ color: "var(--accent-secondary)" }}>
              1,248 TEU
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              87% CAPACITY
            </p>
          </HudCard>
        </div>

        <GlobalRouteOverlay />
    </section>
  );
}

export default Hero3D;