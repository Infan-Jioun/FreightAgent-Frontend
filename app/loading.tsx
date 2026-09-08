"use client";

import { motion } from "framer-motion";
import { Anchor, Radio } from "lucide-react";

export default function RootLoading() {
  return (
    <div
      className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#070b0b] text-[#e0faf5] select-none"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, #0d2525 0%, #081515 55%, #050a0a 100%)",
      }}
    >
      {/* Precision grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#00c9a7 1px, transparent 1px), linear-gradient(90deg, #00c9a7 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Atmospheric center glow */}
      <div className="absolute w-72 h-72 rounded-full bg-[#00c9a7]/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center gap-6">
        {/* Animated Radar Crest */}
        <div className="relative w-28 h-28 flex items-center justify-center">
          {/* Outermost pulsing ring */}
          <motion.div
            className="absolute inset-0 rounded-full border border-[#00c9a7]/20"
            animate={{ scale: [1, 1.35, 1], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
          />

          {/* Middle dashed rotating orbit */}
          <motion.div
            className="absolute inset-2 rounded-full border border-dashed border-[#00c9a7]/40"
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          />

          {/* Inner counter-rotating ring with beacon dot */}
          <motion.div
            className="absolute inset-5 rounded-full border border-[#00b4d8]/40"
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#00e5c0] shadow-[0_0_8px_#00e5c0]" />
          </motion.div>

          {/* Core Brand Anchor Emblem */}
          <motion.div
            className="relative w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg shadow-[#00c9a7]/30"
            style={{ background: "linear-gradient(135deg, #00c9a7, #00b4d8)" }}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          >
            <Anchor size={22} className="text-[#0a0f0f]" strokeWidth={2.4} />
          </motion.div>
        </div>

        {/* Brand Title & Live Status */}
        <div className="flex flex-col items-center text-center space-y-1.5">
          <span className="text-base font-black tracking-tight text-[#e0faf5]">
            Freight<span className="text-[#00c9a7]">Agent</span>
          </span>

          <div className="flex items-center gap-2 text-xs font-mono text-[#7ecfc4]/90">
            <Radio size={13} className="text-[#00c9a7] animate-pulse" />
            <motion.span
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              SYNCHRONIZING GLOBAL TELEMETRY...
            </motion.span>
          </div>
        </div>

        {/* Sleek Loading Bar */}
        <div className="w-56 h-1 rounded-full bg-[#0d1f1f] border border-[#1a4a4a] overflow-hidden relative">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8]"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>
      </div>
    </div>
  );
}