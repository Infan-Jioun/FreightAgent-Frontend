"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { ContactShadows, Environment, PerspectiveCamera } from "@react-three/drei";
import Link from "next/link";
import * as THREE from "three";
import { ContainerModel } from "./ContainerModel";
import { useScrollProgress } from "./useScrollProgress";
import { ROUTES } from "@/app/constants/routes";

function Scene({ progress }: { progress: number }) {
  const group = useRef<THREE.Group>(null);

  useFrame(() => {
    if (!group.current) return;
    // container recedes into the distance as the section scrolls past
    const targetZ = -1 - progress * 6;
    group.current.position.z = THREE.MathUtils.lerp(group.current.position.z, targetZ, 0.06);
  });

  return (
    <>
      <PerspectiveCamera makeDefault fov={40} position={[0, 0.3, 6]} />
      <fog attach="fog" args={["#0a0f0f", 5, 16]} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 5, 3]} intensity={1.1} color="#e0faf5" />
      <pointLight position={[-3, 1, 2]} intensity={0.9} color="#00c9a7" />

      <group ref={group} position={[0.6, -0.2, -1]}>
        <ContainerModel rotation={[0, 0.7, 0]} scale={0.9} />
      </group>

      <ContactShadows position={[0, -1, 0]} opacity={0.4} scale={12} blur={2.5} far={4} />
      <Environment preset="night" />
    </>
  );
}

export function FinalCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { progress } = useScrollProgress(sectionRef);

  return (
    <section ref={sectionRef} className="relative h-[130vh]" style={{ background: "var(--bg-primary)" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0">
          <Canvas dpr={[1, 1.5]}>
            <Suspense fallback={null}>
              <Scene progress={progress} />
            </Suspense>
          </Canvas>
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 30%, rgba(10,15,15,0.9) 100%)" }}
        />

        <div className="relative z-10 text-center px-6 max-w-2xl">
          <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight" style={{ color: "var(--text-primary)" }}>
            Ready to move
            <br />
            what&apos;s next?
          </h2>
          <p className="text-base md:text-lg mb-10" style={{ color: "var(--text-secondary)" }}>
            Bring every shipment, route, and update into one global freight
            platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={ROUTES.REGISTER}
              className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-90 hover:scale-105"
              style={{ background: "var(--gradient-brand)", color: "#0a0f0f" }}
            >
              Start Shipping →
            </Link>
            <Link
              href={ROUTES.LOGIN}
              className="px-8 py-3.5 rounded-xl font-semibold text-sm transition-all hover:opacity-80"
              style={{ border: "1px solid var(--border-primary)", color: "var(--text-secondary)" }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
