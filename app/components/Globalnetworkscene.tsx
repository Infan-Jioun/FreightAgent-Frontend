"use client";

import { useEffect, useRef, useState } from "react";
import {
    Package,
    Ship,
    Plane,
    Globe2,
    Radar,
    Warehouse,
    Route,
    Clock,
} from "lucide-react";

/**
 * GlobalNetworkScene
 * ---------------------------------------------------------------
 * A scroll-driven sequence: a shipping container starts small and
 * far away, grows as the user scrolls (simulated camera dolly-in),
 * crosses the "camera plane" (fills / blurs past viewport), then
 * dissolves into a Global Shipment Network scene — a world map
 * with animated route lines and floating stat cards.
 * ---------------------------------------------------------------
 */

const HUBS = [
    { name: "Muscat", top: "46%", left: "60%" },
    { name: "Dubai", top: "42%", left: "62%" },
    { name: "Jeddah", top: "44%", left: "56%" },
    { name: "Rotterdam", top: "24%", left: "48%" },
    { name: "Singapore", top: "58%", left: "76%" },
    { name: "Shanghai", top: "36%", left: "82%" },
    { name: "New York", top: "32%", left: "22%" },
];

const ROUTE_PAIRS: [number, number][] = [
    [0, 3],
    [0, 4],
    [1, 5],
    [2, 3],
    [4, 5],
    [3, 6],
];

const STATS = [
    { icon: Package, value: "48K+", label: "Shipments routed" },
    { icon: Route, value: "120+", label: "Active trade lanes" },
    { icon: Clock, value: "< 2min", label: "Avg. status update" },
    { icon: Warehouse, value: "36", label: "Regional hubs" },
];

export function GlobalNetworkScene() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [progress, setProgress] = useState(0); // 0 -> 1 across the whole section

    useEffect(() => {
        let raf = 0;

        const onScroll = () => {
            if (raf) cancelAnimationFrame(raf);
            raf = requestAnimationFrame(() => {
                const el = sectionRef.current;
                if (!el) return;
                const rect = el.getBoundingClientRect();
                const viewportH = window.innerHeight;
                const total = rect.height - viewportH;
                const scrolled = -rect.top;
                const p = total > 0 ? Math.min(1, Math.max(0, scrolled / total)) : 0;
                setProgress(p);
            });
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        onScroll();
        return () => {
            window.removeEventListener("scroll", onScroll);
            if (raf) cancelAnimationFrame(raf);
        };
    }, []);

    // Phase breakdown across progress 0 -> 1
    const containerPhase = clamp(progress / 0.55, 0, 1);
    const crossPhase = clamp((progress - 0.45) / 0.2, 0, 1);
    const networkPhase = clamp((progress - 0.55) / 0.45, 0, 1);

    const containerScale = lerp(0.15, 3.2, easeInCubic(containerPhase));
    const containerBlur = lerp(0, 18, easeInCubic(crossPhase));
    const containerOpacity = 1 - easeInCubic(crossPhase);

    const networkOpacity = easeOutCubic(networkPhase);
    const networkScale = lerp(0.97, 1, easeOutCubic(networkPhase));

    return (
        <section
            ref={sectionRef}
            className="relative"
            style={{ height: "340vh" }}
            aria-label="Global shipment network"
        >
            <div className="sticky top-0 h-screen w-full overflow-hidden">
                {/* ---------- Layer 1: Container approaching camera ---------- */}
                <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                        opacity: containerOpacity,
                        pointerEvents: containerOpacity < 0.05 ? "none" : "auto",
                    }}
                >
                    <div
                        className="absolute inset-0"
                        style={{ background: "var(--bg-primary)" }}
                    />
                    <div
                        className="absolute w-[600px] h-[600px] rounded-full opacity-[0.08] blur-[140px]"
                        style={{ background: "var(--accent-primary)" }}
                    />

                    <div
                        className="relative"
                        style={{
                            transform: `scale(${containerScale})`,
                            filter: `blur(${containerBlur}px)`,
                            transition: "filter 0.05s linear",
                            willChange: "transform, filter",
                        }}
                    >
                        <ContainerGlyph />
                    </div>

                    <div
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-xs tracking-widest uppercase"
                        style={{
                            color: "var(--text-muted)",
                            opacity: 1 - easeInCubic(clamp(progress / 0.12, 0, 1)),
                        }}
                    >
                        <span>Scroll</span>
                        <span
                            className="w-[1px] h-8 animate-pulse"
                            style={{ background: "var(--text-muted)" }}
                        />
                    </div>
                </div>

                {/* ---------- Layer 2: Global network scene ---------- */}
                <div
                    className="absolute inset-0"
                    style={{
                        opacity: networkOpacity,
                        transform: `scale(${networkScale})`,
                        pointerEvents: networkOpacity < 0.4 ? "none" : "auto",
                    }}
                >
                    <NetworkScene reveal={networkPhase} />
                </div>
            </div>
        </section>
    );
}

/* ------------------------------------------------------------------ */
function ContainerGlyph() {
    const ridgeCount = 6;
    return (
        <div className="relative" style={{ width: 220, height: 130 }}>
            <svg
                width={220}
                height={130}
                viewBox="0 0 220 130"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect
                    x={10}
                    y={20}
                    width={200}
                    height={90}
                    rx={4}
                    fill="var(--gradient-card, #10201d)"
                    stroke="var(--accent-primary)"
                    strokeWidth={2}
                />
                {Array.from({ length: ridgeCount }).map((_, i) => (
                    <line
                        key={i}
                        x1={30 + i * 28}
                        y1={22}
                        x2={30 + i * 28}
                        y2={108}
                        stroke="var(--border-primary)"
                        strokeWidth={1.5}
                        opacity={0.6}
                    />
                ))}
                <line
                    x1={210}
                    y1={20}
                    x2={210}
                    y2={110}
                    stroke="var(--accent-secondary)"
                    strokeWidth={2}
                />
                <text
                    x={20}
                    y={45}
                    fontSize={14}
                    fontWeight={700}
                    fill="var(--accent-secondary)"
                    fontFamily="sans-serif"
                    opacity={0.9}
                >
                    FRA
                </text>
                <text
                    x={20}
                    y={95}
                    fontSize={9}
                    fill="var(--text-muted)"
                    fontFamily="monospace"
                    opacity={0.8}
                >
                    40FT · HC · GULF
                </text>
            </svg>
        </div>
    );
}

/* ------------------------------------------------------------------ */
function NetworkScene({ reveal }: { reveal: number }) {
    return (
        <div
            className="relative w-full h-full flex items-center justify-center"
            style={{ background: "var(--bg-primary)" }}
        >
            <div
                className="absolute top-[-15%] left-[-8%] w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[130px]"
                style={{ background: "var(--accent-blue)" }}
            />
            <div
                className="absolute bottom-[-15%] right-[-8%] w-[500px] h-[500px] rounded-full opacity-[0.06] blur-[130px]"
                style={{ background: "var(--accent-primary)" }}
            />

            <div className="relative w-full max-w-5xl mx-auto px-6">
                <div
                    className="text-center mb-10"
                    style={{
                        opacity: clamp((reveal - 0.1) / 0.3, 0, 1),
                        transform: `translateY(${lerp(16, 0, clamp((reveal - 0.1) / 0.3, 0, 1))}px)`,
                    }}
                >
                    <p
                        className="text-xs tracking-widest mb-3 uppercase inline-flex items-center gap-2"
                        style={{ color: "var(--accent-primary)" }}
                    >
                        <Globe2 size={14} strokeWidth={2} />
                        Live network
                    </p>
                    <h2
                        className="text-3xl md:text-4xl font-bold"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Global shipment network
                    </h2>
                    <p
                        className="mt-3 text-sm md:text-base max-w-xl mx-auto"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        Every container, every hub, every checkpoint — tracked in one
                        place, from Gulf ports to the rest of the world.
                    </p>
                </div>

                <div
                    className="relative rounded-3xl overflow-hidden"
                    style={{
                        border: "1px solid var(--border-primary)",
                        background: "var(--gradient-card)",
                        boxShadow: "var(--shadow-card)",
                        height: 360,
                        opacity: clamp((reveal - 0.2) / 0.4, 0, 1),
                    }}
                >
                    <WorldDots />

                    <svg
                        className="absolute inset-0 w-full h-full"
                        viewBox="0 0 100 100"
                        preserveAspectRatio="none"
                    >
                        {ROUTE_PAIRS.map(([a, b], i) => {
                            const from = HUBS[a];
                            const to = HUBS[b];
                            const x1 = parseFloat(from.left);
                            const y1 = parseFloat(from.top);
                            const x2 = parseFloat(to.left);
                            const y2 = parseFloat(to.top);
                            const lineReveal = clamp(
                                (reveal - 0.35 - i * 0.04) / 0.25,
                                0,
                                1
                            );
                            return (
                                <line
                                    key={i}
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke="var(--accent-primary)"
                                    strokeWidth={0.3}
                                    strokeDasharray="1.2 1"
                                    opacity={0.5 * lineReveal}
                                />
                            );
                        })}
                    </svg>

                    {HUBS.map((hub, i) => {
                        const hubReveal = clamp((reveal - 0.28 - i * 0.03) / 0.2, 0, 1);
                        return (
                            <div
                                key={hub.name}
                                className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
                                style={{
                                    top: hub.top,
                                    left: hub.left,
                                    opacity: hubReveal,
                                    transform: `translate(-50%, -50%) scale(${lerp(
                                        0.5,
                                        1,
                                        hubReveal
                                    )})`,
                                }}
                            >
                                <span className="relative flex h-2.5 w-2.5">
                                    <span
                                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
                                        style={{ background: "var(--accent-primary)" }}
                                    />
                                    <span
                                        className="relative inline-flex rounded-full h-2.5 w-2.5"
                                        style={{ background: "var(--accent-secondary)" }}
                                    />
                                </span>
                                <span
                                    className="text-[10px] whitespace-nowrap"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    {hub.name}
                                </span>
                            </div>
                        );
                    })}

                    <FloatingGlyph
                        Icon={Ship}
                        top="50%"
                        left="58%"
                        delay="0s"
                        reveal={reveal}
                    />
                    <FloatingGlyph
                        Icon={Plane}
                        top="30%"
                        left="65%"
                        delay="0.6s"
                        reveal={reveal}
                    />
                    <FloatingGlyph
                        Icon={Radar}
                        top="55%"
                        left="78%"
                        delay="1.1s"
                        reveal={reveal}
                    />
                </div>

                <div
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
                    style={{
                        opacity: clamp((reveal - 0.55) / 0.35, 0, 1),
                        transform: `translateY(${lerp(
                            20,
                            0,
                            clamp((reveal - 0.55) / 0.35, 0, 1)
                        )}px)`,
                    }}
                >
                    {STATS.map((stat, i) => {
                        const Icon = stat.icon;
                        const cardReveal = clamp((reveal - 0.6 - i * 0.05) / 0.3, 0, 1);
                        return (
                            <div
                                key={stat.label}
                                className="p-5 rounded-2xl flex flex-col items-start gap-3"
                                style={{
                                    background: "var(--gradient-card)",
                                    border: "1px solid var(--border-primary)",
                                    opacity: cardReveal,
                                    transform: `translateY(${lerp(12, 0, cardReveal)}px)`,
                                }}
                            >
                                <div
                                    className="p-2 rounded-lg"
                                    style={{ background: "rgba(0,229,192,0.08)" }}
                                >
                                    <Icon
                                        size={18}
                                        strokeWidth={2}
                                        color="var(--accent-secondary)"
                                    />
                                </div>
                                <div>
                                    <div
                                        className="text-xl font-bold"
                                        style={{ color: "var(--text-primary)" }}
                                    >
                                        {stat.value}
                                    </div>
                                    <div
                                        className="text-xs mt-0.5"
                                        style={{ color: "var(--text-muted)" }}
                                    >
                                        {stat.label}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

function FloatingGlyph({
    Icon,
    top,
    left,
    delay,
    reveal,
}: {
    Icon: typeof Ship;
    top: string;
    left: string;
    delay: string;
    reveal: number;
}) {
    const opacity = clamp((reveal - 0.7) / 0.3, 0, 1);
    return (
        <div
            className="absolute -translate-x-1/2 -translate-y-1/2 animate-bounce"
            style={{
                top,
                left,
                opacity,
                animationDuration: "3s",
                animationDelay: delay,
            }}
        >
            <div
                className="p-1.5 rounded-full"
                style={{
                    background: "var(--bg-primary)",
                    border: "1px solid var(--border-accent)",
                }}
            >
                <Icon size={12} strokeWidth={2} color="var(--accent-primary)" />
            </div>
        </div>
    );
}

/** Lightweight dotted backdrop standing in for a world map. */
function WorldDots() {
    const cols = 40;
    const rows = 20;
    const mask = worldMask();
    return (
        <div className="absolute inset-0 opacity-[0.35]">
            <svg
                className="w-full h-full"
                viewBox={`0 0 ${cols} ${rows}`}
                preserveAspectRatio="none"
            >
                {mask.map(([x, y], i) => (
                    <circle
                        key={i}
                        cx={x + 0.5}
                        cy={y + 0.5}
                        r={0.28}
                        fill="var(--text-muted)"
                    />
                ))}
            </svg>
        </div>
    );
}

function worldMask(): [number, number][] {
    const blobs: [number, number, number, number][] = [
        [4, 4, 7, 6],
        [7, 10, 4, 6],
        [17, 3, 6, 4],
        [17, 7, 5, 8],
        [22, 3, 12, 6],
        [26, 9, 6, 5],
        [32, 13, 5, 3],
    ];
    const pts: [number, number][] = [];
    for (const [bx, by, bw, bh] of blobs) {
        for (let x = bx; x < bx + bw; x++) {
            for (let y = by; y < by + bh; y++) {
                if ((x * 7 + y * 13) % 5 !== 0) continue;
                pts.push([x, y]);
            }
        }
    }
    return pts;
}

/* ------------------------------ utils ------------------------------ */
function clamp(v: number, min: number, max: number) {
    return Math.min(max, Math.max(min, v));
}
function lerp(a: number, b: number, t: number) {
    return a + (b - a) * t;
}
function easeInCubic(t: number) {
    return t * t * t;
}
function easeOutCubic(t: number) {
    return 1 - Math.pow(1 - t, 3);
}