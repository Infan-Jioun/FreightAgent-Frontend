"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

interface LocationNodeProps {
    position: [number, number, number];
    label: string;
    sublabel: string;
    active?: boolean;
    reducedMotion: boolean;
}

export default function LocationNode({ position, label, sublabel, active, reducedMotion }: LocationNodeProps) {
    const ring = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!active || reducedMotion || !ring.current) return;
        const t = state.clock.getElapsedTime();
        const pulse = (t % 2) / 2; // 0 -> 1 loop
        const scale = 1 + pulse * 2.2;
        ring.current.scale.setScalar(scale);
        const mat = ring.current.material as THREE.MeshBasicMaterial;
        mat.opacity = Math.max(0, 0.6 - pulse * 0.6);
    });

    const color = active ? "#00C9A7" : "#e5e7eb";

    return (
        <group position={position}>
            <mesh>
                <sphereGeometry args={[0.06, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={active ? 1.4 : 0.2}
                    roughness={0.4}
                />
            </mesh>

            {active && (
                <mesh ref={ring} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.08, 0.1, 32]} />
                    <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
                </mesh>
            )}

            <Html distanceFactor={8} position={[0, 0.22, 0]} center occlude={false}>
                <div className="pointer-events-none select-none text-center">
                    <div
                        className="text-[10px] font-semibold tracking-wide whitespace-nowrap"
                        style={{ color: active ? "#00C9A7" : "#e5e7eb" }}
                    >
                        {label}
                    </div>
                    <div className="text-[8px] uppercase tracking-widest text-gray-500 whitespace-nowrap">
                        {sublabel}
                    </div>
                </div>
            </Html>
        </group>
    );
}
