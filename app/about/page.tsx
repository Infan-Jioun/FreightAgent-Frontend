"use client";

import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import GsapPageWrapper from "@/components/ui/GsapPageWrapper";
import ShipmentCorridorAnimation from "./ShipmentCorridorAnimation";
import { CONTAINER_CLASS } from "@/app/components/ContainsLayout";
import {
  Anchor,
  Globe2,
  ShieldCheck,
  Cpu,
  TrendingUp,
  Award,
  ArrowRight,
  Compass,
  CheckCircle2,
  MapPin,
} from "lucide-react";
import { ROUTES } from "@/app/constants/routes";

const STATS = [
  { value: "140+", label: "Countries Served", detail: "Direct port & airport clearance" },
  { value: "2.5M+", label: "TEU Managed", detail: "Standardized container units" },
  { value: "99.4%", label: "On-Time Dispatch SLA", detail: "Powered by predictive telemetry" },
  { value: "$4.8B", label: "Cargo Value Secured", detail: "Insured with end-to-end audit trails" },
];

const PILLARS = [
  {
    icon: Cpu,
    title: "AI-First Route Optimization",
    desc: "Proprietary algorithms analyze weather radar, canal bottlenecks, and port congestion to recommend the most reliable freight routes in real time.",
  },
  {
    icon: Globe2,
    title: "Global Multi-Modal Network",
    desc: "Seamlessly interconnect ocean liner corridors, high-priority air express charters, and regional cross-border drayage under one digital manifest.",
  },
  {
    icon: ShieldCheck,
    title: "Regulatory & Customs Integrity",
    desc: "Pre-cleared documentation aligned with FIATA, IATA, and international customs authorities, slashing border inspection delays by up to 65%.",
  },
  {
    icon: TrendingUp,
    title: "Carbon-Aware Freight Intelligence",
    desc: "Calculate precise CO₂ footprint per metric ton-kilometer and choose low-emission intermodal routes without compromising delivery schedules.",
  },
];

const HUBS = [
  { city: "Rotterdam", role: "European Gateway Hub", coords: "Port of Rotterdam, NL" },
  { city: "Singapore", role: "Southeast Asia Transshipment", coords: "PSA Singapore Terminals" },
  { city: "Dubai", role: "Middle East & South Asia Corridor", coords: "Jebel Ali Free Zone, UAE" },
  { city: "New York", role: "Americas Logistics Terminal", coords: "Port of NY & NJ, USA" },
  { city: "Chittagong", role: "Bay of Bengal Deep Sea Hub", coords: "Chittagong Port Authority, BD" },
  { city: "Shanghai", role: "East Asia Manufacturing Hub", coords: "Yangshan Deepwater Port, CN" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f0f] text-[#e0faf5] overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <GsapPageWrapper className={`${CONTAINER_CLASS} space-y-16 sm:space-y-20`}>
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto pt-6 sm:pt-10 space-y-4">
            <div className="gsap-reveal inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#00c9a7]/10 text-[#00e5c0] border border-[#00c9a7]/30">
              <Compass size={14} className="text-[#00c9a7]" />
              <span>Architecting the Next Era of Logistics</span>
            </div>

            <h1 className="gsap-reveal text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              The Intelligent Operating System for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8]">
                Global Trade
              </span>
            </h1>

            <p className="gsap-reveal text-sm sm:text-base text-[#7ecfc4]/90 max-w-2xl mx-auto leading-relaxed">
              FreightAgent was founded on a simple principle: moving cargo across oceans, skies, and continents should be as transparent and instantaneous as digital data. We combine live telematics, vessel radar, and autonomous dispatching into a unified command platform.
            </p>

            <div className="gsap-reveal flex items-center justify-center gap-3 pt-2">
              <Link
                href={ROUTES.QUOTE}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#00c9a7]/20 hover:opacity-95 transition-all hover:scale-105"
              >
                <span>Calculate Freight Rate</span>
                <ArrowRight size={14} />
              </Link>
              <Link
                href={ROUTES.CONTACT}
                className="px-6 py-3 rounded-2xl border border-[#1a4a4a] bg-[#0d1f1f] text-[#7ecfc4] font-semibold text-xs sm:text-sm hover:border-[#00c9a7] hover:text-[#e0faf5] transition-all"
              >
                Contact Dispatch
              </Link>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="gsap-reveal grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="p-5 sm:p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] hover:border-[#00c9a7]/40 transition-all group"
              >
                <div className="text-2xl sm:text-4xl font-black text-[#e0faf5] group-hover:text-[#00e5c0] transition-colors font-mono">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-[#7ecfc4] mt-1">
                  {stat.label}
                </div>
                <div className="text-[11px] text-[#3a6b66] mt-1">
                  {stat.detail}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive Live Shipment Corridor Animation */}
          <div className="gsap-reveal">
            <ShipmentCorridorAnimation />
          </div>

          {/* Core Pillars */}
          <div className="space-y-8">
            <div className="text-center space-y-2 max-w-2xl mx-auto">
              <h2 className="gsap-reveal text-2xl sm:text-3xl font-black text-[#e0faf5]">
                Built for High-Stakes Freight Operations
              </h2>
              <p className="gsap-reveal text-xs sm:text-sm text-[#7ecfc4]/80">
                From bulk commodities to temperature-sensitive pharmaceuticals, our technology guarantees integrity across every leg of transit.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {PILLARS.map((pillar) => {
                const IconComp = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className="gsap-reveal p-6 sm:p-7 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] hover:border-[#00c9a7]/50 transition-all relative overflow-hidden group"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-[#00c9a7]/10 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0] mb-4 group-hover:scale-110 transition-transform">
                      <IconComp size={22} />
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-[#e0faf5] mb-2">
                      {pillar.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#7ecfc4]/80 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Global Operations Hubs */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0d1f1f] via-[#0d1f1f] to-[#112a2a] border border-[#1a4a4a] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="gsap-reveal text-xl font-bold text-[#e0faf5] flex items-center gap-2">
                  <Anchor size={20} className="text-[#00c9a7]" />
                  Strategic Global Command Centers
                </h3>
                <p className="gsap-reveal text-xs text-[#7ecfc4] mt-1">
                  On-ground operations staff stationed at the world&apos;s most critical maritime straits and aviation nodes.
                </p>
              </div>
              <div className="gsap-reveal flex items-center gap-2 text-xs font-mono text-[#00e5c0] bg-[#00c9a7]/10 px-3 py-1.5 rounded-xl border border-[#00c9a7]/30 w-fit">
                <span className="w-2 h-2 rounded-full bg-[#00e5c0] animate-ping" />
                24/7 Multi-Timezone Coverage
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {HUBS.map((hub) => (
                <div
                  key={hub.city}
                  className="gsap-reveal p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60 hover:border-[#00c9a7]/40 transition-colors flex items-start gap-3"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#00b4d8]/15 text-[#00b4d8] flex items-center justify-center flex-shrink-0 mt-0.5">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-[#e0faf5]">{hub.city}</h4>
                    <p className="text-xs text-[#00c9a7]">{hub.role}</p>
                    <p className="text-[11px] text-[#3a6b66] mt-0.5">{hub.coords}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accreditations & Certifications */}
          <div className="text-center space-y-4 pt-4">
            <h4 className="gsap-reveal text-xs uppercase tracking-widest font-bold text-[#3a6b66]">
              Accredited by Global Logistics & Maritime Authorities
            </h4>
            <div className="gsap-reveal flex flex-wrap items-center justify-center gap-3 sm:gap-6">
              {[
                "FIATA Licensed Forwarder",
                "IATA Cargo Agent Accredited",
                "ISO 9001:2015 Certified",
                "FMC Ocean Transportation Intermediary",
                "C-TPAT Security Validated",
              ].map((cert) => (
                <div
                  key={cert}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a] text-xs text-[#7ecfc4]"
                >
                  <CheckCircle2 size={13} className="text-[#00c9a7]" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        </GsapPageWrapper>
      </main>

      <Footer />
    </div>
  );
}
