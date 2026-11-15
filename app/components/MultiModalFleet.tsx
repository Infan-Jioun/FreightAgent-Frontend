"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { 
  Ship, 
  Plane, 
  Train, 
  Truck, 
  Gauge, 
  ThermometerSnowflake, 
  Satellite, 
  Leaf, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import Link from "next/link";
import { CONTAINER_CLASS } from "./ContainsLayout";

interface FleetMode {
  id: "ocean" | "air" | "rail" | "road";
  label: string;
  icon: typeof Ship;
  tagline: string;
  description: string;
  vesselExample: string;
  specs: {
    capacity: string;
    velocity: string;
    coldChain: string;
    telemetry: string;
    carbonRating: string;
  };
  keyAdvantages: string[];
  simulatedData: {
    callsign: string;
    route: string;
    eta: string;
    cargoStatus: string;
    tempSensor: string;
  };
}

const FLEET_MODES: FleetMode[] = [
  {
    id: "ocean",
    label: "Ocean Freight",
    icon: Ship,
    tagline: "Ultra Large Container Vessels (ULCV) & Dedicated Feeders",
    description: "High-volume, cost-optimized maritime freight corridors. Autonomous slot booking across 18 major ocean carrier alliances with predictive dwell mitigation.",
    vesselExample: "MV Pacific Pioneer • IMO 9841203 • 24,000 TEU Tier",
    specs: {
      capacity: "Up to 24,000 TEU per vessel",
      velocity: "18 – 22 Knots cruising speed",
      coldChain: "-30°C to +25°C Controlled Atmosphere",
      telemetry: "Dual Starlink Maritime + Inmarsat C",
      carbonRating: "IMO 2030 Tier III Compliant (LNG Ready)",
    },
    keyAdvantages: [
      "Guaranteed vessel slot allocations during peak seasons",
      "Demurrage and detention autonomous alert shields",
      "Automated bill of lading (eBL) cryptographic handoffs",
    ],
    simulatedData: {
      callsign: "Vessel: MV Pacific Pioneer (IMO 9841203)",
      route: "Ningbo-Zhoushan ➔ Port of Rotterdam",
      eta: "3d 14h Remaining • On Schedule",
      cargoStatus: "Hold 4, Bay 18 • 420 Reefer Units Nominal",
      tempSensor: "-18.4°C Target Staged",
    },
  },
  {
    id: "air",
    label: "Air Cargo",
    icon: Plane,
    tagline: "Dedicated Widebody Freighters & Guaranteed Belly-Space",
    description: "Urgent, mission-critical global transit. Same-day customs flight dispatch, bonded airport transfers, and climate-verified pharmaceutical flight corridors.",
    vesselExample: "B777-200F • Tail N942FA • Cargo Max Payload 102 Tons",
    specs: {
      capacity: "102 Metric Tons / 650 m³ payload",
      velocity: "490 – 540 Knots (Mach 0.84)",
      coldChain: "Dry Ice & Active Cryogenic RKN Containers",
      telemetry: "Real-time ADS-B & IATA Cargo-iQ telemetry",
      carbonRating: "Sustainable Aviation Fuel (SAF) Offsets",
    },
    keyAdvantages: [
      "12-to-36 hour door-to-door transcontinental delivery",
      "IATA CEIV Pharma & Lithium Battery certified handling",
      "Direct tarmac priority ramp transfers",
    ],
    simulatedData: {
      callsign: "Flight: FA-Cargo 8109 Heavy",
      route: "Seoul Incheon (ICN) ➔ Frankfurt Main (FRA)",
      eta: "5h 42m Flight Time • Cleared Tarmac",
      cargoStatus: "Pallet Deck A • 38 ULD Units Secured",
      tempSensor: "+4.1°C Bio-Coldchain Stable",
    },
  },
  {
    id: "rail",
    label: "Rail Intermodal",
    icon: Train,
    tagline: "Eurasian & Trans-Continental High-Speed Express Rail",
    description: "The optimal bridge between air speed and ocean economics. Reliable block trains cutting transit time by 60% compared to maritime shipping.",
    vesselExample: "Block Express 704 • 82 Forty-Foot Equivalent (FEU)",
    specs: {
      capacity: "82 FEU High-Cube Block Trains",
      velocity: "80 – 120 km/h Continuous Rail Corridor",
      coldChain: "Diesel-Electric Hybrid Generator Reefer Wagons",
      telemetry: "GSM-R & Geofence Trackside RF Telemetry",
      carbonRating: "78% Lower CO₂ vs air freight equivalent",
    },
    keyAdvantages: [
      "14-18 days Asia to Europe door-to-door corridor",
      "Immune to maritime canal and port berth congestions",
      "Fixed weekly block train departures with zero rolled cargo",
    ],
    simulatedData: {
      callsign: "Express: Eurasian Rail Block 704",
      route: "Chongqing ➔ Malaszewicze ➔ Duisburg Terminal",
      eta: "4d 08h Remaining • Green Signal",
      cargoStatus: "Wagon 14 • Sealed Electronic RFID Lock",
      tempSensor: "Ambient Interior: 18.2°C Clean",
    },
  },
  {
    id: "road",
    label: "Road & Drayage",
    icon: Truck,
    tagline: "Autonomous EV Drayage & Heavy-Duty Cross-Border Haulage",
    description: "Precision first-and-last-mile connectivity. Connected smart fleet network with automated route optimization, driver app telemetry, and e-POD dispatch.",
    vesselExample: "FreightAgent Haul-X EV • 40-Ton Super-B Train",
    specs: {
      capacity: "Up to 44 Metric Tons Gross Vehicle Mass",
      velocity: "Smart cruise governed with traffic AI",
      coldChain: "Dual-Zone Multi-Temperature Telematics",
      telemetry: "OBD-II CANbus, Driver Cam & Satellite IoT",
      carbonRating: "Zero-Emission Heavy EV Drayage Corridors",
    },
    keyAdvantages: [
      "Live 15-minute appointment scheduling at marine ports",
      "Instant electronic proof of delivery (e-POD) with signature",
      "Border customs fast-lane pre-clearance with digital seals",
    ],
    simulatedData: {
      callsign: "Truck: Unit TX-4091 (EV Drayage Master)",
      route: "Port of Long Beach ➔ Inland Empire Logistics Hub",
      eta: "1h 15m Delivery Window • Gate 4 Checked",
      cargoStatus: "Chassis Container CMAU-918234-9 Mounted",
      tempSensor: "Dry Cargo • Sealed Tamper Sensor OK",
    },
  },
];

export function MultiModalFleet() {
  const [activeTab, setActiveTab] = useState<FleetMode["id"]>("ocean");
  const sectionRef = useRef<HTMLDivElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-80px" });

  const activeMode = FLEET_MODES.find((m) => m.id === activeTab) || FLEET_MODES[0];
  const ActiveIcon = activeMode.icon;

  return (
    <section 
      id="multimodal-fleet" 
      ref={sectionRef}
      className="relative py-16 md:py-24 overflow-hidden border-b border-[#1a4a4a]/40 bg-[#0a0f0f]"
    >
      <div className={CONTAINER_CLASS}>
        {/* Section Heading */}
        <div className="max-w-2xl mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00c9a7]/30 bg-[#00c9a7]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#00c9a7] mb-3">
            <Gauge className="h-3.5 w-3.5" />
            Unified Global Infrastructure
          </div>
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-[#e0faf5] mb-4">
            Multi-modal fleet.
            <br />
            <span className="bg-linear-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8] bg-clip-text text-transparent">
              Engineered for precision.
            </span>
          </h2>
          <p className="text-base text-[#7ecfc4] leading-relaxed">
            One single unified platform orchestrating ocean container lines, high-speed cargo freighters, continental block trains, and first-to-last mile drayage.
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div className="flex flex-wrap gap-2.5 p-1.5 rounded-xl border border-[#1a4a4a] bg-[#0d1f1f]/80 mb-8 max-w-fit">
          {FLEET_MODES.map((mode) => {
            const Icon = mode.icon;
            const isSelected = activeTab === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => setActiveTab(mode.id)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs sm:text-sm font-semibold transition-all duration-200 outline-hidden ${
                  isSelected
                    ? "bg-[#00c9a7] text-[#0a0f0f] shadow-[0_0_16px_rgba(0,201,167,0.35)]"
                    : "text-[#7ecfc4] hover:bg-[#112a2a] hover:text-[#e0faf5]"
                }`}
              >
                <Icon className={`h-4 w-4 ${isSelected ? "text-[#0a0f0f]" : "text-[#00c9a7]"}`} />
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-2xl border border-[#1a4a4a] bg-linear-to-b from-[#0d1f1f] to-[#081515] p-6 sm:p-8 md:p-10 shadow-[0_0_40px_rgba(0,200,180,0.06)]"
          >
            {/* Left 7 Columns: Specifications & Advantages */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#00c9a7]/30 bg-[#00c9a7]/10 text-[#00e5c0]">
                    <ActiveIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl sm:text-2xl font-bold text-[#e0faf5]">
                      {activeMode.label}
                    </h3>
                    <p className="text-xs font-mono text-[#00c9a7]">
                      {activeMode.vesselExample}
                    </p>
                  </div>
                </div>

                <p className="text-sm sm:text-base text-[#7ecfc4] mb-6 leading-relaxed">
                  {activeMode.description}
                </p>

                {/* Technical Specifications Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  <div className="rounded-xl border border-[#1a4a4a]/70 bg-[#0a1a1a]/80 p-3.5">
                    <span className="text-[11px] text-[#3a6b66] uppercase tracking-wider block mb-1">
                      Payload & Capacity
                    </span>
                    <span className="text-sm font-semibold text-[#e0faf5] font-mono">
                      {activeMode.specs.capacity}
                    </span>
                  </div>

                  <div className="rounded-xl border border-[#1a4a4a]/70 bg-[#0a1a1a]/80 p-3.5">
                    <span className="text-[11px] text-[#3a6b66] uppercase tracking-wider block mb-1">
                      Cruise Velocity
                    </span>
                    <span className="text-sm font-semibold text-[#e0faf5] font-mono">
                      {activeMode.specs.velocity}
                    </span>
                  </div>

                  <div className="rounded-xl border border-[#1a4a4a]/70 bg-[#0a1a1a]/80 p-3.5">
                    <span className="text-[11px] text-[#3a6b66] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <ThermometerSnowflake className="h-3 w-3 text-[#00b4d8]" />
                      Cold-Chain Envelope
                    </span>
                    <span className="text-sm font-semibold text-[#7ecfc4] font-mono">
                      {activeMode.specs.coldChain}
                    </span>
                  </div>

                  <div className="rounded-xl border border-[#1a4a4a]/70 bg-[#0a1a1a]/80 p-3.5">
                    <span className="text-[11px] text-[#3a6b66] uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Leaf className="h-3 w-3 text-[#00e5c0]" />
                      Sustainability Standard
                    </span>
                    <span className="text-sm font-semibold text-[#00e5c0] font-mono">
                      {activeMode.specs.carbonRating}
                    </span>
                  </div>
                </div>

                {/* Key Advantages Bullet List */}
                <div className="space-y-2 mb-8">
                  {activeMode.keyAdvantages.map((adv) => (
                    <div key={adv} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#e0faf5]">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#00c9a7] mt-0.5" />
                      <span>{adv}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Link */}
              <div>
                <Link
                  href="/quote"
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#00c9a7] hover:text-[#00e5c0] transition-colors group"
                >
                  <span>Request instant {activeMode.label.toLowerCase()} quote & transit schedule</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>

            {/* Right 5 Columns: Simulated Live Telemetry Feed Box */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="rounded-xl border border-[#1a4a4a] bg-[#071212] p-5 relative overflow-hidden shadow-inner">
                {/* Simulated radar beam effect */}
                <div 
                  aria-hidden="true" 
                  className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#00c9a7]/10 blur-2xl" 
                />

                <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#1a4a4a]">
                  <div className="flex items-center gap-2">
                    <Satellite className="h-4 w-4 text-[#00c9a7]" />
                    <span className="text-xs font-mono font-semibold text-[#e0faf5]">
                      LIVE TELEMETRY STREAM
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#00e5c0]/10 text-[#00e5c0] border border-[#00e5c0]/30">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00e5c0] animate-ping" />
                    CONNECTED
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[#3a6b66] text-[10px] block">ACTIVE ASSET</span>
                    <span className="text-[#e0faf5] font-semibold">{activeMode.simulatedData.callsign}</span>
                  </div>

                  <div>
                    <span className="text-[#3a6b66] text-[10px] block">ACTIVE TRANSIT CORRIDOR</span>
                    <span className="text-[#7ecfc4]">{activeMode.simulatedData.route}</span>
                  </div>

                  <div>
                    <span className="text-[#3a6b66] text-[10px] block">ESTIMATED TIME OF ARRIVAL (AI CALCULATED)</span>
                    <span className="text-[#00e5c0]">{activeMode.simulatedData.eta}</span>
                  </div>

                  <div>
                    <span className="text-[#3a6b66] text-[10px] block">PAYLOAD TELEMETRY</span>
                    <span className="text-[#e0faf5]">{activeMode.simulatedData.cargoStatus}</span>
                  </div>

                  <div>
                    <span className="text-[#3a6b66] text-[10px] block">SENSOR TELEMETRY</span>
                    <span className="text-[#00b4d8]">{activeMode.simulatedData.tempSensor}</span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-[#1a4a4a]/70 flex items-center justify-between text-[11px] text-[#3a6b66]">
                  <span className="flex items-center gap-1">
                    <ShieldAlert className="h-3 w-3 text-[#00c9a7]" /> Tamper Proof Verified
                  </span>
                  <span>Encryption: AES-256</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
