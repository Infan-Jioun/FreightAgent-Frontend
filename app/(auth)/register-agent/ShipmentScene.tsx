/* eslint-disable react-hooks/immutability */
"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import ShippingContainer from "./ShippingContainer";
import ContainerEnvironment from "./ContainerEnvironment";
import AgentCustomerDiscussion from "./AgentCustomerDiscussion";

const ORBIT_DURATION = 12; // seconds for one full slow loop: front-right -> side -> front-left -> back

function CameraRig({
    pointer,
    reducedMotion,
}: {
    pointer: React.MutableRefObject<{ x: number; y: number }>;
    reducedMotion: boolean;
}) {
    const { camera } = useThree();

    useFrame((state, delta) => {
        if (reducedMotion) {
            camera.position.set(2.6, 0.9, 6.4);
            camera.lookAt(0, -0.1, 0);
            return;
        }

        const t = state.clock.getElapsedTime();
        const angle = (t / ORBIT_DURATION) * Math.PI * 2;

        const radius = 6.6;
        const swing = 0.55;
        const orbitX = Math.sin(angle) * swing;

        const targetX = radius * Math.sin(orbitX) + pointer.current.x * 0.3;
        const targetZ = radius * Math.cos(orbitX);
        const targetY = 0.9 + Math.sin(angle * 0.5) * 0.15 + pointer.current.y * -0.15;

        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 1.1);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 1.1);
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetZ, delta * 1.1);
        camera.lookAt(0, -0.1, 0);
    });

    return null;
}

interface ShipmentSceneProps {
    reducedMotion: boolean;
    success?: boolean;
}

export default function ShipmentScene({ reducedMotion, success }: ShipmentSceneProps) {
    const pointer = useRef({ x: 0, y: 0 });
    const [dpr, setDpr] = useState<[number, number]>([1, 1.5]);

    useEffect(() => {
        const handlePointerMove = (e: PointerEvent) => {
            const w = window.innerWidth;
            const h = window.innerHeight;
            pointer.current = {
                x: (e.clientX / w) * 2 - 1,
                y: (e.clientY / h) * 2 - 1,
            };
        };
        if (!reducedMotion) {
            window.addEventListener("pointermove", handlePointerMove);
        }
        return () => window.removeEventListener("pointermove", handlePointerMove);
    }, [reducedMotion]);

    return (
        <Canvas
            dpr={dpr}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            camera={{ position: [2.6, 0.9, 6.4], fov: 38 }}
            onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0);
                setDpr([1, Math.min(window.devicePixelRatio, 1.75)]);
            }}
        >
            <fog attach="fog" args={["#050a0a", 10, 22]} />

            <ambientLight intensity={0.32} />
            <directionalLight position={[4, 5, 3]} intensity={1.3} color="#e8fff9" castShadow shadow-mapSize={[1024, 1024]} />
            <pointLight position={[-4, -1.5, 2]} intensity={success ? 0.9 : 0.55} color="#00C9A7" />
            <pointLight position={[3, 2, -3]} intensity={0.35} color="#3B82F6" />

            <group position={[0, -0.25, 0]}>
                <ShippingContainer />
                <AgentCustomerDiscussion reducedMotion={reducedMotion} />
                <ContactShadows position={[0, -1.4, 0]} opacity={0.5} scale={12} blur={2.4} far={3} color="#000000" />
            </group>

            <ContainerEnvironment />

            <CameraRig pointer={pointer} reducedMotion={reducedMotion} />

            <Environment preset="city" environmentIntensity={0.32} />
        </Canvas>
    );
}
