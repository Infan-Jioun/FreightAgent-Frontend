"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Ship,
  Plane,
  Anchor,
  Navigation,
  Compass,
  Radio,
  Clock,
  ShieldCheck,
  Activity,
  Wind,
  Layers,
} from "lucide-react";
import { gsap } from "@/app/lib/gsap";

interface Waypoint {
  id: string;
  name: string;
  sub: string;
  pos: { x: number; y: number };
  status: "completed" | "current" | "upcoming";
  details: string;
  telemetry: {
    eta: string;
    speed: string;
    weather: string;
    distanceRemaining: string;
  };
}

const MARITIME_WAYPOINTS: Waypoint[] = [
  {
    id: "wh",
    name: "Shenzhen Hub",
    sub: "Yantian Deepwater",
    pos: { x: 12, y: 65 },
    status: "completed",
    details: "Container manifest verified, automated customs gate-in clearance complete.",
    telemetry: {
      eta: "Departed 4d ago",
      speed: "0.0 kn",
      weather: "Clear, 28°C",
      distanceRemaining: "8,920 NM",
    },
  },
  {
    id: "sg",
    name: "Singapore Strait",
    sub: "PSA Transshipment",
    pos: { x: 38, y: 72 },
    status: "completed",
    details: "Bunkering completed, pilot dispatch verified through Malacca maritime corridor.",
    telemetry: {
      eta: "Cleared Yesterday",
      speed: "21.4 kn",
      weather: "Fair, Wind 12 kn",
      distanceRemaining: "6,240 NM",
    },
  },
  {
    id: "suez",
    name: "Suez Canal",
    sub: "Port Said Convoy",
    pos: { x: 65, y: 38 },
    status: "current",
    details: "Active northbound convoy slot #4. AI lane speed optimized for zero-congestion arrival.",
    telemetry: {
      eta: "In Transit Now",
      speed: "22.8 kn",
      weather: "Calm, Wind 8 kn",
      distanceRemaining: "3,110 NM",
    },
  },
  {
    id: "rtm",
    name: "Port of Rotterdam",
    sub: "Maasvlakte 2 Terminal",
    pos: { x: 88, y: 24 },
    status: "upcoming",
    details: "Berth reservation confirmed at automated quay crane berth 4A.",
    telemetry: {
      eta: "4d 14h Remaining",
      speed: "Scheduled 19.5 kn",
      weather: "Overcast, 17°C",
      distanceRemaining: "Final Destination",
    },
  },
];

export default function ShipmentCorridorAnimation() {
  const [selectedWaypoint, setSelectedWaypoint] = useState<Waypoint>(MARITIME_WAYPOINTS[2]);
  const [activeMode, setActiveMode] = useState<"maritime" | "air">("maritime");
  const nmCounterRef = useRef<HTMLSpanElement>(null);
  const teuCounterRef = useRef<HTMLSpanElement>(null);

  // GSAP animated odometer for numbers
  useEffect(() => {
    const ctx = gsap.context(() => {
      const nmObj = { val: 0 };
      const teuObj = { val: 0 };

      gsap.to(nmObj, {
        val: 8450,
        duration: 2.2,
        ease: "power2.out",
        onUpdate: () => {
          if (nmCounterRef.current) {
            nmCounterRef.current.textContent = Math.round(nmObj.val).toLocaleString();
          }
        },
      });

      gsap.to(teuObj, {
        val: 18400,
        duration: 2.5,
        ease: "power2.out",
        onUpdate: () => {
          if (teuCounterRef.current) {
            teuCounterRef.current.textContent = Math.round(teuObj.val).toLocaleString();
          }
        },
      });
    });

    return () => ctx.revert();
  }, [activeMode]);

  return (
    <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] overflow-hidden shadow-2xl relative">
      {/* Background Precision Grid */}
      <div
        className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#00c9a7 1px, transparent 1px), linear-gradient(90deg, #00c9a7 1px, transparent 1px)",
          backgroundSize: "32px 32px",
        }}
      />
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#00c9a7]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Corridor Toolbar */}
      <div className="p-4 sm:p-6 border-b border-[#1a4a4a]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00c9a7] animate-pulse" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00c9a7]">
              Live Autonomous Shipping Corridor
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#e0faf5] mt-1">
            Asia – Europe Transcontinental Transit Simulation
          </h3>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1.5 p-1 bg-[#0a1a1a] rounded-xl border border-[#1a4a4a] w-fit">
          <button
            onClick={() => setActiveMode("maritime")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === "maritime"
                ? "bg-[#00c9a7] text-[#0a0f0f] shadow-md shadow-[#00c9a7]/20"
                : "text-[#7ecfc4] hover:text-[#e0faf5]"
            }`}
          >
            <Ship size={14} />
            <span>Ocean Liner (Ultra Large)</span>
          </button>
          <button
            onClick={() => setActiveMode("air")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeMode === "air"
                ? "bg-[#00c9a7] text-[#0a0f0f] shadow-md shadow-[#00c9a7]/20"
                : "text-[#7ecfc4] hover:text-[#e0faf5]"
            }`}
          >
            <Plane size={14} />
            <span>Air Cargo Charter</span>
          </button>
        </div>
      </div>

      {/* Main Animated Corridor Canvas */}
      <div className="relative h-72 sm:h-96 w-full overflow-hidden bg-[#091515] select-none">
        {/* Animated Radar Scanning Line */}
        <motion.div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(0,201,167,0.15) 50%, rgba(0,229,192,0.4) 100%)",
            width: "40%",
          }}
          animate={{ x: ["-100%", "300%"] }}
          transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
        />

        {/* SVG Route Trajectory */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox="0 0 1000 400"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="routeGradient" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#00c9a7" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#00e5c0" stopOpacity="1" />
              <stop offset="100%" stopColor="#00b4d8" stopOpacity="0.8" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Route Path */}
          <path
            d="M 120 280 C 260 300, 320 290, 420 270 C 520 250, 600 170, 660 140 C 740 100, 820 110, 880 90"
            fill="none"
            stroke="rgba(26, 74, 74, 0.6)"
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {/* Active Glowing Route Path */}
          <motion.path
            d="M 120 280 C 260 300, 320 290, 420 270 C 520 250, 600 170, 660 140 C 740 100, 820 110, 880 90"
            fill="none"
            stroke="url(#routeGradient)"
            strokeWidth="3.5"
            filter="url(#glow)"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: "easeInOut" }}
          />
        </svg>

        {/* Moving Carrier Marker (Ship or Plane) */}
        <motion.div
          className="absolute z-20"
          style={{ left: "62%", top: "35%" }}
          animate={{
            y: [-3, 3, -3],
            rotate: activeMode === "maritime" ? [-1, 1, -1] : [-2, 2, -2],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="relative">
            {/* Ping Wave */}
            <span className="absolute -inset-3 rounded-full bg-[#00c9a7]/30 animate-ping pointer-events-none" />
            
            {/* Vehicle Card Icon */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] shadow-lg shadow-[#00c9a7]/40 border border-white/20">
              {activeMode === "maritime" ? (
                <Ship size={16} className="animate-pulse" />
              ) : (
                <Plane size={16} className="animate-pulse" />
              )}
              <span className="text-[11px] font-black tracking-tight whitespace-nowrap font-mono">
                {activeMode === "maritime" ? "FA-EVERGOLDEN" : "FA-CARGO-777F"}
              </span>
            </div>

            {/* Vessel Speed Bubble */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-full bg-[#0a1a1a]/90 border border-[#00c9a7]/40 text-[9px] font-mono text-[#00e5c0] shadow-md">
              {activeMode === "maritime" ? "22.8 KN · IN ROUTE" : "485 KN · FL380"}
            </div>
          </div>
        </motion.div>

        {/* Interactive Waypoint Nodes */}
        {MARITIME_WAYPOINTS.map((wp, idx) => {
          const isSelected = selectedWaypoint.id === wp.id;
          return (
            <motion.div
              key={wp.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer group"
              style={{ left: `${wp.pos.x}%`, top: `${wp.pos.y}%` }}
              onClick={() => setSelectedWaypoint(wp)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative flex flex-col items-center">
                {/* Outer Ring */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                    isSelected
                      ? "border-[#00e5c0] bg-[#00c9a7]/25 shadow-lg shadow-[#00c9a7]/50 scale-110"
                      : wp.status === "completed"
                      ? "border-[#00c9a7] bg-[#0a1a1a]"
                      : wp.status === "current"
                      ? "border-[#00b4d8] bg-[#0a1a1a] animate-pulse"
                      : "border-[#1a4a4a] bg-[#0d1f1f]"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isSelected || wp.status === "current"
                        ? "bg-[#00e5c0]"
                        : wp.status === "completed"
                        ? "bg-[#00c9a7]"
                        : "bg-[#3a6b66]"
                    }`}
                  />
                </div>

                {/* Waypoint Label */}
                <div
                  className={`mt-2 px-2.5 py-1 rounded-xl text-center whitespace-nowrap transition-all ${
                    isSelected
                      ? "bg-[#00c9a7]/20 border border-[#00c9a7] text-[#e0faf5] shadow-md"
                      : "bg-[#0a0f0f]/80 border border-[#1a4a4a]/80 text-[#7ecfc4]/80 group-hover:text-[#e0faf5]"
                  }`}
                >
                  <p className="text-xs font-bold leading-tight">{wp.name}</p>
                  <p className="text-[9px] text-[#00c9a7] font-mono leading-tight">{wp.sub}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Waypoint Telemetry Drawer & Live Odometer Cards */}
      <div className="p-4 sm:p-6 bg-[#0a1414] border-t border-[#1a4a4a]/80 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Selected Hub Details */}
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass size={16} className="text-[#00c9a7]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#e0faf5]">
                Waypoint Telemetry: <span className="text-[#00e5c0]">{selectedWaypoint.name}</span>
              </span>
            </div>
            <span
              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${
                selectedWaypoint.status === "completed"
                  ? "bg-[#00c9a7]/15 text-[#00c9a7] border-[#00c9a7]/30"
                  : selectedWaypoint.status === "current"
                  ? "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/30 animate-pulse"
                  : "bg-[#112a2a] text-[#7ecfc4] border-[#1a4a4a]"
              }`}
            >
              {selectedWaypoint.status === "completed"
                ? "Cleared Waypoint"
                : selectedWaypoint.status === "current"
                ? "Current Active Segment"
                : "Scheduled Destination"}
            </span>
          </div>

          <p className="text-xs text-[#7ecfc4]/90 leading-relaxed bg-[#0d1f1f] p-3 rounded-xl border border-[#1a4a4a]">
            {selectedWaypoint.details}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
            <div className="p-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a]">
              <span className="text-[10px] text-[#3a6b66] block">TRANSIT STATUS</span>
              <span className="text-[#e0faf5] font-bold">{selectedWaypoint.telemetry.eta}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a]">
              <span className="text-[10px] text-[#3a6b66] block">CORRIDOR SPEED</span>
              <span className="text-[#00c9a7] font-bold">{selectedWaypoint.telemetry.speed}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a]">
              <span className="text-[10px] text-[#3a6b66] block">WEATHER RADAR</span>
              <span className="text-[#7ecfc4] font-bold">{selectedWaypoint.telemetry.weather}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a]">
              <span className="text-[10px] text-[#3a6b66] block">REMAINING DISTANCE</span>
              <span className="text-[#00b4d8] font-bold">{selectedWaypoint.telemetry.distanceRemaining}</span>
            </div>
          </div>
        </div>

        {/* Live Odometer Metrics */}
        <div className="p-4 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs text-[#3a6b66] font-mono">
              <span>DISTANCE LOGGED</span>
              <Activity size={13} className="text-[#00c9a7]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#e0faf5] mt-0.5">
              <span ref={nmCounterRef}>0</span> <span className="text-xs font-sans text-[#00c9a7]">NM</span>
            </div>
          </div>

          <div className="pt-3 border-t border-[#1a4a4a]">
            <div className="flex items-center justify-between text-xs text-[#3a6b66] font-mono">
              <span>CARGO CAPACITY</span>
              <Layers size={13} className="text-[#00b4d8]" />
            </div>
            <div className="text-2xl sm:text-3xl font-black font-mono text-[#e0faf5] mt-0.5">
              <span ref={teuCounterRef}>0</span> <span className="text-xs font-sans text-[#00b4d8]">TEU</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#7ecfc4] pt-1">
            <Radio size={13} className="text-[#00c9a7] animate-pulse flex-shrink-0" />
            <span className="truncate">AIS Satellite Telemetry Synced</span>
          </div>
        </div>
      </div>
    </div>
  );
}
