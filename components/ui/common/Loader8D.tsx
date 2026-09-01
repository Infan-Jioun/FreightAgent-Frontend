"use client";

import { motion } from "framer-motion";
import { Anchor } from "lucide-react";

/* ================================================================== */
/*  8D ROOT LOADER — Logo + Ship                                       */
/*  A brand anchor-mark pulses at the hub while a stylized cargo ship  */
/*  sails a closed elliptical orbit around it in true 3D perspective — */
/*  hull banks into turns, bobs on waves, and casts a moving ground    */
/*  shadow, so it reads as an object orbiting in space, not a flat     */
/*  CSS spin. Wake ripple trails behind it, ocean glow beneath.        */
/* ================================================================== */

interface Loader8DProps {
    size?: number;
    label?: string;
    className?: string;
}

export default function Loader8D({ size = 150, label = "Loading…", className = "" }: Loader8DProps) {
    const orbitRX = size * 0.42;
    const orbitRY = size * 0.16;

    return (
        <div
            className={`relative flex flex-col items-center justify-center ${className}`}
            style={{ width: size, height: size + (label ? 34 : 0) }}
        >
            <div
                className="relative"
                style={{ width: size, height: size, perspective: "700px", perspectiveOrigin: "50% 45%" }}
            >
                {/* ocean glow floor */}
                <div
                    className="absolute rounded-full"
                    style={{
                        width: size * 0.9,
                        height: size * 0.28,
                        left: "50%",
                        top: "62%",
                        transform: "translate(-50%, -50%)",
                        background: "radial-gradient(ellipse at center, rgba(0,201,167,0.22), transparent 72%)",
                        filter: "blur(7px)",
                    }}
                />

                {/* slow tilting stage for parallax depth */}
                <motion.div
                    className="absolute inset-0"
                    style={{ transformStyle: "preserve-3d" }}
                    animate={{ rotateX: [58, 66, 58] }}
                    transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                >
                    {/* orbit path ring (subtle) */}
                    <div
                        className="absolute left-1/2 top-1/2 rounded-full"
                        style={{
                            width: orbitRX * 2,
                            height: orbitRY * 2,
                            transform: "translate(-50%, -50%)",
                            border: "1px dashed rgba(0,201,167,0.28)",
                        }}
                    />

                    {/* CENTER HUB — the logo */}
                    <motion.div
                        className="absolute left-1/2 top-1/2 flex items-center justify-center rounded-full"
                        style={{
                            width: size * 0.34,
                            height: size * 0.34,
                            transform: "translate(-50%, -50%) translateZ(10px)",
                            background: "radial-gradient(circle at 35% 30%, #103b36, #050f0f 78%)",
                            border: "1px solid rgba(0,201,167,0.45)",
                            boxShadow: "0 4px 18px rgba(0,0,0,0.65), inset 0 0 10px rgba(0,201,167,0.35)",
                        }}
                        animate={{
                            scale: [1, 1.06, 1], boxShadow: [
                                "0 4px 18px rgba(0,0,0,0.65), inset 0 0 10px rgba(0,201,167,0.35)",
                                "0 4px 22px rgba(0,201,167,0.35), inset 0 0 16px rgba(0,201,167,0.55)",
                                "0 4px 18px rgba(0,0,0,0.65), inset 0 0 10px rgba(0,201,167,0.35)",
                            ]
                        }}
                        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <Anchor size={size * 0.15} style={{ color: "#00C9A7" }} strokeWidth={2.4} />
                        {/* pulse rings emitted from logo */}
                        <motion.span
                            className="absolute inset-0 rounded-full"
                            style={{ border: "1px solid rgba(0,201,167,0.55)" }}
                            animate={{ scale: [1, 1.9], opacity: [0.6, 0] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut" }}
                        />
                        <motion.span
                            className="absolute inset-0 rounded-full"
                            style={{ border: "1px solid rgba(59,130,246,0.45)" }}
                            animate={{ scale: [1, 1.9], opacity: [0.5, 0] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: "easeOut", delay: 1.1 }}
                        />
                    </motion.div>

                    {/* ORBITING SHIP — travels the ellipse, banking + bobbing */}
                    <motion.div
                        className="absolute left-1/2 top-1/2"
                        style={{ transformStyle: "preserve-3d" }}
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4.2, repeat: Infinity, ease: "linear" }}
                    >
                        <ShipOnOrbit rx={orbitRX} ry={orbitRY} />
                    </motion.div>
                </motion.div>
            </div>

            {label && (
                <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
                    className="mt-2 text-[10px] font-semibold uppercase tracking-widest"
                    style={{ color: "#00C9A7", textShadow: "0 1px 4px rgba(0,0,0,0.7)" }}
                >
                    {label}
                </motion.div>
            )}
        </div>
    );
}

/* A single ship placed at the orbit radius; the parent's `rotate 360`
   sweeps it around the ellipse. This inner layer counter-tilts the hull
   so it visually banks into the turn instead of rigidly rotating flat. */
function ShipOnOrbit({ rx, ry }: { rx: number; ry: number }) {
    return (
        <motion.div
            className="absolute"
            style={{
                left: rx,
                top: 0,
                width: 0,
                height: 0,
            }}
        >
            <motion.div
                style={{ transformStyle: "preserve-3d" }}
                animate={{ y: [0, -4, 0], rotateZ: [-6, 6, -6] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            >
                {/* squash the circular orbit into the parent ellipse */}
                <div style={{ transform: `scaleY(${ry / rx})`, transformOrigin: "center" }}>
                    <svg width="34" height="20" viewBox="0 0 34 20" style={{ overflow: "visible" }}>
                        <defs>
                            <linearGradient id="hullGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#e8fff9" />
                                <stop offset="55%" stopColor="#0f2a2a" />
                                <stop offset="100%" stopColor="#081717" />
                            </linearGradient>
                        </defs>
                        {/* hull */}
                        <path d="M2 12 L6 17 L28 17 L32 12 L28 8 L6 8 Z" fill="url(#hullGrad)" stroke="#00C9A7" strokeWidth="0.6" />
                        {/* bridge */}
                        <rect x="19" y="3" width="7" height="6" rx="1" fill="#e8fff9" stroke="#00C9A7" strokeWidth="0.5" />
                        {/* containers on deck */}
                        <rect x="7" y="5.5" width="4" height="3.5" fill="#00C9A7" opacity="0.85" />
                        <rect x="12" y="5.5" width="4" height="3.5" fill="#3B82F6" opacity="0.85" />
                        {/* funnel glow */}
                        <circle cx="22.5" cy="2" r="1.1" fill="#f59e0b">
                            <animate attributeName="opacity" values="0.4;1;0.4" dur="1s" repeatCount="indefinite" />
                        </circle>
                        {/* nav light */}
                        <circle cx="31" cy="12" r="1" fill="#00C9A7">
                            <animate attributeName="opacity" values="1;0.3;1" dur="0.8s" repeatCount="indefinite" />
                        </circle>
                    </svg>
                </div>
            </motion.div>

            {/* wake trail behind the ship */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 22,
                    height: 4,
                    left: -20,
                    top: 10,
                    background: "linear-gradient(90deg, transparent, rgba(0,201,167,0.5))",
                    filter: "blur(2px)",
                }}
                animate={{ opacity: [0.6, 0.15, 0.6], scaleX: [0.7, 1, 0.7] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
            />

            {/* moving cast shadow on the "water" */}
            <motion.div
                className="absolute rounded-full"
                style={{
                    width: 30,
                    height: 6,
                    left: 2,
                    top: 22,
                    background: "rgba(0,0,0,0.4)",
                    filter: "blur(4px)",
                }}
                animate={{ opacity: [0.5, 0.25, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />
        </motion.div>
    );
}