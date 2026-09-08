"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import GsapPageWrapper from "@/components/ui/GsapPageWrapper";
import { CONTAINER_CLASS } from "@/app/components/ContainsLayout";
import { gsap } from "@/app/lib/gsap";
import {
  Calculator,
  Ship,
  Plane,
  Truck,
  ArrowRight,
  MapPin,
  Package,
  Calendar,
  ShieldCheck,
  Leaf,
  Clock,
  Sparkles,
  Info,
  Navigation,
  Activity,
} from "lucide-react";
import { ROUTES } from "@/app/constants/routes";
import { toast } from "sonner";

const PORTS = [
  { id: "SHA", name: "Shanghai (Port of Shanghai, CN)", country: "China", region: "East Asia" },
  { id: "RTM", name: "Rotterdam (Port of Rotterdam, NL)", country: "Netherlands", region: "Europe" },
  { id: "SIN", name: "Singapore (PSA Singapore, SG)", country: "Singapore", region: "Southeast Asia" },
  { id: "NYC", name: "New York / New Jersey (Port of NY & NJ, US)", country: "USA", region: "North America" },
  { id: "CGP", name: "Chittagong (Chittagong Port Authority, BD)", country: "Bangladesh", region: "South Asia" },
  { id: "DXB", name: "Dubai (Jebel Ali Port, AE)", country: "UAE", region: "Middle East" },
  { id: "HAM", name: "Hamburg (Port of Hamburg, DE)", country: "Germany", region: "Europe" },
  { id: "LAX", name: "Los Angeles (Port of LA, US)", country: "USA", region: "North America" },
];

const CONTAINER_TYPES = [
  { id: "20gp", label: "20' Standard GP", cbm: 33.2, maxWeight: "28,200 kg" },
  { id: "40gp", label: "40' Standard GP", cbm: 67.7, maxWeight: "28,800 kg" },
  { id: "40hc", label: "40' High Cube (HQ)", cbm: 76.3, maxWeight: "28,600 kg" },
  { id: "reefer", label: "40' Refrigerated Reefer", cbm: 67.0, maxWeight: "29,400 kg" },
];

export default function QuotePage() {
  const [mode, setMode] = useState<"ocean" | "air" | "ground">("ocean");
  const [origin, setOrigin] = useState("SHA");
  const [destination, setDestination] = useState("RTM");
  const [containerType, setContainerType] = useState("40hc");
  const [cargoWeight, setCargoWeight] = useState("18500");
  const [commodityType, setCommodityType] = useState("General Merchandise");
  const [needCustoms, setNeedCustoms] = useState(true);
  const [needInsurance, setNeedInsurance] = useState(true);

  // Dynamic estimate calculations
  const quoteEstimate = useMemo(() => {
    let baseRate = 2450;
    let days = "24 - 28 Days";
    let co2 = "1.85 tons";

    if (mode === "ocean") {
      baseRate = containerType === "20gp" ? 1850 : containerType === "40gp" ? 2750 : containerType === "40hc" ? 2950 : 3800;
      if ((origin === "SHA" && destination === "RTM") || (origin === "RTM" && destination === "SHA")) {
        days = "26 - 30 Days";
      } else if (origin === "CGP" || destination === "CGP") {
        days = "18 - 22 Days";
        baseRate = Math.round(baseRate * 0.88);
      } else {
        days = "14 - 20 Days";
      }
      co2 = "1.42 tons CO₂e";
    } else if (mode === "air") {
      const weightNum = parseFloat(cargoWeight) || 500;
      baseRate = Math.round(weightNum * 4.85);
      days = "3 - 5 Days";
      co2 = "8.65 tons CO₂e";
    } else {
      baseRate = 1450;
      days = "2 - 4 Days";
      co2 = "0.75 tons CO₂e";
    }

    const customsFee = needCustoms ? 185 : 0;
    const insuranceFee = needInsurance ? 120 : 0;
    const bunkerSurcharge = Math.round(baseRate * 0.12);
    const total = baseRate + customsFee + insuranceFee + bunkerSurcharge;

    return {
      baseRate,
      customsFee,
      insuranceFee,
      bunkerSurcharge,
      total,
      days,
      co2,
    };
  }, [mode, origin, destination, containerType, cargoWeight, needCustoms, needInsurance]);

  const priceRef = useRef<HTMLSpanElement>(null);

  // GSAP Counter for Total Rate
  useEffect(() => {
    if (!priceRef.current) return;
    const currentVal = parseInt(priceRef.current.textContent?.replace(/[^0-9]/g, "") || "0", 10);
    const obj = { val: currentVal || quoteEstimate.total };

    const tween = gsap.to(obj, {
      val: quoteEstimate.total,
      duration: 0.85,
      ease: "power2.out",
      onUpdate: () => {
        if (priceRef.current) {
          priceRef.current.textContent = Math.round(obj.val).toLocaleString();
        }
      },
    });

    return () => {
      tween.kill();
    };
  }, [quoteEstimate.total]);

  const handleBooking = () => {
    toast.success("Quote generated! Connecting with booking desk...");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f0f] text-[#e0faf5] overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <GsapPageWrapper className={`${CONTAINER_CLASS} space-y-12 sm:space-y-16`}>
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto pt-6 sm:pt-10 space-y-4">
            <div className="gsap-reveal inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#00c9a7]/10 text-[#00e5c0] border border-[#00c9a7]/30">
              <Calculator size={14} className="text-[#00c9a7]" />
              <span>Real-Time Spot Rates & Schedules</span>
            </div>

            <h1 className="gsap-reveal text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Instant Freight{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8]">
                Rate Calculator
              </span>
            </h1>

            <p className="gsap-reveal text-sm sm:text-base text-[#7ecfc4]/90 max-w-2xl mx-auto leading-relaxed">
              Calculate accurate spot market rates, estimated transit schedules, and carbon footprint across all maritime alliances and airline carriers in seconds.
            </p>
          </div>

          {/* Mode Tabs */}
          <div className="gsap-reveal flex items-center justify-center">
            <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a]">
              {[
                { id: "ocean", label: "Ocean Container", icon: Ship },
                { id: "air", label: "Air Cargo Express", icon: Plane },
                { id: "ground", label: "Ground Drayage", icon: Truck },
              ].map((m) => {
                const IconComp = m.icon;
                const isSelected = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setMode(m.id as any)}
                    className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      isSelected
                        ? "bg-[#00c9a7] text-[#0a0f0f] shadow-lg shadow-[#00c9a7]/20"
                        : "text-[#7ecfc4] hover:text-[#e0faf5]"
                    }`}
                  >
                    <IconComp size={16} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Calculator Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Inputs Form */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] space-y-6 shadow-xl">
              <h2 className="text-lg font-bold text-[#e0faf5] flex items-center gap-2">
                <MapPin size={18} className="text-[#00c9a7]" />
                Route & Cargo Specifications
              </h2>

              {/* Origin & Destination */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#7ecfc4] block">
                    Port of Origin (Departure)
                  </label>
                  <select
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-medium text-[#e0faf5] focus:outline-none focus:border-[#00c9a7]"
                  >
                    {PORTS.map((port) => (
                      <option key={port.id} value={port.id}>
                        {port.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#7ecfc4] block">
                    Port of Destination (Arrival)
                  </label>
                  <select
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-medium text-[#e0faf5] focus:outline-none focus:border-[#00c9a7]"
                  >
                    {PORTS.map((port) => (
                      <option key={port.id} value={port.id}>
                        {port.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Container or Cargo Weight selection */}
              {mode === "ocean" ? (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-[#7ecfc4] block">
                    Container Equipment Specification
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {CONTAINER_TYPES.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setContainerType(c.id)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          containerType === c.id
                            ? "border-[#00c9a7] bg-[#00c9a7]/10"
                            : "border-[#1a4a4a] bg-[#0a1a1a] hover:border-[#00c9a7]/40"
                        }`}
                      >
                        <div className="text-xs font-bold text-[#e0faf5]">{c.label}</div>
                        <div className="text-[10px] text-[#7ecfc4]/70 mt-0.5">
                          Vol: {c.cbm} CBM • Payload: {c.maxWeight}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#7ecfc4] block">
                    Estimated Gross Cargo Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={cargoWeight}
                    onChange={(e) => setCargoWeight(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-mono text-[#e0faf5] focus:outline-none focus:border-[#00c9a7]"
                    placeholder="Enter weight in kg (e.g. 1500)"
                  />
                </div>
              )}

              {/* Commodity & Value */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#7ecfc4] block">
                    Commodity Description
                  </label>
                  <select
                    value={commodityType}
                    onChange={(e) => setCommodityType(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-medium text-[#e0faf5] focus:outline-none focus:border-[#00c9a7]"
                  >
                    <option>General Merchandise / Consumer Goods</option>
                    <option>Textiles & Ready-Made Garments (RMG)</option>
                    <option>Industrial Machinery & Auto Parts</option>
                    <option>Consumer Electronics & Semiconductors</option>
                    <option>Pharmaceuticals & Medical Devices</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[#7ecfc4] block">
                    Ready to Load Date
                  </label>
                  <input
                    type="date"
                    defaultValue="2026-09-15"
                    className="w-full px-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7]"
                  />
                </div>
              </div>

              {/* Value Add Options */}
              <div className="pt-2 border-t border-[#1a4a4a]/50 space-y-3">
                <span className="text-xs font-bold text-[#e0faf5] block">
                  Additional Logistics Services
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] cursor-pointer hover:border-[#00c9a7]/40">
                    <input
                      type="checkbox"
                      checked={needCustoms}
                      onChange={(e) => setNeedCustoms(e.target.checked)}
                      className="accent-[#00c9a7] rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#e0faf5] block">
                        Customs Filing (+$185)
                      </span>
                      <span className="text-[10px] text-[#3a6b66]">
                        Automated HS clearance & duty filing
                      </span>
                    </div>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] cursor-pointer hover:border-[#00c9a7]/40">
                    <input
                      type="checkbox"
                      checked={needInsurance}
                      onChange={(e) => setNeedInsurance(e.target.checked)}
                      className="accent-[#00c9a7] rounded"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#e0faf5] block">
                        All-Risk Cargo Marine (+$120)
                      </span>
                      <span className="text-[10px] text-[#3a6b66]">
                        Full replacement value cover
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Live Quote Summary Card */}
            <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#0d1f1f] via-[#0d1f1f] to-[#112a2a] border border-[#00c9a7]/40 shadow-2xl relative overflow-hidden space-y-6">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#00c9a7]/10 rounded-full blur-3xl pointer-events-none" />

              <div className="flex items-center justify-between border-b border-[#1a4a4a] pb-4">
                <div>
                  <span className="text-[10px] font-mono text-[#00c9a7] uppercase tracking-wider font-bold block">
                    Instant Estimated Spot Rate
                  </span>
                  <h3 className="text-lg font-bold text-[#e0faf5]">Rate Summary</h3>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/40">
                  Spot Confirmed
                </span>
              </div>

              {/* Dynamic Animated Carrier Transit Route */}
              <div className="p-3.5 rounded-2xl bg-[#091515] border border-[#1a4a4a] space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between text-[11px] font-mono">
                  <div className="flex items-center gap-1.5 text-[#00c9a7] font-bold">
                    <span className="w-2 h-2 rounded-full bg-[#00c9a7] animate-ping" />
                    <span>{origin}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[#7ecfc4]/70">
                    <span className="text-[10px] uppercase font-bold text-[#00b4d8] px-2 py-0.5 rounded bg-[#00b4d8]/10 border border-[#00b4d8]/30">
                      {mode} Corridor
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-[#00e5c0] font-bold">
                    <span>{destination}</span>
                    <span className="w-2 h-2 rounded-full bg-[#00e5c0]" />
                  </div>
                </div>

                {/* Animated Track Line with Carrier Icon */}
                <div className="relative h-9 flex items-center">
                  <div className="absolute left-0 right-0 h-[2px] bg-[#1a4a4a] border-t border-dashed border-[#00c9a7]/40" />

                  {/* Traveling Carrier Motion */}
                  <motion.div
                    className="absolute z-10 flex items-center justify-center p-1.5 rounded-lg bg-[#00c9a7] text-[#0a0f0f] shadow-md shadow-[#00c9a7]/40"
                    animate={{
                      left: ["8%", "82%", "8%"],
                    }}
                    transition={{
                      duration: mode === "air" ? 4 : mode === "ocean" ? 7 : 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {mode === "ocean" ? (
                      <Ship size={14} />
                    ) : mode === "air" ? (
                      <Plane size={14} />
                    ) : (
                      <Truck size={14} />
                    )}
                  </motion.div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-mono text-[#3a6b66] pt-0.5">
                  <span className="flex items-center gap-1">
                    <Leaf size={11} className="text-[#00c9a7]" />
                    {quoteEstimate.co2}
                  </span>
                  <span className="text-[#7ecfc4]/80">AI Optimized Trajectory</span>
                </div>
              </div>

              {/* Price Big Display with GSAP animated counter */}
              <div className="bg-[#0a1a1a]/80 p-5 rounded-2xl border border-[#1a4a4a]">
                <div className="text-[10px] text-[#3a6b66] uppercase font-bold tracking-wider">
                  Total Estimated Freight Cost
                </div>
                <div className="text-3xl sm:text-4xl font-black text-[#e0faf5] font-mono mt-1 flex items-baseline gap-1">
                  $<span ref={priceRef}>{quoteEstimate.total.toLocaleString()}</span>
                  <span className="text-xs font-sans text-[#7ecfc4] font-medium">USD</span>
                </div>
                <div className="text-[11px] text-[#7ecfc4]/80 mt-1 flex items-center gap-1.5">
                  <Clock size={12} className="text-[#00c9a7]" />
                  <span>Estimated Transit Time: <strong>{quoteEstimate.days}</strong></span>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between text-[#7ecfc4]">
                  <span>Base Freight Rate</span>
                  <span className="font-mono text-[#e0faf5]">${quoteEstimate.baseRate.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[#7ecfc4]">
                  <span>Bunker / Fuel Surcharge</span>
                  <span className="font-mono text-[#e0faf5]">${quoteEstimate.bunkerSurcharge.toLocaleString()}</span>
                </div>
                {needCustoms && (
                  <div className="flex items-center justify-between text-[#7ecfc4]">
                    <span>Customs Entry Filing</span>
                    <span className="font-mono text-[#e0faf5]">${quoteEstimate.customsFee}</span>
                  </div>
                )}
                {needInsurance && (
                  <div className="flex items-center justify-between text-[#7ecfc4]">
                    <span>All-Risk Cargo Insurance</span>
                    <span className="font-mono text-[#e0faf5]">${quoteEstimate.insuranceFee}</span>
                  </div>
                )}
              </div>

              {/* Carbon Footprint Pill */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-[#00c9a7]/10 border border-[#00c9a7]/30 text-xs text-[#00e5c0]">
                <Leaf size={16} className="text-[#00c9a7] flex-shrink-0" />
                <div>
                  <span className="font-bold block">Carbon Impact Estimate</span>
                  <span className="text-[10px] text-[#7ecfc4]">
                    {quoteEstimate.co2} emitted on this route. Carbon offset option available upon booking.
                  </span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleBooking}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#00c9a7]/30 hover:opacity-95 transition-opacity"
                >
                  <Sparkles size={16} />
                  <span>Book Shipment with this Quote</span>
                </button>

                <Link
                  href={ROUTES.DASHBOARD}
                  className="w-full py-2.5 rounded-xl border border-[#1a4a4a] hover:border-[#00c9a7] text-xs font-semibold text-[#7ecfc4] hover:text-[#e0faf5] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>Open in Logistics Dashboard</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </GsapPageWrapper>
      </main>

      <Footer />
    </div>
  );
}
