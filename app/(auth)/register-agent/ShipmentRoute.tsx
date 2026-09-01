"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Html } from "@react-three/drei";

/* ------------------------------------------------------------------ */
/*  Route data — 4 ports, in order. Route always STARTS in Bangladesh. */
/* ------------------------------------------------------------------ */

interface PortStop {
    port: string;
    country: string;
    /** ISO 3166-1 alpha-2 code, used to pull the real flag from flagcdn.com */
    iso: string;
}

const ROUTE: PortStop[] = [
    { port: "Chattogram Port", country: "Bangladesh", iso: "bd" },
    { port: "Shanghai Port", country: "China", iso: "cn" },
    { port: "Jeddah Port", country: "Saudi Arabia", iso: "sa" },
    { port: "Jebel Ali Port", country: "UAE", iso: "ae" },
];

/** Direct flag image URL — flagcdn.com serves real flag PNGs, no API key needed. */
function flagUrl(iso: string, width: 40 | 80 | 160 = 80) {
    return `https://flagcdn.com/w${width}/${iso}.png`;
}

/* ------------------------------------------------------------------ */
/*  Curve — starts at Bangladesh (index 0) and sweeps through the      */
/*  remaining 3 ports in order.                                        */
/* ------------------------------------------------------------------ */

const ROUTE_RADIUS = 3.4;

function buildCurve() {
    const n = ROUTE.length;
    const points: THREE.Vector3[] = [];
    for (let i = 0; i < n; i++) {
        // i = 0 is pinned to the start of the sweep (Bangladesh, left side),
        // sweeping rightward through the rest of the route in order.
        const angle = (i / (n - 1)) * Math.PI * 0.85 - Math.PI * 0.425;
        const x = Math.sin(angle) * ROUTE_RADIUS;
        const z = Math.cos(angle) * ROUTE_RADIUS - 1.1;
        const y = 0.02 + Math.sin(i * 1.7) * 0.015;
        points.push(new THREE.Vector3(x, y, z));
    }
    return new THREE.CatmullRomCurve3(points, false, "catmullrom", 0.35);
}

/* ------------------------------------------------------------------ */
/*  Port marker: pin + real flag image (HTML <img>) + labels          */
/*  Rendered via drei <Html>, so it's a genuine <img src=".../bd.png">*/
/*  — a direct flag image, not a drawn/emoji texture.                  */
/* ------------------------------------------------------------------ */

function PortMarker({
    position,
    stop,
    reducedMotion,
    delay,
    isStart,
}: {
    position: THREE.Vector3;
    stop: PortStop;
    reducedMotion: boolean;
    delay: number;
    isStart: boolean;
}) {
    const pinRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const t = state.clock.getElapsedTime();
        if (pinRef.current) {
            const pulse = reducedMotion ? 1 : 1 + Math.sin(t * 2 + delay) * 0.08;
            pinRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <group position={position}>
            {/* base ring on the "water" */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
                <ringGeometry args={[0.055, 0.075, 24]} />
                <meshBasicMaterial
                    color={isStart ? "#FFD166" : "#00C9A7"}
                    transparent
                    opacity={0.7}
                />
            </mesh>

            {/* pin dot */}
            <mesh ref={pinRef} position={[0, 0.05, 0]}>
                <sphereGeometry args={[0.045, 16, 16]} />
                <meshStandardMaterial
                    color={isStart ? "#FFD166" : "#00C9A7"}
                    emissive={isStart ? "#FFD166" : "#00C9A7"}
                    emissiveIntensity={1.4}
                    toneMapped={false}
                />
            </mesh>

            {/* Always-visible flag chip + port/country label, real flag image */}
            <Html
                position={[0, 0.68, 0]}
                center
                distanceFactor={6}
                occlude={false}
                style={{ pointerEvents: "none" }}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "4px",
                        whiteSpace: "nowrap",
                    }}
                >
                    <div
                        style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            overflow: "hidden",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "rgba(10,20,20,0.55)",
                            border: `2px solid ${isStart ? "#FFD166" : "rgba(0,201,167,0.6)"}`,
                            boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
                        }}
                    >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={flagUrl(stop.iso, 80)}
                            srcSet={`${flagUrl(stop.iso, 40)} 1x, ${flagUrl(stop.iso, 80)} 2x, ${flagUrl(stop.iso, 160)} 4x`}
                            alt={`${stop.country} flag`}
                            width={34}
                            height={34}
                            style={{ width: "150%", height: "150%", objectFit: "cover" }}
                        />
                    </div>

                    <span
                        style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#ffffff",
                            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                        }}
                    >
                        {stop.port}
                    </span>
                    <span
                        style={{
                            fontSize: "8px",
                            fontWeight: 500,
                            letterSpacing: "0.04em",
                            color: isStart ? "#FFD166" : "#00C9A7",
                            textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                            marginTop: "-2px",
                        }}
                    >
                        {stop.country}
                        {isStart ? " · Origin" : ""}
                    </span>
                </div>
            </Html>
        </group>
    );
}

/* ------------------------------------------------------------------ */
/*  Ship — simple stylized hull + bridge, moves along the curve.       */
/*  Starts at t=0 which is the Bangladesh port (route start).         */
/* ------------------------------------------------------------------ */

function Ship({
    curve,
    reducedMotion,
    boosted,
    progressRef,
}: {
    curve: THREE.CatmullRomCurve3;
    reducedMotion: boolean;
    boosted?: boolean;
    progressRef: React.MutableRefObject<number>;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const wakeRef = useRef<THREE.Mesh>(null);

    const tmpPos = useMemo(() => new THREE.Vector3(), []);
    const tmpLookAhead = useMemo(() => new THREE.Vector3(), []);

    useFrame((state, delta) => {
        const speed = reducedMotion ? 0.02 : boosted ? 0.055 : 0.03;
        // one-way voyage: Bangladesh (t=0) -> ... -> last port (t=1), then
        // loops back so it always departs from Bangladesh again.
        progressRef.current = (progressRef.current + delta * speed) % 1;
        const t = progressRef.current;

        curve.getPointAt(t, tmpPos);
        curve.getPointAt(Math.min(t + 0.01, 1), tmpLookAhead);

        if (groupRef.current) {
            groupRef.current.position.copy(tmpPos);
            groupRef.current.position.y += 0.03;
            groupRef.current.lookAt(tmpLookAhead.x, groupRef.current.position.y, tmpLookAhead.z);

            if (!reducedMotion) {
                const bob = state.clock.getElapsedTime();
                groupRef.current.position.y += Math.sin(bob * 2.4) * 0.012;
                groupRef.current.rotation.z = Math.sin(bob * 1.6) * 0.025;
            }
        }
        if (wakeRef.current) {
            wakeRef.current.scale.x = THREE.MathUtils.lerp(
                wakeRef.current.scale.x,
                boosted ? 1.6 : 1,
                delta * 2
            );
        }
    });

    return (
        <group ref={groupRef}>
            {/* hull */}
            <mesh position={[0, 0, 0]} castShadow>
                <boxGeometry args={[0.32, 0.09, 0.11]} />
                <meshStandardMaterial color="#0f2a2a" metalness={0.4} roughness={0.5} />
            </mesh>
            {/* hull taper (bow) */}
            <mesh position={[0.17, 0, 0]} rotation={[0, 0, 0]}>
                <coneGeometry args={[0.06, 0.14, 4]} />
                <meshStandardMaterial color="#0f2a2a" metalness={0.4} roughness={0.5} />
            </mesh>
            {/* deck containers */}
            {[-0.09, -0.02, 0.05].map((x, i) => (
                <mesh key={i} position={[x, 0.08, 0]} castShadow>
                    <boxGeometry args={[0.06, 0.07, 0.09]} />
                    <meshStandardMaterial
                        color={i % 2 === 0 ? "#00C9A7" : "#0b1f1f"}
                        emissive={i % 2 === 0 ? "#00C9A7" : "#000000"}
                        emissiveIntensity={i % 2 === 0 ? 0.25 : 0}
                        metalness={0.3}
                        roughness={0.6}
                    />
                </mesh>
            ))}
            {/* bridge */}
            <mesh position={[-0.13, 0.11, 0]}>
                <boxGeometry args={[0.06, 0.09, 0.09]} />
                <meshStandardMaterial color="#e8fff9" emissive="#00C9A7" emissiveIntensity={0.15} />
            </mesh>
            {/* nav light */}
            <mesh position={[0.2, 0.03, 0]}>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshStandardMaterial color="#00C9A7" emissive="#00C9A7" emissiveIntensity={2} toneMapped={false} />
            </mesh>

            {/* wake trail */}
            <mesh ref={wakeRef} position={[-0.25, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <coneGeometry args={[0.05, 0.35, 3, 1, true]} />
                <meshBasicMaterial color="#00C9A7" transparent opacity={0.18} depthWrite={false} />
            </mesh>
        </group>
    );
}

/* ------------------------------------------------------------------ */
/*  Route line — thin dashed line tracing the curve                   */
/* ------------------------------------------------------------------ */

function RouteLine({ curve }: { curve: THREE.CatmullRomCurve3 }) {
    const points = useMemo(() => curve.getPoints(120), [curve]);
    const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points]);

    return (
        <line>
            <primitive object={geometry} attach="geometry" />
            <lineDashedMaterial
                color="#00C9A7"
                transparent
                opacity={0.45}
                dashSize={0.06}
                gapSize={0.04}
            />
        </line>
    );
}

/* ------------------------------------------------------------------ */
/*  Main export                                                        */
/* ------------------------------------------------------------------ */

interface ShipmentRouteProps {
    reducedMotion: boolean;
    boosted?: boolean;
}

export default function ShipmentRoute({ reducedMotion, boosted }: ShipmentRouteProps) {
    const curve = useMemo(() => buildCurve(), []);
    const progressRef = useRef(0);

    return (
        <group>
            <RouteLine curve={curve} />

            {ROUTE.map((stop, i) => {
                const t = i / (ROUTE.length - 1);
                const pos = curve.getPointAt(Math.min(Math.max(t, 0), 1));
                return (
                    <PortMarker
                        key={stop.port}
                        position={pos}
                        stop={stop}
                        reducedMotion={reducedMotion}
                        delay={i * 0.7}
                        isStart={i === 0}
                    />
                );
            })}

            <Ship
                curve={curve}
                reducedMotion={reducedMotion}
                boosted={boosted}
                progressRef={progressRef}
            />
        </group>
    );
}