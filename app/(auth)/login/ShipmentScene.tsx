/* eslint-disable react-hooks/immutability */
"use client";

import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, ContactShadows } from "@react-three/drei";
import * as THREE from "three";
import ShippingContainer from "./ShippingContainer";

function CameraRig({ pointer, reducedMotion }: { pointer: React.MutableRefObject<{ x: number; y: number }>; reducedMotion: boolean }) {
    const { camera } = useThree();

    useFrame((_, delta) => {
        if (reducedMotion) {
            camera.position.set(0, 0.4, 7.2);
            camera.lookAt(0, 0, 0);
            return;
        }
        const targetX = pointer.current.x * 0.4;
        const targetY = 0.4 + pointer.current.y * -0.25;
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetX, delta * 1.2);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetY, delta * 1.2);
        camera.position.z = 7.2;
        camera.lookAt(0, 0, 0);
    });

    return null;
}

function DistantContainers() {
    // A handful of low-detail boxes in the background to suggest a stacked
    // yard without competing with the hero container.
    const positions: Array<[number, number, number]> = [
        [-6.5, -0.9, -6],
        [-5.2, -0.55, -6.3],
        [6.2, -0.85, -7],
        [7.4, -0.5, -7.4],
        [-7.8, -0.6, -8.5],
    ];
    const colors = ["#0a3d37", "#123a44", "#0a3d37", "#1a2a44", "#123a44"];

    return (
        <>
            {positions.map((pos, i) => (
                <mesh key={i} position={pos}>
                    <boxGeometry args={[1.4, 1.2, 1.4]} />
                    <meshStandardMaterial color={colors[i]} metalness={0.4} roughness={0.8} />
                </mesh>
            ))}
        </>
    );
}

interface ShipmentSceneProps {
    reducedMotion: boolean;
}

export default function ShipmentScene({ reducedMotion }: ShipmentSceneProps) {
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
            camera={{ position: [0, 0.4, 7.2], fov: 32 }}
            onCreated={({ gl }) => {
                gl.setClearColor(0x000000, 0);
                // Clamp DPR down further on low-end/high-pixel-ratio devices.
                setDpr([1, Math.min(window.devicePixelRatio, 1.75)]);
            }}
        >
            <fog attach="fog" args={["#050a0a", 9, 20]} />

            <ambientLight intensity={0.35} />
            <directionalLight
                position={[4, 5, 3]}
                intensity={1.4}
                color="#e8fff9"
                castShadow
                shadow-mapSize={[1024, 1024]}
            />
            <pointLight position={[-4, -2, 2]} intensity={0.6} color="#00C9A7" />
            <pointLight position={[3, 2, -3]} intensity={0.4} color="#3B82F6" />

            <group position={[0, -0.3, 0]}>
                <ShippingContainer pointer={pointer} reducedMotion={reducedMotion} />
                <DistantContainers />
                <ContactShadows position={[0, -1.35, 0]} opacity={0.55} scale={12} blur={2.4} far={3} color="#000000" />
            </group>

            <CameraRig pointer={pointer} reducedMotion={reducedMotion} />

            <Environment preset="city" environmentIntensity={0.35} />
        </Canvas>
    );
}
