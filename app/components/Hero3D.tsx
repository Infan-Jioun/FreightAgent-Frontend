"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, Float, PerspectiveCamera } from "@react-three/drei";
import { motion } from "framer-motion";
import Link from "next/link";
import * as THREE from "three";
import { ContainerModel } from "./ContainerModel";
import { useScrollProgress, usePointerParallax } from "./useScrollProgress";
import { ROUTES } from "@/app/constants/routes";

/* ---------------------------------------------------------------- */
/* Scene: container travels from deep background toward the camera  */
/* ---------------------------------------------------------------- */

function HeroScene({
  progress,
  pointer,
  reducedMotion,
}: {
  progress: number;
  pointer: { x: number; y: number };
  reducedMotion: boolean;
}) {
  const camera = useRef<THREE.PerspectiveCamera>(null);
  const rig = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!camera.current) return;
    // Camera starts far back (z=9), pushes forward toward the container
    // as the user scrolls, creating the "breaking through the screen" feel.
    const targetZ = 9 - progress * 6.2;
    camera.current.position.z = THREE.MathUtils.lerp(
      camera.current.position.z,
      targetZ,
      0.08
    );
    const targetY = 0.4 - progress * 0.25;
    camera.current.position.y = THREE.MathUtils.lerp(
      camera.current.position.y,
      targetY,
      0.08
    );

    if (rig.current && !reducedMotion) {
      rig.current.rotation.y = THREE.MathUtils.lerp(
        rig.current.rotation.y,
        pointer.x * 0.12,
        0.06
      );
      rig.current.rotation.x = THREE.MathUtils.lerp(
        rig.current.rotation.x,
        -pointer.y * 0.06,
        0.06
      );
    }
  });

  const containerZ = -1.5 + progress * 3.4; // moves toward camera
  const containerScale = 1 + progress * 0.35;

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault fov={42} position={[0, 0.4, 9]} />
      <fog attach="fog" args={["#0a0f0f", 6, 20]} />
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[4, 6, 3]}
        intensity={1.4}
        color="#e0faf5"
        castShadow
      />
      <pointLight position={[-4, 2, -2]} intensity={1.1} color="#00c9a7" />
      <pointLight position={[3, -1, 4]} intensity={0.6} color="#00b4d8" />

      <group ref={rig}>
        <Float
          speed={reducedMotion ? 0 : 1.1}
          rotationIntensity={reducedMotion ? 0 : 0.12}
          floatIntensity={reducedMotion ? 0 : 0.25}
        >
          <ContainerModel
            position={[0.4, -0.15, containerZ]}
            rotation={[0, 0.55 - progress * 0.55, 0]}
            scale={containerScale}
            drift={!reducedMotion}
          />
        </Float>

        {/* distant silhouettes of crane / terminal structures for depth */}
        {[-6, -8.5, -11].map((z, i) => (
          <mesh key={z} position={[-3 - i * 1.4, -0.8, z]}>
            <boxGeometry args={[0.3, 2.6 + i, 0.3]} />
            <meshStandardMaterial color="#06110f" roughness={1} />
          </mesh>
        ))}
        {[-7, -9.5].map((z, i) => (
          <mesh key={z} position={[4 + i * 1.2, 0.2, z]}>
            <boxGeometry args={[3.2, 0.15, 0.15]} />
            <meshStandardMaterial color="#06110f" roughness={1} />
          </mesh>
        ))}
      </group>

      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.55}
        scale={14}
        blur={2.4}
        far={4}
        color="#000000"
      />
      <Environment preset="city" />
    </>
  );
}

/* ---------------------------------------------------------------- */
/* Floating HUD cards                                                */
/* ---------------------------------------------------------------- */

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

/* ---------------------------------------------------------------- */
/* Exported component                                                */
/* ---------------------------------------------------------------- */

export function Hero3D() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { progress, reducedMotion } = useScrollProgress(sectionRef);
  const pointer = usePointerParallax(reducedMotion);

  return (
    <section
      ref={sectionRef}
      className="relative h-[180vh]"
      style={{ background: "var(--bg-primary)" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* 3D canvas */}
        <div className="absolute inset-0">
          <Canvas shadows dpr={[1, 1.75]} gl={{ antialias: true }}>
            <Suspense fallback={null}>
              <HeroScene progress={progress} pointer={pointer} reducedMotion={reducedMotion} />
            </Suspense>
          </Canvas>
        </div>

        {/* vignette / atmosphere */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse at center, transparent 35%, rgba(10,15,15,0.85) 100%)",
          }}
        />

        {/* content, fades as container approaches (progress rises) */}
        <div
          className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center transition-opacity duration-300"
          style={{ opacity: Math.max(0, 1 - progress * 1.6) }}
        >
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
            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-4xl leading-[1.05]"
            style={{ color: "var(--text-primary)" }}
          >
            Move the{" "}
            <span
              style={{
                background: "var(--gradient-accent)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              world.
            </span>
            <br />
            Track every{" "}
            <span
              style={{
                background: "var(--gradient-accent)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              shipment.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            One intelligent platform for managing, tracking, and optimizing
            freight anywhere in the world.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4"
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
            className="mt-14 text-[11px] tracking-[0.3em] uppercase"
            style={{ color: "var(--text-muted)" }}
          >
            Scroll — Container inbound
          </motion.span>
        </div>

        {/* Floating logistics HUD cards, fade/scale in as container nears */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{ opacity: Math.min(1, progress * 2.2) }}
        >
          <HudCard className="hidden md:block" style={{ top: "18%", left: "6%" }}>
            <p className="text-[10px] tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
              LIVE SHIPMENT · FA-20491
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
              CONTAINER · MSCU 4829137
            </p>
            <p className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
              40FT HC
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--accent-secondary)" }}>
              ● SECURE
            </p>
          </HudCard>

          <HudCard className="hidden lg:block" style={{ top: "58%", left: "10%" }}>
            <p className="text-[10px] tracking-widest mb-1" style={{ color: "var(--text-muted)" }}>
              GLOBAL STATUS
            </p>
            <p className="text-lg font-bold" style={{ color: "var(--accent-secondary)" }}>
              24,891
            </p>
            <p className="text-[10px]" style={{ color: "var(--text-muted)" }}>
              ACTIVE SHIPMENTS
            </p>
          </HudCard>
        </div>
      </div>
    </section>
  );
}

export default Hero3D;
