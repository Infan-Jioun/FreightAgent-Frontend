"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Warehouse, Anchor, Ship, Truck, CheckCircle2, Navigation, Activity } from "lucide-react";
import { CONTAINER_CLASS } from "./ContainsLayout";

const STOPS = [
  { id: "wh", label: "Origin Warehouse", location: "Shenzhen Hub", status: "Loaded & Manifested", icon: Warehouse },
  { id: "origin", label: "Departure Port", location: "Yantian Terminal", status: "Customs Cleared", icon: Anchor },
  { id: "vessel", label: "Ocean Transit", location: "Malacca Strait", status: "Underway • 22.4 knots", icon: Ship },
  { id: "dest", label: "Arrival Port", location: "Port of Rotterdam", status: "Berth Reserved", icon: Anchor },
  { id: "delivery", label: "Inland Drayage", location: "Duisburg Depot", status: "Scheduled Dispatch", icon: Truck },
];

export function LogisticsInfrastructure() {
  const [activeStop, setActiveStop] = useState(2);

  return (
    <section className="relative py-12 md:py-16 overflow-hidden bg-[#070b0b] border-y border-[#1a4a4a]/50">
      {/* Precision grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#00c9a7 1px, transparent 1px), linear-gradient(90deg, #00c9a7 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#00c9a7]/5 rounded-full blur-3xl pointer-events-none" />

      <div className={`relative z-10 ${CONTAINER_CLASS} space-y-8`}>
        <div className="text-center space-y-2">
          <p className="text-xs tracking-widest uppercase font-mono font-bold text-[#00c9a7]">
            Logistics Infrastructure
          </p>
          <h2 className="text-2xl sm:text-4xl font-black text-[#e0faf5] tracking-tight">
            Every movement. One intelligent pipeline.
          </h2>
          <p className="text-xs sm:text-sm text-[#7ecfc4]/80 max-w-xl mx-auto">
            Interactive multi-modal relay connecting source manufacturing directly to inland distribution hubs.
          </p>
        </div>

        {/* Interactive Waypoint Ribbon */}
        <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] space-y-6 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {STOPS.map((stop, idx) => {
              const IconComp = stop.icon;
              const isSelected = activeStop === idx;
              const isPast = idx < activeStop;

              return (
                <button
                  key={stop.id}
                  onClick={() => setActiveStop(idx)}
                  className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? "bg-[#00c9a7]/15 border-[#00c9a7] shadow-lg shadow-[#00c9a7]/20"
                      : isPast
                      ? "bg-[#0a1a1a] border-[#00c9a7]/30 text-[#7ecfc4]"
                      : "bg-[#0a1a1a]/60 border-[#1a4a4a]/60 text-[#3a6b66] hover:border-[#00c9a7]/40"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isSelected
                          ? "bg-[#00c9a7] text-[#0a0f0f]"
                          : isPast
                          ? "bg-[#112a2a] text-[#00c9a7]"
                          : "bg-[#0f1717] text-[#3a6b66]"
                      }`}
                    >
                      <IconComp size={15} />
                    </div>
                    <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                  </div>

                  <div className="text-xs font-bold text-[#e0faf5] truncate">{stop.label}</div>
                  <div className="text-[10px] text-[#7ecfc4]/70 truncate mt-0.5">{stop.location}</div>
                </button>
              );
            })}
          </div>

          {/* Active Detail Display */}
          <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00b4d8]/15 border border-[#00b4d8]/30 flex items-center justify-center text-[#00b4d8]">
                <Activity size={18} />
              </div>
              <div>
                <span className="text-[10px] text-[#3a6b66] uppercase tracking-wider font-bold block">
                  Active Milestone Telemetry
                </span>
                <span className="text-xs sm:text-sm font-bold text-[#e0faf5]">
                  {STOPS[activeStop].label} — {STOPS[activeStop].location}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c0] animate-ping" />
                {STOPS[activeStop].status}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default LogisticsInfrastructure;
