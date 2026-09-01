"use client";

import { motion } from "framer-motion";
import { Box, Container } from "lucide-react";

interface ContainerInfoCardProps {
    reducedMotion: boolean;
    className?: string;
}

export default function ContainerInfoCard({ reducedMotion, className = "" }: ContainerInfoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16, rotateX: -8 }}
            animate={
                reducedMotion
                    ? { opacity: 1, y: 0, rotateX: 0 }
                    : { opacity: 1, y: [0, 7, 0], rotateX: [0, 3, 0], rotateY: [0, -4, 0] }
            }
            transition={
                reducedMotion
                    ? { duration: 0.5 }
                    : {
                        y: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
                        rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
                        rotateY: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.2 },
                        opacity: { duration: 0.6, delay: 0.1 },
                    }
            }
            style={{
                perspective: "800px",
                transformStyle: "preserve-3d",
            }}
            className={`relative ${className}`}
        >
            {/* Depth shadow layer — sits behind, offset, blurred: the "8D" floor shadow */}
            <div
                className="absolute inset-0 rounded-2xl"
                style={{
                    background: "rgba(0,0,0,0.5)",
                    transform: "translateZ(-18px) translateY(10px) scale(0.96)",
                    filter: "blur(10px)",
                }}
            />

            {/* Secondary offset panel — thin edge behind the card, gives it a "slab thickness" */}
            <div
                className="absolute inset-0 rounded-2xl"
                style={{
                    background: "linear-gradient(135deg, rgba(59,130,246,0.18), rgba(0,201,167,0.10))",
                    border: "1px solid rgba(255,255,255,0.06)",
                    transform: "translateZ(-8px) translate(4px, 4px)",
                }}
            />

            {/* Main card face */}
            <div
                className="relative rounded-2xl px-4 py-3 backdrop-blur-xl overflow-hidden"
                style={{
                    background: "rgba(10, 15, 15, 0.55)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    boxShadow:
                        "0 20px 40px -20px rgba(0,0,0,0.6), 0 2px 0 rgba(255,255,255,0.05) inset, 0 -2px 12px rgba(0,0,0,0.4) inset",
                    transform: "translateZ(0px)",
                }}
            >
                {/* Top glossy sheen strip — fake specular highlight for 8D pop */}
                <div
                    className="pointer-events-none absolute inset-x-0 top-0 h-1/2 rounded-t-2xl"
                    style={{
                        background: "linear-gradient(180deg, rgba(255,255,255,0.09), transparent)",
                    }}
                />

                {/* Corrugated container texture — thin vertical ridge lines like a real container wall */}
                <div className="pointer-events-none absolute inset-0 flex justify-between px-2 opacity-[0.07]">
                    {Array.from({ length: 10 }).map((_, i) => (
                        <div key={i} className="h-full w-px bg-white" />
                    ))}
                </div>

                {/* Corner bolt accents — container corner-casting detail */}
                <div className="pointer-events-none absolute left-1.5 top-1.5 h-1 w-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }} />
                <div className="pointer-events-none absolute right-1.5 top-1.5 h-1 w-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }} />
                <div className="pointer-events-none absolute left-1.5 bottom-1.5 h-1 w-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }} />
                <div className="pointer-events-none absolute right-1.5 bottom-1.5 h-1 w-1 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }} />

                {/* <div className="relative flex items-center gap-3">
                    <div
                        className="relative rounded-lg p-1.5"
                        style={{
                            background: "rgba(59,130,246,0.12)",
                            boxShadow: "0 2px 6px -2px rgba(59,130,246,0.5), 0 0 0 1px rgba(59,130,246,0.15) inset",
                        }}
                    >
                        <Box size={14} style={{ color: "#3B82F6" }} />
                    </div>
                    <div>
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Container</div>
                        <div className="text-xs font-medium text-white flex items-center gap-1">
                            <Container size={11} style={{ color: "#00C9A7" }} />
                            FAZU 482913 · 40FT HC
                        </div>
                    </div>
                </div>

                <div className="relative mt-2 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#00C9A7" }}>
                    <span className="relative flex h-1.5 w-1.5">
                        <span
                            className="absolute inline-flex h-full w-full rounded-full opacity-60"
                            style={{
                                background: "#00C9A7",
                                animation: reducedMotion ? "none" : "ping 1.8s cubic-bezier(0,0,0.2,1) infinite",
                            }}
                        />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "#00C9A7" }} />
                    </span>
                    Secure
                </div> */}
            </div>
        </motion.div>
    );
}