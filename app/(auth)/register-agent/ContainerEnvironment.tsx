"use client";

import { useMemo } from "react";

const FAR_CONTAINER_COLORS = ["#0a3d37", "#123a44", "#1a2a44", "#0a3d37", "#123a44", "#1a2a44"];

/**
 * Quiet cinematic backdrop for the container terminal: a dark ground plane,
 * a handful of low-poly containers stacked in the distance, and two simple
 * crane silhouettes. Everything here is intentionally under-detailed and
 * fog-dimmed so it reads as atmosphere, not competition for the hero.
 */
export default function ContainerEnvironment() {
    const distantStacks = useMemo(() => {
        const stacks: Array<{ pos: [number, number, number]; color: string }> = [];
        const positions: Array<[number, number, number]> = [
            [-7.2, -0.9, -7],
            [-6.0, -0.55, -7.4],
            [-5.0, -0.9, -8],
            [6.6, -0.9, -7.6],
            [7.8, -0.55, -8],
            [5.6, -0.9, -8.6],
        ];
        positions.forEach((pos, i) => stacks.push({ pos, color: FAR_CONTAINER_COLORS[i % FAR_CONTAINER_COLORS.length] }));
        return stacks;
    }, []);

    return (
        <group>
            {/* Ground */}
            <mesh position={[0, -1.42, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[60, 60]} />
                <meshStandardMaterial color="#050a0a" roughness={0.95} metalness={0.05} />
            </mesh>

            {/* Distant stacked containers */}
            {distantStacks.map((s, i) => (
                <mesh key={i} position={s.pos} castShadow>
                    <boxGeometry args={[1.3, 1.15, 1.3]} />
                    <meshStandardMaterial color={s.color} metalness={0.35} roughness={0.85} />
                </mesh>
            ))}

            {/* Two simple crane silhouettes, kept minimal and dark */}
            {[-9, 9].map((x, i) => (
                <group key={i} position={[x, -1.42, -9.5]}>
                    <mesh position={[0, 3, 0]} castShadow>
                        <boxGeometry args={[0.18, 6, 0.18]} />
                        <meshStandardMaterial color="#0a1414" roughness={0.9} />
                    </mesh>
                    <mesh position={[i === 0 ? 2.2 : -2.2, 5.6, 0]} castShadow>
                        <boxGeometry args={[4.4, 0.12, 0.12]} />
                        <meshStandardMaterial color="#0a1414" roughness={0.9} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}
