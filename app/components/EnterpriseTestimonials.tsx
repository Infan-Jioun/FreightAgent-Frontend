"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Building2, 
  Quote, 
  Award, 
  TrendingDown, 
  ShieldCheck, 
  Clock, 
  ArrowUpRight,
  BadgeCheck
} from "lucide-react";
import { CONTAINER_CLASS } from "./ContainsLayout";

interface CaseStudy {
  id: string;
  industry: string;
  companyName: string;
  location: string;
  primaryMetric: string;
  metricLabel: string;
  secondaryMetric: string;
  secondaryLabel: string;
  quote: string;
  author: string;
  role: string;
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "tech",
    industry: "Semiconductors & Electronics",
    companyName: "Apex Microelectronics",
    location: "Hsinchu & Austin, TX",
    primaryMetric: "-42%",
    metricLabel: "Demurrage & Storage Fees",
    secondaryMetric: "18,400+ TEU",
    secondaryLabel: "Zero Customs Dwell Holds",
    quote: "FreightAgent's automated HS classification and satellite cold-chain tracking saved our semiconductor supply chain from debilitating port backlogs. It's the most dependable freight platform we've deployed.",
    author: "Elena Rostova",
    role: "VP of Global Supply Chain Operations",
  },
  {
    id: "auto",
    industry: "Automotive & Clean Energy",
    companyName: "Volta Electric Mobility",
    location: "Munich & Fremont, CA",
    primaryMetric: "3.5 Days",
    metricLabel: "Faster Trans-Pacific Transit",
    secondaryMetric: "99.8%",
    secondaryLabel: "Just-In-Time Assembly Precision",
    quote: "With lithium battery shipments, any temperature anomaly or compliance error halts production lines. FreightAgent gives our engineering and logistics teams minute-by-minute autonomous visibility.",
    author: "Dr. Marcus Vance",
    role: "Chief Logistics Officer",
  },
  {
    id: "pharma",
    industry: "Biotech & Healthcare",
    companyName: "BioSphere Pharmaceuticals",
    location: "Basel & Cambridge, MA",
    primaryMetric: "100%",
    metricLabel: "Temperature Integrity Retained",
    secondaryMetric: "4,200+",
    secondaryLabel: "Cryo Consignments Flawlessly Delivered",
    quote: "Shipping temperature-sensitive biologics across multiple oceanic and air links used to require four different brokers. With FreightAgent, one single digital bill of lading guarantees cold-chain compliance.",
    author: "Sarah Al-Mansoor",
    role: "Director of Cold-Chain Distribution",
  },
  {
    id: "retail",
    industry: "Omnichannel Retail",
    companyName: "Nordic Consumer Goods",
    location: "Stockholm & Chicago",
    primaryMetric: "$3.4M",
    metricLabel: "Annual Freight Spend Saved",
    secondaryMetric: "48 Corridors",
    secondaryLabel: "Dynamically Optimized Live",
    quote: "Spot market freight volatility used to eat our margins. FreightAgent's automated booking engine locks in carrier capacity weeks in advance while dynamically routing around congested maritime canals.",
    author: "Henrik Lindqvist",
    role: "Global Head of Inbound Freight",
  },
];

const ACCREDITATIONS = [
  { name: "C-TPAT Tier III", desc: "Customs-Trade Partnership Against Terrorism" },
  { name: "AEO Certified", desc: "EU Authorized Economic Operator" },
  { name: "IATA Cargo Agent", desc: "International Air Transport Association" },
  { name: "FIATA Accredited", desc: "International Freight Forwarders Federation" },
  { name: "ISO 9001:2015", desc: "Certified Global Quality Management" },
];

export function EnterpriseTestimonials() {
  const [activeTab, setActiveTab] = useState<string>("tech");
  const currentStudy = CASE_STUDIES.find((s) => s.id === activeTab) || CASE_STUDIES[0];

  return (
    <section 
      id="enterprise-case-studies"
      className="relative py-16 md:py-24 border-b border-[#1a4a4a]/40 bg-[#071010]"
    >
      <div className={CONTAINER_CLASS}>
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00c9a7]/30 bg-[#00c9a7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00c9a7] mb-3">
            <Award className="h-3.5 w-3.5" />
            Proven Global Impact
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#e0faf5] mb-4">
            Trusted by enterprises.
            <br />
            <span className="bg-linear-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8] bg-clip-text text-transparent">
              Validated by metrics.
            </span>
          </h2>
          <p className="text-base text-[#7ecfc4] leading-relaxed">
            See how Fortune 500 shippers and high-growth industrial manufacturers rely on FreightAgent to cut costs, eradicate dwell times, and secure carrier capacity.
          </p>
        </div>

        {/* Industry Filter Pills */}
        <div className="flex flex-wrap gap-2.5 mb-8">
          {CASE_STUDIES.map((study) => {
            const isSelected = activeTab === study.id;
            return (
              <button
                key={study.id}
                type="button"
                onClick={() => setActiveTab(study.id)}
                className={`rounded-xl px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all outline-hidden ${
                  isSelected
                    ? "bg-[#00c9a7] text-[#0a0f0f] shadow-[0_0_16px_rgba(0,201,167,0.35)]"
                    : "border border-[#1a4a4a] bg-[#0d1f1f]/80 text-[#7ecfc4] hover:bg-[#112a2a] hover:text-[#e0faf5]"
                }`}
              >
                {study.industry}
              </button>
            );
          })}
        </div>

        {/* Spotlight Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="rounded-2xl border border-[#1a4a4a] bg-linear-to-b from-[#0d1f1f] to-[#081515] p-6 sm:p-10 mb-12 shadow-[0_0_40px_rgba(0,200,180,0.06)]"
          >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Left 7 Cols: Quote & Company */}
              <div className="lg:col-span-7">
                <div className="flex items-center gap-2 text-xs font-mono text-[#00c9a7] mb-4">
                  <Building2 className="h-4 w-4" />
                  <span>{currentStudy.companyName}</span>
                  <span className="text-[#3a6b66]">({currentStudy.location})</span>
                </div>

                <div className="relative mb-6">
                  <Quote className="h-8 w-8 text-[#00c9a7]/30 mb-2" />
                  <blockquote className="text-base sm:text-xl font-medium text-[#e0faf5] leading-relaxed italic">
                    "{currentStudy.quote}"
                  </blockquote>
                </div>

                <div>
                  <div className="text-sm font-bold text-[#e0faf5]">
                    {currentStudy.author}
                  </div>
                  <div className="text-xs text-[#7ecfc4]">
                    {currentStudy.role}
                  </div>
                </div>
              </div>

              {/* Right 5 Cols: Verifiable ROI Metrics */}
              <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <div className="rounded-xl border border-[#00c9a7]/40 bg-[#0a1a1a]/90 p-5 shadow-inner">
                  <div className="flex items-center justify-between text-xs text-[#3a6b66] mb-1">
                    <span className="uppercase font-mono tracking-wider">Primary ROI Metric</span>
                    <TrendingDown className="h-4 w-4 text-[#00e5c0]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#00e5c0] font-mono mb-1">
                    {currentStudy.primaryMetric}
                  </div>
                  <div className="text-xs font-semibold text-[#e0faf5]">
                    {currentStudy.metricLabel}
                  </div>
                </div>

                <div className="rounded-xl border border-[#1a4a4a] bg-[#0a1a1a]/90 p-5 shadow-inner">
                  <div className="flex items-center justify-between text-xs text-[#3a6b66] mb-1">
                    <span className="uppercase font-mono tracking-wider">Operational Scale</span>
                    <ShieldCheck className="h-4 w-4 text-[#00b4d8]" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-extrabold text-[#00b4d8] font-mono mb-1">
                    {currentStudy.secondaryMetric}
                  </div>
                  <div className="text-xs font-semibold text-[#e0faf5]">
                    {currentStudy.secondaryLabel}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Enterprise Accreditations & Certifications Bar */}
        <div className="rounded-xl border border-[#1a4a4a]/70 bg-[#081212] p-5">
          <div className="text-center text-xs uppercase font-mono tracking-widest text-[#3a6b66] mb-4">
            Security, Quality & Customs Regulatory Compliance Accreditations
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {ACCREDITATIONS.map((acc) => (
              <div
                key={acc.name}
                className="flex items-center gap-2 rounded-lg border border-[#1a4a4a]/50 bg-[#0d1f1f]/50 p-2.5"
              >
                <BadgeCheck className="h-4 w-4 shrink-0 text-[#00c9a7]" />
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#e0faf5] truncate">
                    {acc.name}
                  </div>
                  <div className="text-[10px] text-[#3a6b66] truncate" title={acc.desc}>
                    {acc.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
