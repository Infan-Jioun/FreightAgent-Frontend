"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { 
  Activity, 
  Clock, 
  ShieldCheck, 
  Anchor, 
  ArrowUpRight, 
  Radio
} from "lucide-react";
import { CONTAINER_CLASS } from "./ContainsLayout";

interface MetricCardProps {
  icon: typeof Activity;
  title: string;
  value: string;
  subtext: string;
  badge: string;
  badgeType: "positive" | "info" | "success";
  index: number;
}

const METRICS: MetricCardProps[] = [
  {
    icon: Activity,
    title: "Active Monitored Freight",
    value: "148,920 TEU",
    subtext: "Live satellite & IoT telemetry in transit",
    badge: "+14.8% WoW",
    badgeType: "positive",
    index: 0,
  },
  {
    icon: ShieldCheck,
    title: "Global On-Time Arrival",
    value: "99.42%",
    subtext: "Compared to global carrier avg (79.2%)",
    badge: "Industry Best",
    badgeType: "success",
    index: 1,
  },
  {
    icon: Clock,
    title: "Avg Customs Automated Clearance",
    value: "4.2 Hours",
    subtext: "Autonomous HS code verification & filing",
    badge: "11x Faster",
    badgeType: "positive",
    index: 2,
  },
  {
    icon: Anchor,
    title: "Hubs & Free-Trade Corridors",
    value: "850+ Lanes",
    subtext: "Interconnected ocean, air, and rail terminals",
    badge: "128 Countries",
    badgeType: "info",
    index: 3,
  },
];

const PORT_STATUS = [
  { port: "Port of Chattogram", status: "Active Gateway", wait: "0.5d berth", flag: "🇧🇩", color: "#00e5c0" },
  { port: "Port of Singapore", status: "Optimal", wait: "0.4d wait", flag: "🇸🇬", color: "#00e5c0" },
  { port: "Port of Rotterdam", status: "Optimal", wait: "0.8d wait", flag: "🇳🇱", color: "#00e5c0" },
  { port: "Shanghai Yangshan", status: "Flowing", wait: "0.9d wait", flag: "🇨🇳", color: "#00c9a7" },
  { port: "Dubai Jebel Ali", status: "Optimal", wait: "0.3d wait", flag: "🇦🇪", color: "#00e5c0" },
  { port: "Los Angeles / LB", status: "Moderate", wait: "1.6d wait", flag: "🇺🇸", color: "#f59e0b" },
];

export function LiveOpsStatsTicker() {
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, margin: "-80px" });

  return (
    <section 
      aria-label="Real-time global logistics metrics"
      className="relative py-12 md:py-16 overflow-hidden border-y border-[#1a4a4a]/40 bg-[#070c0c]"
    >
      {/* Ambient background glow */}
      <div 
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 h-72 w-[550px] rounded-full bg-[#00c9a7]/10 blur-[100px]" 
      />

      <div ref={containerRef} className={CONTAINER_CLASS}>
        {/* Top Header Bar with Live Pulse */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00e5c0] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00c9a7]" />
            </span>
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-[#00c9a7] animate-pulse" />
              <span className="text-xs uppercase tracking-widest font-semibold text-[#7ecfc4]">
                Global Logistics Telemetry Network — Live Feed
              </span>
            </div>
          </div>
          <div className="text-xs text-[#3a6b66] font-mono">
            UPDATED: <span className="text-[#7ecfc4]">JUST NOW (UTC)</span>
          </div>
        </div>

        {/* 4 Interactive Live Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {METRICS.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: item.index * 0.1 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className="group relative rounded-xl border border-[#1a4a4a]/70 bg-[#0d1f1f]/80 p-5 backdrop-blur-sm transition-all hover:border-[#00c9a7]/60 hover:shadow-[0_0_24px_rgba(0,201,167,0.12)]"
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#1a4a4a] bg-[#0a1a1a] text-[#00c9a7] group-hover:border-[#00c9a7]/50 group-hover:text-[#00e5c0] transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                      item.badgeType === "positive"
                        ? "border-[#00c9a7]/40 bg-[#00c9a7]/10 text-[#00e5c0]"
                        : item.badgeType === "success"
                        ? "border-[#00b4d8]/40 bg-[#00b4d8]/10 text-[#00b4d8]"
                        : "border-[#7ecfc4]/30 bg-[#7ecfc4]/10 text-[#7ecfc4]"
                    }`}
                  >
                    <ArrowUpRight className="h-3 w-3" />
                    {item.badge}
                  </span>
                </div>

                <div className="text-2xl md:text-3xl font-bold tracking-tight text-[#e0faf5] mb-1 font-mono">
                  {item.value}
                </div>
                <div className="text-xs font-semibold text-[#7ecfc4] mb-1">
                  {item.title}
                </div>
                <div className="text-[11px] text-[#3a6b66] leading-relaxed">
                  {item.subtext}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Port Congestion Index Stream */}
        <div className="rounded-xl border border-[#1a4a4a]/60 bg-[#0a1515]/90 p-3.5 sm:p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3 text-xs">
            <span className="font-semibold text-[#7ecfc4] flex items-center gap-1.5 uppercase tracking-wider">
              <Anchor className="h-3.5 w-3.5 text-[#00c9a7]" />
              Major Hub Congestion & Berth Clearance Index
            </span>
            <span className="text-[11px] text-[#3a6b66]">
              Real-time AIS vessel queue & dwell time analysis
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {PORT_STATUS.map((p) => (
              <div
                key={p.port}
                className="flex flex-col rounded-lg border border-[#1a4a4a]/50 bg-[#0d1f1f]/60 p-2.5 transition-colors hover:border-[#1a4a4a]"
              >
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-sm">{p.flag}</span>
                  <span 
                    className="text-[10px] font-semibold px-1.5 py-0.2 rounded"
                    style={{ 
                      backgroundColor: `${p.color}15`, 
                      color: p.color,
                      border: `1px solid ${p.color}35`
                    }}
                  >
                    {p.status}
                  </span>
                </div>
                <div className="text-xs font-medium text-[#e0faf5] truncate" title={p.port}>
                  {p.port}
                </div>
                <div className="text-[10px] text-[#3a6b66] mt-0.5">
                  {p.wait}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
