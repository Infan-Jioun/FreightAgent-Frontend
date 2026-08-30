"use client";

import { motion } from "framer-motion";

interface RouteNode {
    label: string;
    sublabel: string;
    x: number; // percentage across the panel
    y: number; // percentage down the panel
    active?: boolean;
}

const NODES: RouteNode[] = [
    { label: "Muscat", sublabel: "Oman", x: 14, y: 22 },
    { label: "Dubai", sublabel: "UAE", x: 40, y: 46, active: true },
    { label: "Riyadh", sublabel: "Saudi Arabia", x: 68, y: 76 },
];

/**
 * A quiet abstract route line + node markers, positioned absolutely over
 * the 3D scene. Deliberately not a map — just enough geography to read as
 * "this platform moves freight across the Gulf."
 */
export default function ShipmentRoute({ reducedMotion }: { reducedMotion: boolean }) {
    const pathD = `M ${NODES[0].x} ${NODES[0].y} Q ${(NODES[0].x + NODES[1].x) / 2 - 6} ${
        (NODES[0].y + NODES[1].y) / 2
    } ${NODES[1].x} ${NODES[1].y} Q ${(NODES[1].x + NODES[2].x) / 2 + 6} ${
        (NODES[1].y + NODES[2].y) / 2
    } ${NODES[2].x} ${NODES[2].y}`;

    return (
        <svg
            className="pointer-events-none absolute inset-0 h-full w-full z-[5]"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id="routeLine" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#00C9A7" stopOpacity="0.15" />
                    <stop offset="55%" stopColor="#00C9A7" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.35" />
                </linearGradient>
            </defs>

            <path
                d={pathD}
                fill="none"
                stroke="url(#routeLine)"
                strokeWidth="0.18"
                strokeDasharray="0.6 0.9"
                vectorEffect="non-scaling-stroke"
            />

            {NODES.map((node, i) => (
                <g key={node.label} transform={`translate(${node.x}, ${node.y})`}>
                    {node.active && !reducedMotion && (
                        <motion.circle
                            r={1.1}
                            fill="none"
                            stroke="#00C9A7"
                            strokeWidth="0.15"
                            animate={{ r: [1.1, 3.2], opacity: [0.6, 0] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: i * 0.3 }}
                        />
                    )}
                    <circle r={0.55} fill={node.active ? "#00C9A7" : "#e5e7eb"} fillOpacity={node.active ? 1 : 0.55} />
                    <circle r={0.9} fill="none" stroke={node.active ? "#00C9A7" : "#ffffff"} strokeOpacity={0.3} strokeWidth="0.12" />
                </g>
            ))}
        </svg>
    );
}

export function ShipmentRouteLabels() {
    return (
        <div className="pointer-events-none absolute inset-0 z-[6]">
            {NODES.map((node) => (
                <div
                    key={node.label}
                    className="absolute -translate-x-1/2 -translate-y-full pb-2 text-left"
                    style={{ left: `${node.x}%`, top: `${node.y}%` }}
                >
                    <div
                        className="text-[11px] font-semibold tracking-wide"
                        style={{ color: node.active ? "#00C9A7" : "#e5e7eb" }}
                    >
                        {node.label}
                    </div>
                    <div className="text-[9px] uppercase tracking-widest text-gray-500">{node.sublabel}</div>
                </div>
            ))}
        </div>
    );
}
