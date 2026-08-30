"use client";

import { motion } from "framer-motion";
import { Activity } from "lucide-react";

interface NetworkStatusCardProps {
    reducedMotion: boolean;
    className?: string;
}

export default function NetworkStatusCard({ reducedMotion, className = "" }: NetworkStatusCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={reducedMotion ? { opacity: 1, y: 0 } : { opacity: 1, y: [0, -5, 0] }}
            transition={
                reducedMotion
                    ? { duration: 0.5 }
                    : { y: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }, opacity: { duration: 0.6, delay: 0.2 } }
            }
            className={`flex items-center gap-3 rounded-2xl px-4 py-3 backdrop-blur-xl ${className}`}
            style={{
                background: "rgba(10, 15, 15, 0.55)",
                border: "1px solid rgba(255,255,255,0.08)",
                boxShadow: "0 20px 40px -20px rgba(0,0,0,0.6)",
            }}
        >
            <div className="rounded-lg p-1.5" style={{ background: "rgba(0,201,167,0.12)" }}>
                <Activity size={14} style={{ color: "#00C9A7" }} />
            </div>
            <div>
                <div className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">Network Status</div>
                <div className="text-xs font-medium text-white">99.9% · System Operational</div>
            </div>
        </motion.div>
    );
}
