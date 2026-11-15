"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FileCheck2, 
  Scan, 
  Cpu, 
  CheckCircle, 
  ShieldCheck, 
  Sparkles, 
  FileText, 
  Globe2,
  Lock
} from "lucide-react";
import { CONTAINER_CLASS } from "./ContainsLayout";

interface SampleDocument {
  id: string;
  category: string;
  commodity: string;
  originCountry: string;
  destCountry: string;
  hsCode: string;
  dutyRate: string;
  ftaBenefit: string;
  auditPass: boolean;
  clearanceTime: string;
}

const SAMPLE_DOCS: SampleDocument[] = [
  {
    id: "electronics",
    category: "Semiconductors & Electronics",
    commodity: "Integrated Circuit Wafer Modules (Lithography Class 3)",
    originCountry: "Taiwan (TPE)",
    destCountry: "United States (LAX)",
    hsCode: "HS 8542.31.0000",
    dutyRate: "0.0% (ITA Agreement Duty-Free)",
    ftaBenefit: "Information Technology Agreement (ITA)",
    auditPass: true,
    clearanceTime: "18 Minutes Autonomous Clearance",
  },
  {
    id: "automotive",
    category: "Automotive EV Components",
    commodity: "Lithium-Ion Battery Cell Packs (UN 3480 Class 9)",
    originCountry: "South Korea (ICN)",
    destCountry: "Germany (HAM)",
    hsCode: "HS 8507.60.0000",
    dutyRate: "2.7% (Preferential FTA Applied)",
    ftaBenefit: "EU-Korea Free Trade Agreement Verified",
    auditPass: true,
    clearanceTime: "34 Minutes Autonomous Clearance",
  },
  {
    id: "pharma",
    category: "Biopharma & Medical",
    commodity: "Vaccine Adjuvants & Cryogenic Biological Samples",
    originCountry: "Switzerland (ZRH)",
    destCountry: "Singapore (SIN)",
    hsCode: "HS 3002.20.0000",
    dutyRate: "0.0% (Singapore Free Port)",
    ftaBenefit: "EFTA-Singapore FTA Pre-Cleared",
    auditPass: true,
    clearanceTime: "12 Minutes Express Green Lane",
  },
];

const CUSTOMS_STEPS = [
  {
    step: "01",
    title: "Document Ingestion & OCR",
    desc: "Ingests bills of lading, commercial invoices, and dangerous goods declarations across 40+ languages with zero manual data entry.",
    icon: FileText,
  },
  {
    step: "02",
    title: "AI HS Code Classification",
    desc: "Matches cargo descriptions to 6-to-10 digit global tariff schedules with 99.8% machine learning accuracy, eliminating misclassification fines.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Tariff & FTA Optimization",
    desc: "Cross-references rules of origin across 300+ free trade treaties to legally minimize customs duty and value-added tax payments.",
    icon: Globe2,
  },
  {
    step: "04",
    title: "Direct EDI Border Handoff",
    desc: "Direct integration with US CBP ACE, European ATLAS/CDS, and Asian single-window customs networks for instant green-lane release.",
    icon: CheckCircle,
  },
];

export function BorderCustomsAutomation() {
  const [selectedDocId, setSelectedDocId] = useState<string>("electronics");
  const activeDoc = SAMPLE_DOCS.find((d) => d.id === selectedDocId) || SAMPLE_DOCS[0];

  return (
    <section 
      id="customs-automation"
      className="relative py-16 md:py-24 border-b border-[#1a4a4a]/40 bg-[#0a0f0f]"
    >
      <div className={CONTAINER_CLASS}>
        {/* Section Header */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00c9a7]/30 bg-[#00c9a7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00c9a7] mb-3">
            <ShieldCheck className="h-3.5 w-3.5" />
            Zero-Friction Global Trade
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#e0faf5] mb-4">
            Autonomous customs.
            <br />
            <span className="bg-linear-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8] bg-clip-text text-transparent">
              Cleared before arrival.
            </span>
          </h2>
          <p className="text-base text-[#7ecfc4] leading-relaxed">
            Eliminate demurrage penalties and port holds. Our AI engine verifies commodity codes, calculates accurate duties, and files EDI customs submissions while your cargo is mid-ocean.
          </p>
        </div>

        {/* 4-Step Process Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {CUSTOMS_STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="rounded-xl border border-[#1a4a4a] bg-[#0d1f1f]/70 p-5 transition-all hover:border-[#00c9a7]/50 hover:bg-[#102727]"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#1a4a4a] bg-[#0a1a1a] text-[#00c9a7]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="font-mono text-xs font-bold text-[#3a6b66]">
                    STEP {s.step}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#e0faf5] mb-2">
                  {s.title}
                </h3>
                <p className="text-xs text-[#7ecfc4] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Interactive Simulated Customs Inspection Deck */}
        <div className="rounded-2xl border border-[#1a4a4a] bg-linear-to-b from-[#0d1f1f] to-[#071313] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,200,180,0.06)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-[#1a4a4a]">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Scan className="h-4 w-4 text-[#00c9a7]" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-[#e0faf5]">
                  Live AI Customs Scanner Simulation
                </span>
              </div>
              <p className="text-xs text-[#3a6b66]">
                Select a consignment below to preview real-time automated tariff determination
              </p>
            </div>

            {/* Document Selector Pills */}
            <div className="flex flex-wrap gap-2">
              {SAMPLE_DOCS.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                return (
                  <button
                    key={doc.id}
                    type="button"
                    onClick={() => setSelectedDocId(doc.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all outline-hidden ${
                      isSelected
                        ? "bg-[#00c9a7] text-[#0a0f0f] font-bold shadow-[0_0_12px_rgba(0,201,167,0.3)]"
                        : "bg-[#0a1a1a] text-[#7ecfc4] border border-[#1a4a4a] hover:bg-[#112a2a]"
                    }`}
                  >
                    {doc.category.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Inspection View Deck */}
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedDocId}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center"
            >
              {/* Document Specs Left - 7 Cols */}
              <div className="md:col-span-7 space-y-4">
                <div className="rounded-xl border border-[#1a4a4a]/70 bg-[#091515] p-4">
                  <div className="text-[10px] font-mono uppercase text-[#3a6b66] mb-1">
                    Commodity Manifest Description
                  </div>
                  <div className="text-sm font-semibold text-[#e0faf5]">
                    {activeDoc.commodity}
                  </div>
                  <div className="text-xs text-[#7ecfc4] mt-1 font-mono">
                    Routing: {activeDoc.originCountry} ➔ {activeDoc.destCountry}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-[#1a4a4a]/70 bg-[#091515] p-3.5">
                    <span className="text-[10px] font-mono text-[#3a6b66] block mb-1">
                      CLASSIFIED HS CODE
                    </span>
                    <span className="text-sm font-bold font-mono text-[#00e5c0]">
                      {activeDoc.hsCode}
                    </span>
                  </div>

                  <div className="rounded-xl border border-[#1a4a4a]/70 bg-[#091515] p-3.5">
                    <span className="text-[10px] font-mono text-[#3a6b66] block mb-1">
                      DUTY TARIFF APPLIED
                    </span>
                    <span className="text-sm font-bold font-mono text-[#e0faf5]">
                      {activeDoc.dutyRate}
                    </span>
                  </div>
                </div>

                <div className="rounded-xl border border-[#00c9a7]/30 bg-[#00c9a7]/5 p-3.5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#00c9a7]" />
                    <span className="text-xs text-[#7ecfc4]">
                      {activeDoc.ftaBenefit}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#00e5c0]">
                    OPTIMIZED
                  </span>
                </div>
              </div>

              {/* Verified Badge Right - 5 Cols */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-xl border border-[#00c9a7]/40 bg-[#061515] relative overflow-hidden text-center">
                <div 
                  aria-hidden="true" 
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,201,167,0.15),transparent_70%)]" 
                />

                <div className="h-14 w-14 rounded-full border border-[#00c9a7] bg-[#00c9a7]/20 flex items-center justify-center text-[#00e5c0] mb-3 shadow-[0_0_20px_rgba(0,201,167,0.4)]">
                  <FileCheck2 className="h-7 w-7" />
                </div>

                <div className="text-xs uppercase font-mono tracking-widest text-[#00c9a7] font-semibold mb-1">
                  PRE-ARRIVAL GREEN PASS ISSUED
                </div>
                <div className="text-lg font-bold text-[#e0faf5] mb-2 font-mono">
                  {activeDoc.clearanceTime}
                </div>
                <div className="text-[11px] text-[#7ecfc4] max-w-xs mb-4">
                  Direct clearance confirmation received from border authority. No demurrage risk.
                </div>

                <div className="inline-flex items-center gap-1.5 text-[10px] font-mono text-[#3a6b66] border border-[#1a4a4a] px-2.5 py-1 rounded bg-[#0a1a1a]">
                  <Lock className="h-3 w-3 text-[#00c9a7]" />
                  <span>CBP ACE / ATLAS EDI TRANSMISSION VERIFIED</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
