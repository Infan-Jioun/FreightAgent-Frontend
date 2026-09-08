"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Wifi,
  Clock,
  Shield,
  MapPin,
  CheckCircle2,
  Users,
  Activity,
  Compass,
} from "lucide-react";
import { gsap } from "@/app/lib/gsap";

interface RadarNode {
  id: string;
  name: string;
  country: string;
  coords: { x: number; y: number };
  role: string;
  vhf: string;
  specialists: number;
  latency: string;
  status: "active" | "standby";
}

const RADAR_NODES: RadarNode[] = [
  {
    id: "rtm",
    name: "Rotterdam Ops Hub",
    country: "Netherlands",
    coords: { x: 48, y: 30 },
    role: "European Deep Sea Gateway",
    vhf: "Channel 16 / 12",
    specialists: 4,
    latency: "18 ms",
    status: "active",
  },
  {
    id: "sin",
    name: "Singapore Tower",
    country: "Singapore",
    coords: { x: 74, y: 64 },
    role: "Southeast Asia Control Tower",
    vhf: "Channel 14 / 68",
    specialists: 5,
    latency: "22 ms",
    status: "active",
  },
  {
    id: "dxb",
    name: "Dubai Command",
    country: "UAE",
    coords: { x: 58, y: 46 },
    role: "Middle East & Red Sea Desk",
    vhf: "Channel 11",
    specialists: 3,
    latency: "28 ms",
    status: "active",
  },
  {
    id: "cgp",
    name: "Chittagong Bay Desk",
    country: "Bangladesh",
    coords: { x: 67, y: 52 },
    role: "Bay of Bengal Port Hub",
    vhf: "Channel 12 / 16",
    specialists: 2,
    latency: "24 ms",
    status: "active",
  },
  {
    id: "nyc",
    name: "New York Terminal",
    country: "USA",
    coords: { x: 26, y: 36 },
    role: "Americas Logistics Desk",
    vhf: "Channel 13 / 16",
    specialists: 4,
    latency: "32 ms",
    status: "active",
  },
];

export default function DispatchRadarAnimation() {
  const [activeNode, setActiveNode] = useState<RadarNode>(RADAR_NODES[1]);
  const packetRef = useRef<HTMLSpanElement>(null);
  const responseRef = useRef<HTMLSpanElement>(null);

  // GSAP animation for telemetry packets
  useEffect(() => {
    const ctx = gsap.context(() => {
      const packetObj = { val: 800 };
      gsap.to(packetObj, {
        val: 1420,
        duration: 2.2,
        ease: "power2.out",
        onUpdate: () => {
          if (packetRef.current) {
            packetRef.current.textContent = Math.round(packetObj.val).toLocaleString();
          }
        },
      });
    });

    return () => ctx.revert();
  }, [activeNode]);

  return (
    <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] overflow-hidden shadow-2xl relative">
      {/* Precision grid backdrop */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(#00c9a7 1px, transparent 1px), linear-gradient(90deg, #00c9a7 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#00c9a7]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="p-4 sm:p-6 border-b border-[#1a4a4a]/70 flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00c9a7] animate-ping" />
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#00c9a7]">
              24/7 Live Operations Radar
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-black text-[#e0faf5] mt-1">
            Global Dispatch Command & Telemetry Network
          </h3>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#00c9a7]/40 text-[#00e5c0]">
            <Radio size={13} className="animate-pulse" />
            <span>14 Specialists Active</span>
          </div>
        </div>
      </div>

      {/* Radar Main Screen */}
      <div className="relative h-80 sm:h-96 w-full overflow-hidden bg-[#091515] select-none flex items-center justify-center">
        {/* Concentric Radar Circles */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[120px] h-[120px] rounded-full border border-[#00c9a7]/20" />
          <div className="w-[240px] h-[240px] rounded-full border border-[#00c9a7]/15" />
          <div className="w-[360px] h-[360px] rounded-full border border-[#00c9a7]/10" />
          <div className="w-[480px] h-[480px] rounded-full border border-[#00c9a7]/5" />
          {/* Crosshairs */}
          <div className="absolute w-full h-[1px] bg-[#00c9a7]/10" />
          <div className="absolute h-full w-[1px] bg-[#00c9a7]/10" />
        </div>

        {/* Rotating 360-degree Radar Sweep Beam */}
        <motion.div
          className="absolute w-[460px] h-[460px] rounded-full pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg, rgba(0, 201, 167, 0.35) 0deg, rgba(0, 229, 192, 0.1) 45deg, transparent 60deg, transparent 360deg)",
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 6.5, repeat: Infinity, ease: "linear" }}
        />

        {/* Radar Blip Nodes */}
        {RADAR_NODES.map((node) => {
          const isSelected = activeNode.id === node.id;
          return (
            <motion.div
              key={node.id}
              className="absolute z-20 cursor-pointer -translate-x-1/2 -translate-y-1/2 group"
              style={{ left: `${node.coords.x}%`, top: `${node.coords.y}%` }}
              onClick={() => setActiveNode(node)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative flex flex-col items-center">
                {/* Ping wave */}
                <span
                  className={`absolute -inset-2 rounded-full pointer-events-none ${
                    isSelected ? "bg-[#00c9a7]/40 animate-ping" : "group-hover:bg-[#00c9a7]/20"
                  }`}
                />

                {/* Blip Circle */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all ${
                    isSelected
                      ? "border-[#00e5c0] bg-[#00c9a7] shadow-lg shadow-[#00c9a7]/50 scale-110"
                      : "border-[#00c9a7]/70 bg-[#0d1f1f] hover:border-[#00c9a7]"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      isSelected ? "bg-[#0a0f0f]" : "bg-[#00c9a7]"
                    }`}
                  />
                </div>

                {/* Node Pill */}
                <div
                  className={`mt-1.5 px-2 py-0.5 rounded-lg text-center whitespace-nowrap transition-all text-[10px] font-mono ${
                    isSelected
                      ? "bg-[#00c9a7]/25 border border-[#00c9a7] text-[#e0faf5] font-bold shadow-md"
                      : "bg-[#0a0f0f]/80 border border-[#1a4a4a] text-[#7ecfc4]/70 group-hover:text-[#e0faf5]"
                  }`}
                >
                  {node.name.split(" ")[0]}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Node Telemetry Card & Stats */}
      <div className="p-4 sm:p-6 bg-[#0a1414] border-t border-[#1a4a4a]/80 grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <div className="md:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-[#00c9a7]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#e0faf5]">
                Selected Terminal: <span className="text-[#00e5c0]">{activeNode.name}</span>
              </span>
            </div>
            <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#00c9a7]/15 text-[#00c9a7] border border-[#00c9a7]/30">
              Online · {activeNode.country}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-bold text-[#e0faf5]">{activeNode.role}</p>
              <p className="text-[#7ecfc4]/80 text-[11px] mt-0.5">
                Marine VHF Monitoring: <strong className="text-[#00c9a7] font-mono">{activeNode.vhf}</strong>
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-[#3a6b66]">
              <span>Ping: <strong className="text-[#00b4d8]">{activeNode.latency}</strong></span>
              <span>Staff: <strong className="text-[#00e5c0]">{activeNode.specialists} Agents</strong></span>
            </div>
          </div>
        </div>

        {/* Live Counters */}
        <div className="p-4 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs text-[#3a6b66] font-mono">
              <span>PACKET TELEMETRY</span>
              <Wifi size={13} className="text-[#00c9a7]" />
            </div>
            <div className="text-2xl font-black font-mono text-[#e0faf5] mt-0.5">
              <span ref={packetRef}>0</span> <span className="text-xs font-sans text-[#00c9a7]">pkt/s</span>
            </div>
          </div>

          <div className="pt-2 border-t border-[#1a4a4a] flex items-center justify-between text-[11px] text-[#7ecfc4]">
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-[#00c9a7]" />
              Avg Response:
            </span>
            <strong className="text-[#00e5c0] font-mono">&lt; 4.2 mins</strong>
          </div>
        </div>
      </div>
    </div>
  );
}
