"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import * as THREE from "three";

interface ShippingContainerProps {
    /** Normalized pointer position in [-1, 1], used for subtle parallax tilt */
    pointer: React.MutableRefObject<{ x: number; y: number }>;
    reducedMotion: boolean;
}

const CONTAINER_TEAL = "#0f5c52";
const CONTAINER_TEAL_DARK = "#0a3d37";
const RUST_ACCENT = "#3a2c22";

/**
 * A stylised-but-plausible ISO shipping container.
 * Built from layered box geometry (shell + corrugation ribs + door panel +
 * locking bars) rather than a single flat box, so it reads as an industrial
 * object under raking light instead of a generic 3D primitive.
 */
export default function ShippingContainer({ pointer, reducedMotion }: ShippingContainerProps) {
    const group = useRef<THREE.Group>(null);
    const doorGroup = useRef<THREE.Group>(null);

    // Corrugation ribs along the container's long side — repeated thin boxes
    // give the corrugated-steel look without a texture map.
    const ribs = useMemo(() => {
        const count = 22;
        const ribs: number[] = [];
        for (let i = 0; i < count; i++) {
            ribs.push(-2.55 + (i * 5.1) / (count - 1));
        }
        return ribs;
    }, []);

    useFrame((state, delta) => {
        if (!group.current) return;

        const t = state.clock.getElapsedTime();

        if (!reducedMotion) {
            // Slow ambient bob + yaw — deliberately subtle, not a spin.
            group.current.position.y = Math.sin(t * 0.45) * 0.06;
            group.current.rotation.y = Math.sin(t * 0.18) * 0.18 - 0.5;

            // Gentle response to cursor position, eased toward target.
            const targetTiltX = pointer.current.y * 0.08;
            const targetTiltY = -0.5 + pointer.current.x * 0.15;
            group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, targetTiltX, delta * 1.5);
            group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, targetTiltY, delta * 1.5);
        } else {
            group.current.rotation.y = -0.5;
            group.current.rotation.x = 0;
            group.current.position.y = 0;
        }
    });

    return (
        <group ref={group} position={[0, 0, 0]}>
            {/* Main shell */}
            <RoundedBox args={[5.2, 2.1, 2.1]} radius={0.04} smoothness={4} castShadow receiveShadow>
                <meshStandardMaterial
                    color={CONTAINER_TEAL}
                    metalness={0.65}
                    roughness={0.55}
                    envMapIntensity={0.9}
                />
            </RoundedBox>

            {/* Corrugation ribs on the long visible face */}
            {ribs.map((x, i) => (
                <mesh key={i} position={[x, 0, 1.065]} castShadow>
                    <boxGeometry args={[0.06, 1.95, 0.045]} />
                    <meshStandardMaterial
                        color={i % 2 === 0 ? CONTAINER_TEAL_DARK : CONTAINER_TEAL}
                        metalness={0.6}
                        roughness={0.65}
                    />
                </mesh>
            ))}

            {/* Weathering / scuff patches — a few darker, rougher patches for realism */}
            <mesh position={[-1.6, -0.55, 1.09]} rotation={[0, 0, 0.15]}>
                <planeGeometry args={[0.9, 0.35]} />
                <meshStandardMaterial color={RUST_ACCENT} roughness={0.9} metalness={0.1} transparent opacity={0.35} />
            </mesh>
            <mesh position={[0.9, 0.7, 1.09]} rotation={[0, 0, -0.08]}>
                <planeGeometry args={[0.5, 0.2]} />
                <meshStandardMaterial color={RUST_ACCENT} roughness={0.9} metalness={0.1} transparent opacity={0.25} />
            </mesh>

            {/* Bottom rail / chassis */}
            <mesh position={[0, -1.12, 0]} castShadow>
                <boxGeometry args={[5.3, 0.16, 2.2]} />
                <meshStandardMaterial color="#1a1a1a" metalness={0.4} roughness={0.7} />
            </mesh>

            {/* Corner castings (the 8 ISO corner blocks) */}
            {[
                [-2.58, 1.02, 1.02],
                [-2.58, 1.02, -1.02],
                [-2.58, -1.1, 1.02],
                [-2.58, -1.1, -1.02],
                [2.58, 1.02, 1.02],
                [2.58, 1.02, -1.02],
                [2.58, -1.1, 1.02],
                [2.58, -1.1, -1.02],
            ].map((pos, i) => (
                <mesh key={i} position={pos as [number, number, number]} castShadow>
                    <boxGeometry args={[0.14, 0.14, 0.14]} />
                    <meshStandardMaterial color="#0d0d0d" metalness={0.5} roughness={0.4} />
                </mesh>
            ))}

            {/* Door end — right side, with panel seam + locking bars */}
            <group ref={doorGroup} position={[2.61, 0, 0]}>
                <mesh castShadow>
                    <boxGeometry args={[0.05, 2.0, 2.0]} />
                    <meshStandardMaterial color={CONTAINER_TEAL_DARK} metalness={0.7} roughness={0.45} />
                </mesh>
                {/* Door seam line */}
                <mesh position={[0.03, 0, 0]}>
                    <boxGeometry args={[0.01, 2.0, 0.02]} />
                    <meshStandardMaterial color="#000000" roughness={0.9} />
                </mesh>
                {/* Locking bars (4 vertical rods, 2 per door leaf) */}
                {[-0.55, -0.18, 0.18, 0.55].map((y, i) => (
                    <mesh key={i} position={[0.05, y, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.02, 0.02, 1.85, 8]} />
                        <meshStandardMaterial color="#c8c8c8" metalness={0.9} roughness={0.25} />
                    </mesh>
                ))}
                {/* Handle cams */}
                <mesh position={[0.08, 0.85, 0]} castShadow>
                    <boxGeometry args={[0.08, 0.15, 0.05]} />
                    <meshStandardMaterial color="#c8c8c8" metalness={0.9} roughness={0.3} />
                </mesh>
                <mesh position={[0.08, -0.85, 0]} castShadow>
                    <boxGeometry args={[0.08, 0.15, 0.05]} />
                    <meshStandardMaterial color="#c8c8c8" metalness={0.9} roughness={0.3} />
                </mesh>
            </group>

            {/* Stenciled ID label */}
            <Text
                position={[-1.3, 0.35, 1.075]}
                fontSize={0.16}
                color="#d7f5ee"
                anchorX="left"
                anchorY="middle"
                letterSpacing={0.05}
                fillOpacity={0.85}
            >
                FAZU 482913
            </Text>
            <Text
                position={[-1.3, 0.08, 1.075]}
                fontSize={0.1}
                color="#8fd8c9"
                anchorX="left"
                anchorY="middle"
                letterSpacing={0.04}
                fillOpacity={0.7}
            >
                40FT HIGH CUBE · MAX 30480 KG
            </Text>
        </group>
    );
}
