"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { 
  Calculator, 
  Ship, 
  Plane, 
  Train, 
  Leaf, 
  Clock, 
  DollarSign, 
  ArrowRight, 
  Sparkles,
  ShieldCheck,
  Zap
} from "lucide-react";
import Link from "next/link";
import { CONTAINER_CLASS } from "./ContainsLayout";

interface RouteOption {
  id: string;
  label: string;
  origin: string;
  destination: string;
  oceanDays: number;
  oceanPricePerTEU: number;
  oceanCO2: number;
  airDays: number;
  airPricePerTon: number;
  airCO2: number;
  railDays: number;
  railPricePerTEU: number;
  railCO2: number;
}

const POPULAR_ROUTES: RouteOption[] = [
  {
    id: "sha-lax",
    label: "Shanghai (SHA) ➔ Los Angeles (LAX)",
    origin: "Shanghai, China",
    destination: "Los Angeles, USA",
    oceanDays: 14,
    oceanPricePerTEU: 1850,
    oceanCO2: 0.85,
    airDays: 2,
    airPricePerTon: 3600,
    airCO2: 4.8,
    railDays: 0, // No rail across Pacific
    railPricePerTEU: 0,
    railCO2: 0,
  },
  {
    id: "szx-rot",
    label: "Shenzhen (SZX) ➔ Rotterdam (RTM)",
    origin: "Shenzhen, China",
    destination: "Rotterdam, Netherlands",
    oceanDays: 24,
    oceanPricePerTEU: 2200,
    oceanCO2: 1.15,
    airDays: 3,
    airPricePerTon: 4200,
    airCO2: 6.2,
    railDays: 16,
    railPricePerTEU: 3800,
    railCO2: 1.4,
  },
  {
    id: "dxb-fra",
    label: "Dubai (DXB) ➔ Frankfurt (FRA)",
    origin: "Dubai, UAE",
    destination: "Frankfurt, Germany",
    oceanDays: 18,
    oceanPricePerTEU: 1600,
    oceanCO2: 0.95,
    airDays: 1,
    airPricePerTon: 2400,
    airCO2: 3.1,
    railDays: 12,
    railPricePerTEU: 2900,
    railCO2: 1.1,
  },
  {
    id: "sin-ham",
    label: "Singapore (SIN) ➔ Hamburg (HAM)",
    origin: "Singapore",
    destination: "Hamburg, Germany",
    oceanDays: 22,
    oceanPricePerTEU: 2100,
    oceanCO2: 1.05,
    airDays: 2,
    airPricePerTon: 3950,
    airCO2: 5.4,
    railDays: 15,
    railPricePerTEU: 3400,
    railCO2: 1.3,
  },
];

type FreightType = "ocean" | "air" | "rail";

export function FreightCostCalculator() {
  const [selectedRouteId, setSelectedRouteId] = useState<string>("szx-rot");
  const [selectedMode, setSelectedMode] = useState<FreightType>("ocean");
  const [containerCount, setContainerCount] = useState<number>(2);
  const [isEcoOptimized, setIsEcoOptimized] = useState<boolean>(true);

  const currentRoute = useMemo(() => {
    return POPULAR_ROUTES.find((r) => r.id === selectedRouteId) || POPULAR_ROUTES[0];
  }, [selectedRouteId]);

  // Calculations
  const calculatedEstimate = useMemo(() => {
    if (selectedMode === "ocean") {
      const baseCost = currentRoute.oceanPricePerTEU * containerCount;
      const customsCost = 350;
      const portFees = 280 * containerCount;
      const total = baseCost + customsCost + portFees;
      const co2Total = (currentRoute.oceanCO2 * containerCount * (isEcoOptimized ? 0.82 : 1)).toFixed(2);
      return {
        transitDays: `${currentRoute.oceanDays} - ${currentRoute.oceanDays + 3} Days`,
        totalPrice: total,
        customsCost,
        co2Tons: co2Total,
        ecoSavings: isEcoOptimized ? "18% Carbon Offset Included" : "Standard Fuel",
        modeTitle: "Ocean FCL (Full Container Load)",
        icon: Ship,
      };
    } else if (selectedMode === "air") {
      // Est. weight for container equivalency
      const baseCost = currentRoute.airPricePerTon * containerCount * 1.8;
      const customsCost = 450;
      const airportFees = 380;
      const total = Math.round(baseCost + customsCost + airportFees);
      const co2Total = (currentRoute.airCO2 * containerCount * 1.5 * (isEcoOptimized ? 0.85 : 1)).toFixed(2);
      return {
        transitDays: `${currentRoute.airDays} - ${currentRoute.airDays + 1} Days`,
        totalPrice: total,
        customsCost,
        co2Tons: co2Total,
        ecoSavings: isEcoOptimized ? "SAF Biofuel Offset Active" : "Jet-A1 Standard",
        modeTitle: "Express Air Freight",
        icon: Plane,
      };
    } else {
      // Rail
      const baseCost = currentRoute.railDays > 0 ? currentRoute.railPricePerTEU * containerCount : 3200 * containerCount;
      const customsCost = 380;
      const railheadFees = 250 * containerCount;
      const total = baseCost + customsCost + railheadFees;
      const co2Total = (currentRoute.railCO2 * containerCount * (isEcoOptimized ? 0.80 : 1)).toFixed(2);
      return {
        transitDays: currentRoute.railDays > 0 ? `${currentRoute.railDays} Days` : "14 - 18 Days",
        totalPrice: total,
        customsCost,
        co2Tons: co2Total,
        ecoSavings: "Electric Traction Verified",
        modeTitle: "Eurasian Express Rail",
        icon: Train,
      };
    }
  }, [selectedMode, currentRoute, containerCount, isEcoOptimized]);

  return (
    <section 
      id="freight-calculator"
      className="relative py-16 md:py-24 border-b border-[#1a4a4a]/40 bg-[#071010]"
    >
      {/* Decorative gradient glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute bottom-0 right-1/4 h-80 w-80 rounded-full bg-[#00b4d8]/10 blur-[120px]" 
      />

      <div className={CONTAINER_CLASS}>
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00c9a7]/30 bg-[#00c9a7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00c9a7] mb-3">
            <Calculator className="h-3.5 w-3.5" />
            Transparent Instant Quoting
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#e0faf5] mb-4">
            Simulate your freight.
            <br />
            <span className="bg-linear-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8] bg-clip-text text-transparent">
              Zero hidden tariffs.
            </span>
          </h2>
          <p className="text-base text-[#7ecfc4] leading-relaxed">
            Compare multi-modal transit velocities, port handling fees, customs clearance times, and ESG carbon emissions in real time.
          </p>
        </div>

        {/* Calculator Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Controls - Left 7 Cols */}
          <div className="lg:col-span-7 rounded-2xl border border-[#1a4a4a] bg-[#0d1f1f]/90 p-6 sm:p-8 backdrop-blur-md">
            {/* 1. Route Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7ecfc4] mb-2.5">
                1. Select Global Trade Corridor
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {POPULAR_ROUTES.map((route) => {
                  const isSelected = selectedRouteId === route.id;
                  return (
                    <button
                      key={route.id}
                      type="button"
                      onClick={() => setSelectedRouteId(route.id)}
                      className={`text-left rounded-xl p-3 border transition-all text-xs outline-hidden ${
                        isSelected
                          ? "border-[#00c9a7] bg-[#00c9a7]/10 text-[#e0faf5] shadow-[0_0_12px_rgba(0,201,167,0.2)]"
                          : "border-[#1a4a4a]/70 bg-[#0a1a1a]/80 text-[#7ecfc4] hover:border-[#1a4a4a] hover:text-[#e0faf5]"
                      }`}
                    >
                      <div className="font-semibold">{route.label}</div>
                      <div className="text-[10px] text-[#3a6b66] mt-0.5">
                        {route.origin} to {route.destination}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Mode Selector */}
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#7ecfc4] mb-2.5">
                2. Shipping Mode
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedMode("ocean")}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all outline-hidden ${
                    selectedMode === "ocean"
                      ? "border-[#00c9a7] bg-[#00c9a7]/15 text-[#00e5c0] shadow-[0_0_12px_rgba(0,201,167,0.25)]"
                      : "border-[#1a4a4a]/70 bg-[#0a1a1a]/80 text-[#7ecfc4] hover:bg-[#112a2a]"
                  }`}
                >
                  <Ship className="h-5 w-5" />
                  <span className="text-xs font-semibold">Ocean FCL</span>
                  <span className="text-[10px] text-[#3a6b66]">Economical</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode("air")}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all outline-hidden ${
                    selectedMode === "air"
                      ? "border-[#00c9a7] bg-[#00c9a7]/15 text-[#00e5c0] shadow-[0_0_12px_rgba(0,201,167,0.25)]"
                      : "border-[#1a4a4a]/70 bg-[#0a1a1a]/80 text-[#7ecfc4] hover:bg-[#112a2a]"
                  }`}
                >
                  <Plane className="h-5 w-5" />
                  <span className="text-xs font-semibold">Air Express</span>
                  <span className="text-[10px] text-[#3a6b66]">Fastest</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMode("rail")}
                  className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all outline-hidden ${
                    selectedMode === "rail"
                      ? "border-[#00c9a7] bg-[#00c9a7]/15 text-[#00e5c0] shadow-[0_0_12px_rgba(0,201,167,0.25)]"
                      : "border-[#1a4a4a]/70 bg-[#0a1a1a]/80 text-[#7ecfc4] hover:bg-[#112a2a]"
                  }`}
                >
                  <Train className="h-5 w-5" />
                  <span className="text-xs font-semibold">Rail Block</span>
                  <span className="text-[10px] text-[#3a6b66]">Balanced</span>
                </button>
              </div>
            </div>

            {/* 3. Container Count / Volume Slider */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-[#7ecfc4]">
                  3. Volume / Units ({containerCount} {containerCount === 1 ? "TEU Container" : "TEU Containers"})
                </label>
                <span className="font-mono text-sm font-bold text-[#00e5c0]">
                  {containerCount * 28} Metric Tons Est.
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="20"
                value={containerCount}
                onChange={(e) => setContainerCount(parseInt(e.target.value, 10))}
                className="w-full accent-[#00c9a7] cursor-pointer h-2 bg-[#0a1a1a] rounded-lg border border-[#1a4a4a]"
              />
              <div className="flex justify-between text-[10px] text-[#3a6b66] font-mono mt-1">
                <span>1 TEU</span>
                <span>5 TEU</span>
                <span>10 TEU</span>
                <span>20 TEU Fleet</span>
              </div>
            </div>

            {/* 4. Eco Green Optimizer Switch */}
            <div className="flex items-center justify-between p-3.5 rounded-xl border border-[#00c9a7]/30 bg-[#00c9a7]/5">
              <div className="flex items-center gap-2.5">
                <Leaf className="h-4 w-4 text-[#00e5c0]" />
                <div>
                  <div className="text-xs font-semibold text-[#e0faf5]">
                    AI Green Route Optimizer (Scope 3 Reduction)
                  </div>
                  <div className="text-[11px] text-[#7ecfc4]">
                    Selects biofuel vessels and electrified rail links
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEcoOptimized(!isEcoOptimized)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                  isEcoOptimized ? "bg-[#00c9a7]" : "bg-[#1a4a4a]"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0a0f0f] shadow-lg ring-0 transition duration-200 ease-in-out ${
                    isEcoOptimized ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Real-time Dynamic Quote Result - Right 5 Cols */}
          <div className="lg:col-span-5 rounded-2xl border border-[#00c9a7]/50 bg-linear-to-b from-[#0d2222] to-[#0a1616] p-6 sm:p-8 shadow-[0_0_40px_rgba(0,201,167,0.12)]">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#1a4a4a]">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-[#00c9a7]" />
                <span className="text-xs uppercase font-mono tracking-widest text-[#00c9a7]">
                  Instant Telemetry Quote
                </span>
              </div>
              <span className="text-[10px] font-mono text-[#7ecfc4] px-2 py-0.5 rounded bg-[#0a1a1a] border border-[#1a4a4a]">
                VALID 7 DAYS
              </span>
            </div>

            {/* Price Display */}
            <div className="mb-6">
              <div className="text-[11px] text-[#7ecfc4] uppercase tracking-wider mb-1">
                Estimated All-Inclusive Freight
              </div>
              <div className="flex items-baseline gap-1 text-3xl sm:text-4xl font-extrabold text-[#e0faf5] font-mono">
                <span className="text-[#00c9a7]">$</span>
                {calculatedEstimate.totalPrice.toLocaleString()}
                <span className="text-xs font-normal text-[#3a6b66] ml-2">USD total</span>
              </div>
            </div>

            {/* Key Metric Highlights */}
            <div className="space-y-3 mb-6 font-mono text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#071212] border border-[#1a4a4a]/70">
                <span className="text-[#7ecfc4] flex items-center gap-1.5 font-sans">
                  <Clock className="h-3.5 w-3.5 text-[#00b4d8]" /> Transit Velocity:
                </span>
                <span className="text-[#e0faf5] font-bold">{calculatedEstimate.transitDays}</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#071212] border border-[#1a4a4a]/70">
                <span className="text-[#7ecfc4] flex items-center gap-1.5 font-sans">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#00e5c0]" /> Automated Customs:
                </span>
                <span className="text-[#00e5c0]">Fast-Track Included (${calculatedEstimate.customsCost})</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#071212] border border-[#1a4a4a]/70">
                <span className="text-[#7ecfc4] flex items-center gap-1.5 font-sans">
                  <Leaf className="h-3.5 w-3.5 text-[#00c9a7]" /> Carbon Footprint:
                </span>
                <span className="text-[#00c9a7] font-bold">{calculatedEstimate.co2Tons} Tons CO₂e</span>
              </div>
            </div>

            {/* Book Now Button */}
            <Link
              href="/quote"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00c9a7] px-6 py-3.5 text-sm font-bold text-[#0a0f0f] shadow-[0_0_20px_rgba(0,201,167,0.4)] transition-all hover:bg-[#00e5c0] hover:shadow-[0_0_30px_rgba(0,229,192,0.6)]"
            >
              <Zap className="h-4 w-4" />
              <span>Lock in Rate & Book Dispatch</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <div className="mt-4 text-center">
              <span className="text-[10px] text-[#3a6b66]">
                Guaranteed slot allocation with certified bill of lading
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
