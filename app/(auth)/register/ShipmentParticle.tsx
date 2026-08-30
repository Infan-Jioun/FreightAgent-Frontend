"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

interface ShipmentParticleProps {
    curve: THREE.CatmullRomCurve3;
    reducedMotion: boolean;
    /** Loop duration in seconds for one full traversal of the curve. */
    duration?: number;
    boosted?: boolean;
}

export default function ShipmentParticle({ curve, reducedMotion, duration = 6, boosted }: ShipmentParticleProps) {
    const mesh = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (!mesh.current) return;
        if (reducedMotion) {
            const point = curve.getPointAt(0.5);
            mesh.current.position.copy(point);
            return;
        }
        const t = (state.clock.getElapsedTime() % duration) / duration;
        const point = curve.getPointAt(t);
        mesh.current.position.copy(point);
    });

    return (
        <mesh ref={mesh}>
            <sphereGeometry args={[0.05, 12, 12]} />
            <meshStandardMaterial
                color="#00C9A7"
                emissive="#00C9A7"
                emissiveIntensity={boosted ? 3 : 1.6}
                roughness={0.3}
            />
        </mesh>
    );
}
