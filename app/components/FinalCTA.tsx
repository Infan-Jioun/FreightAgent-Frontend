"use client";

import Link from "next/link";
import { ArrowRight, Anchor, Sparkles } from "lucide-react";
import { ROUTES } from "@/app/constants/routes";

export function FinalCTA() {
  return (
    <section className="relative py-16 md:py-20 overflow-hidden bg-[#070b0b] border-t border-[#1a4a4a]/60">
      {/* Precision grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#00c9a7 1px, transparent 1px), linear-gradient(90deg, #00c9a7 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      {/* Atmospheric center radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-gradient-to-r from-[#00c9a7]/15 via-[#00e5c0]/10 to-[#00b4d8]/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center px-4 sm:px-6 max-w-2xl mx-auto space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00c9a7]/10 text-[#00e5c0] border border-[#00c9a7]/30 text-xs font-semibold">
          <Sparkles size={14} className="text-[#00c9a7]" />
          <span>Next-Gen Autonomous Dispatch</span>
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-[#e0faf5] leading-tight">
          Ready to orchestrate{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8]">
            global freight?
          </span>
        </h2>

        <p className="text-xs sm:text-sm text-[#7ecfc4]/90 max-w-lg mx-auto leading-relaxed">
          Unify every maritime container, air express cargo charter, and cross-border trucking drayage in one single command dashboard.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href={ROUTES.REGISTER}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00c9a7]/25 hover:opacity-95 transition-all hover:scale-105"
          >
            <span>Start Shipping Now</span>
            <ArrowRight size={14} />
          </Link>
          <Link
            href={ROUTES.QUOTE}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl border border-[#1a4a4a] bg-[#0d1f1f] text-[#7ecfc4] hover:text-[#e0faf5] hover:border-[#00c9a7] font-semibold text-xs sm:text-sm transition-all"
          >
            Calculate Freight Rate
          </Link>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
