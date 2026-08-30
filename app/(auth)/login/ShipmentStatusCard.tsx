"use client";

import { motion } from "framer-motion";

interface ShipmentStatusCardProps {
    reducedMotion: boolean;
    className?: string;
}

export default function ShipmentStatusCard({ reducedMotion, className = "" }: ShipmentStatusCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={
                reducedMotion
                    ? { opacity: 1, y: 0 }
                    : { opacity: 1, y: [0, -6, 0] }
            }
            transition={
                reducedMotion
                    ? { duration: 0.5 }
                    : { y: { duration: 5, repeat: Infinity, ease: "easeInOut" }, opacity: { duration: 0.6 } }
            }
            className={`rounded-2xl px-5 py-4 backdrop-blur-xl ${className}`}
            style={{
                background: "rgba(10, 15, 15, 0.55)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 20px 40px -20px rgba(0,0,0,0.6)",
            }}
        >
            <div className="flex items-center justify-between gap-6">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                    Shipment #FA-20491
                </span>
                <span className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: "#00C9A7" }}>
                    <span className="relative flex h-1.5 w-1.5">
                        <span
                            className="absolute inline-flex h-full w-full rounded-full opacity-60"
                            style={{ background: "#00C9A7", animation: reducedMotion ? "none" : "ping 1.8s cubic-bezier(0,0,0.2,1) infinite" }}
                        />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full" style={{ background: "#00C9A7" }} />
                    </span>
                    In Transit
                </span>
            </div>
            <div className="mt-2.5 flex items-center gap-2 text-sm font-semibold text-white">
                Dubai
                <span style={{ color: "#00C9A7" }}>→</span>
                Riyadh
            </div>
            <div className="mt-1 text-xs text-gray-500">ETA 18h 24m</div>
        </motion.div>
    );
}
