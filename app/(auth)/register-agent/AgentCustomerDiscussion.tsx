"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

/* ================================================================== */
/*  JEDDAH PORT — LIVE DEAL FLOOR                                      */
/*  A working port yard: stacked containers, gantry cranes overhead,   */
/*  and an Agent + Customer closing an authentic freight deal in the   */
/*  foreground. Every element is spaced on its own layer/radius so     */
/*  nothing visually overlaps — cranes stay back-top, container stacks */
/*  stay back-ground, people + bubbles stay foreground-center.         */
/* ================================================================== */

interface Line {
    from: "agent" | "customer";
    text: string;
}

const CONVERSATION: Line[] = [
    { from: "customer", text: "We need 3 containers cleared for the Chattogram vessel." },
    { from: "agent", text: "Bay 4 is loading now — crane 2 is on it." },
    { from: "customer", text: "Documentation ready for customs?" },
    { from: "agent", text: "Manifest, B/L and SGS cert — all verified." },
    { from: "customer", text: "Confirm the sailing slot at Jeddah." },
    { from: "agent", text: "Slot confirmed. Departure 06:00, berth 7." },
    { from: "customer", text: "Send the final invoice, we'll sign off." },
    { from: "agent", text: "Invoice sent — deal closed." },
];

const LINE_DURATION = 3.2;
const TOTAL_DURATION = CONVERSATION.length * LINE_DURATION;

/* ------------------------------------------------------------------ */
/*  LAYER 1 (farthest back, elevated) — gantry cranes on rails.        */
/*  Kept high (y ~2.4–3.6) and far in Z (-4.2) so they never intersect */
/*  the container stacks or the people layers below.                   */
/* ------------------------------------------------------------------ */

function GantryCrane({ x, mirrored }: { x: number; mirrored?: boolean }) {
    const boomRef = useRef<THREE.Group>(null);
    const trolleyRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (boomRef.current) {
            boomRef.current.rotation.z = Math.sin(t * 0.12 + x) * 0.02;
        }
        if (trolleyRef.current) {
            const span = 1.1;
            trolleyRef.current.position.x = Math.sin(t * 0.22 + x) * span;
        }
    });

    const dir = mirrored ? -1 : 1;

    return (
        <group position={[x, 0, -4.2]}>
            {/* two legs */}
            <mesh position={[-0.5, 1.6, 0]} castShadow>
                <boxGeometry args={[0.1, 3.2, 0.1]} />
                <meshStandardMaterial color="#12201f" roughness={0.85} metalness={0.3} />
            </mesh>
            <mesh position={[0.5, 1.6, 0]} castShadow>
                <boxGeometry args={[0.1, 3.2, 0.1]} />
                <meshStandardMaterial color="#12201f" roughness={0.85} metalness={0.3} />
            </mesh>
            {/* horizontal boom */}
            <group ref={boomRef} position={[0, 3.2, 0]}>
                <mesh position={[dir * 1.3, 0, 0]} castShadow>
                    <boxGeometry args={[2.6, 0.09, 0.09]} />
                    <meshStandardMaterial color="#12201f" roughness={0.85} metalness={0.3} />
                </mesh>
                {/* trolley + hoist cable */}
                <mesh ref={trolleyRef} position={[dir * 1.3, -0.02, 0]}>
                    <boxGeometry args={[0.12, 0.06, 0.12]} />
                    <meshStandardMaterial color="#00C9A7" emissive="#00C9A7" emissiveIntensity={0.5} />
                </mesh>
            </group>
            {/* warning light */}
            <mesh position={[0, 3.32, 0]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={2} toneMapped={false} />
            </mesh>
        </group>
    );
}

/* ------------------------------------------------------------------ */
/*  LAYER 2 (mid-back, ground level) — stacked shipping containers,    */
/*  arranged in two flanking yards left/right so the center stays      */
/*  clear for the people + dialogue. Sits at Z -2.6, well separated    */
/*  from the cranes (Z -4.2) and the foreground scene (Z ~0.5–0.9).     */
/* ------------------------------------------------------------------ */

const STACK_COLORS = ["#0f3d38", "#1a3a52", "#3a2a12", "#0f3d38", "#1a3a52"];

function ContainerYard({ side }: { side: "left" | "right" }) {
    const stacks = useMemo(() => {
        const dir = side === "left" ? -1 : 1;
        const baseX = dir * 2.05;
        const list: { pos: [number, number, number]; color: string }[] = [];
        let idColor = 0;
        for (let col = 0; col < 3; col++) {
            const colHeight = col === 1 ? 3 : 2;
            for (let row = 0; row < colHeight; row++) {
                list.push({
                    pos: [baseX + dir * col * 0.34, 0.16 + row * 0.3, -2.6 - col * 0.22],
                    color: STACK_COLORS[idColor++ % STACK_COLORS.length],
                });
            }
        }
        return list;
    }, [side]);

    return (
        <group>
            {stacks.map((s, i) => (
                <mesh key={i} position={s.pos} castShadow receiveShadow>
                    <boxGeometry args={[0.3, 0.28, 0.62]} />
                    <meshStandardMaterial color={s.color} metalness={0.4} roughness={0.65} />
                </mesh>
            ))}
        </group>
    );
}

/* ------------------------------------------------------------------ */
/*  LAYER 3 (background label) — "Jeddah Port" ground signage, sits    */
/*  low and far so it never competes with foreground text.             */
/* ------------------------------------------------------------------ */

function PortSignage() {
    return (
        <Html position={[0, 1.9, -4.0]} center distanceFactor={9} occlude={false} style={{ pointerEvents: "none" }}>
            <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                <div
                    style={{
                        fontSize: "11px",
                        fontWeight: 800,
                        letterSpacing: "0.16em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.5)",
                        textShadow: "0 2px 8px rgba(0,0,0,0.9)",
                    }}
                >
                    Chittagong Port · Terminal 1
                </div>
                <div
                    style={{
                        fontSize: "7px",
                        fontWeight: 600,
                        letterSpacing: "0.1em",
                        color: "rgba(0,201,167,0.55)",
                        marginTop: "2px",
                    }}
                >
                    Live Cargo Operations
                </div>
            </div>
        </Html>
    );
}

/* ------------------------------------------------------------------ */
/*  LAYER 4 (foreground, ground) — the deal itself. Kept on its own    */
/*  dedicated radius (X ±0.7, Z 0.5) so it never touches the yard      */
/*  meshes (Z ≤ -2.6) or the cranes (Z -4.2). One clear focal plane.    */
/* ------------------------------------------------------------------ */

function HumanFigure({
    position,
    facing,
    color,
    skin = "#e8c39e",
    label,
    role,
    speaking,
}: {
    position: [number, number, number];
    facing: number;
    color: string;
    skin?: string;
    label: string;
    role: "agent" | "customer";
    speaking: boolean;
}) {
    const root = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Mesh>(null);
    const armL = useRef<THREE.Group>(null);
    const armR = useRef<THREE.Group>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (root.current) {
            root.current.position.y = position[1] + Math.sin(t * 1.3 + position[0]) * 0.012;
        }
        if (headRef.current) {
            const nod = speaking ? Math.sin(t * 5) * 0.05 : Math.sin(t * 0.8) * 0.02;
            headRef.current.rotation.x = nod;
            headRef.current.rotation.y = speaking ? Math.sin(t * 2.2) * 0.08 : 0;
        }
        const gestureArm = role === "customer" ? armR : armL;
        if (gestureArm.current) {
            const rest = -0.35;
            const raised = -0.9;
            const target = speaking ? raised + Math.sin(t * 4) * 0.12 : rest;
            gestureArm.current.rotation.x = THREE.MathUtils.lerp(gestureArm.current.rotation.x, target, 0.08);
        }
    });

    return (
        <group position={position} rotation={[0, facing, 0]}>
            <group ref={root}>
                <mesh position={[-0.045, 0.09, 0]} castShadow>
                    <capsuleGeometry args={[0.028, 0.18, 4, 8]} />
                    <meshStandardMaterial color="#1c2b2b" roughness={0.7} />
                </mesh>
                <mesh position={[0.045, 0.09, 0]} castShadow>
                    <capsuleGeometry args={[0.028, 0.18, 4, 8]} />
                    <meshStandardMaterial color="#1c2b2b" roughness={0.7} />
                </mesh>

                <mesh position={[0, 0.2, 0]} castShadow>
                    <boxGeometry args={[0.11, 0.06, 0.08]} />
                    <meshStandardMaterial color="#152525" roughness={0.7} />
                </mesh>

                <mesh position={[0, 0.34, 0]} castShadow>
                    <capsuleGeometry args={[0.075, 0.2, 4, 12]} />
                    <meshStandardMaterial color={color} roughness={0.45} metalness={0.15} />
                </mesh>

                <mesh position={[0, 0.36, 0.071]}>
                    <boxGeometry args={[0.018, 0.14, 0.006]} />
                    <meshStandardMaterial color={role === "agent" ? "#003d33" : "#0a1f3d"} roughness={0.4} />
                </mesh>

                <mesh position={[0, 0.47, 0]}>
                    <cylinderGeometry args={[0.028, 0.03, 0.05, 12]} />
                    <meshStandardMaterial color={skin} roughness={0.5} />
                </mesh>

                <mesh ref={headRef} position={[0, 0.55, 0]} castShadow>
                    <sphereGeometry args={[0.072, 20, 20]} />
                    <meshStandardMaterial color={skin} roughness={0.45} />
                </mesh>
                <mesh position={[0, 0.585, -0.006]}>
                    <sphereGeometry args={[0.074, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
                    <meshStandardMaterial color="#1a1410" roughness={0.6} />
                </mesh>

                {role === "agent" && (
                    <mesh position={[0, 0.6, 0]}>
                        <torusGeometry args={[0.078, 0.012, 8, 20]} />
                        <meshStandardMaterial color="#f5f5f5" roughness={0.6} />
                    </mesh>
                )}

                <group ref={armL} position={[-0.11, 0.4, 0]} rotation={[-0.35, 0, -0.12]}>
                    <mesh position={[0, -0.09, 0]} castShadow>
                        <capsuleGeometry args={[0.026, 0.16, 4, 8]} />
                        <meshStandardMaterial color={color} roughness={0.5} />
                    </mesh>
                    <mesh position={[0, -0.19, 0.01]}>
                        <sphereGeometry args={[0.024, 10, 10]} />
                        <meshStandardMaterial color={skin} roughness={0.5} />
                    </mesh>
                </group>

                <group ref={armR} position={[0.11, 0.4, 0]} rotation={[-0.35, 0, 0.12]}>
                    <mesh position={[0, -0.09, 0]} castShadow>
                        <capsuleGeometry args={[0.026, 0.16, 4, 8]} />
                        <meshStandardMaterial color={color} roughness={0.5} />
                    </mesh>
                    <mesh position={[0, -0.19, 0.01]}>
                        <sphereGeometry args={[0.024, 10, 10]} />
                        <meshStandardMaterial color={skin} roughness={0.5} />
                    </mesh>
                </group>

                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
                    <ringGeometry args={[0.15, 0.185, 28]} />
                    <meshBasicMaterial color={color} transparent opacity={speaking ? 0.55 : 0.22} />
                </mesh>

                {speaking && (
                    <mesh position={[0, 0.55, 0]}>
                        <sphereGeometry args={[0.1, 16, 16]} />
                        <meshBasicMaterial color={color} transparent opacity={0.12} />
                    </mesh>
                )}
            </group>

            <Html position={[0, 0.74, 0]} center distanceFactor={7} occlude={false} style={{ pointerEvents: "none" }}>
                <div style={{ textAlign: "center", whiteSpace: "nowrap" }}>
                    <div
                        style={{
                            fontSize: "9px",
                            fontWeight: 800,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color,
                            textShadow: "0 1px 4px rgba(0,0,0,0.85)",
                        }}
                    >
                        {label}
                    </div>
                    <div
                        style={{
                            fontSize: "7px",
                            fontWeight: 500,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            color: "rgba(255,255,255,0.55)",
                        }}
                    >
                        {role === "agent" ? "Port Agent" : "Customer"}
                    </div>
                </div>
            </Html>
        </group>
    );
}

function DealTable() {
    return (
        <group position={[0, 0.09, 0]}>
            <mesh castShadow receiveShadow>
                <cylinderGeometry args={[0.3, 0.32, 0.03, 24]} />
                <meshStandardMaterial color="#0e2323" metalness={0.3} roughness={0.55} />
            </mesh>
            <mesh position={[0, -0.09, 0]}>
                <cylinderGeometry args={[0.03, 0.05, 0.16, 12]} />
                <meshStandardMaterial color="#0a1a1a" metalness={0.4} roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.016, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.295, 0.305, 32]} />
                <meshBasicMaterial color="#00C9A7" transparent opacity={0.5} />
            </mesh>
            {/* single manifest clipboard prop, off-center so it never sits under a bubble */}
            <mesh position={[0.05, 0.024, -0.06]} rotation={[-Math.PI / 2, 0, 0.3]}>
                <boxGeometry args={[0.09, 0.12, 0.006]} />
                <meshStandardMaterial color="#f0e6d2" roughness={0.8} />
            </mesh>
        </group>
    );
}

function ChatBubble({ line, side }: { line: Line; side: "left" | "right" }) {
    const isAgent = line.from === "agent";
    const color = isAgent ? "#00C9A7" : "#3B82F6";

    return (
        <Html
            position={[side === "left" ? -0.82 : 0.82, 0.95, 0]}
            center
            distanceFactor={6}
            occlude={false}
            style={{ pointerEvents: "none" }}
        >
            <div
                key={line.text}
                style={{
                    maxWidth: "165px",
                    padding: "8px 11px",
                    borderRadius: "13px",
                    background: "rgba(8,17,17,0.8)",
                    border: `1px solid ${color}70`,
                    boxShadow: `0 10px 24px -10px rgba(0,0,0,0.75), 0 0 18px -8px ${color}55`,
                    backdropFilter: "blur(7px)",
                    animation: "fadeSlideIn 0.4s ease-out",
                }}
            >
                <div
                    style={{
                        fontSize: "7px",
                        fontWeight: 800,
                        letterSpacing: "0.09em",
                        textTransform: "uppercase",
                        color,
                        marginBottom: "3px",
                    }}
                >
                    {isAgent ? "Agent" : "Customer"}
                </div>
                <div style={{ fontSize: "9.5px", lineHeight: 1.4, color: "#f2fdfb", fontWeight: 500 }}>
                    {line.text}
                </div>
            </div>
            <style>{`
                @keyframes fadeSlideIn {
                    from { opacity: 0; transform: translateY(7px) scale(0.96); }
                    to { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </Html>
    );
}

/* ---------------------------- Main export ---------------------------- */

interface AgentCustomerDiscussionProps {
    reducedMotion: boolean;
}

export default function AgentCustomerDiscussion({ reducedMotion }: AgentCustomerDiscussionProps) {
    const [index, setIndex] = useState(0);
    const elapsed = useRef(0);

    useFrame((_, delta) => {
        if (reducedMotion) return;
        elapsed.current += delta;
        if (elapsed.current >= LINE_DURATION) {
            elapsed.current = 0;
            setIndex((i) => (i + 1) % CONVERSATION.length);
        }
    });

    const current = CONVERSATION[index];
    const side = current.from === "customer" ? "left" : "right";

    return (
        <group position={[0, 0.05, 0.5]}>
            {/* Layer 1 — cranes, far back + elevated */}
            <GantryCrane x={-1.7} />
            <GantryCrane x={1.7} mirrored />

            {/* Layer 2 — container yards, mid-back, flanking left/right */}
            <ContainerYard side="left" />
            <ContainerYard side="right" />

            {/* Layer 3 — port signage, far back */}
            <PortSignage />

            {/* Layer 4 — the deal, foreground center, isolated radius */}
            <DealTable />
            <HumanFigure
                position={[-0.7, 0, 0.02]}
                facing={Math.PI * 0.34}
                color="#1d4ed8"
                label="Customer"
                role="customer"
                speaking={current.from === "customer"}
            />
            <HumanFigure
                position={[0.7, 0, 0.02]}
                facing={-Math.PI * 0.34}
                color="#00806c"
                label="Agent"
                role="agent"
                speaking={current.from === "agent"}
            />
            <ChatBubble line={current} side={side} />
        </group>
    );
}

export { TOTAL_DURATION };