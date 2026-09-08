"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import GsapPageWrapper from "@/components/ui/GsapPageWrapper";
import { CONTAINER_CLASS } from "@/app/components/ContainsLayout";
import {
  Ship,
  Plane,
  Truck,
  FileCheck2,
  Warehouse,
  ThermometerSnowflake,
  ArrowRight,
  CheckCircle2,
  Clock,
  Shield,
  Layers,
  Sparkles,
} from "lucide-react";
import { ROUTES } from "@/app/constants/routes";

interface ServiceItem {
  id: string;
  name: string;
  category: string;
  icon: any;
  tag: string;
  leadTime: string;
  capacity: string;
  summary: string;
  features: string[];
  lanes: string[];
}

const SERVICES: ServiceItem[] = [
  {
    id: "ocean-fcl",
    name: "Ocean Liner Freight (FCL & LCL)",
    category: "Maritime",
    icon: Ship,
    tag: "High Volume / Cost Efficient",
    leadTime: "12 - 28 Days",
    capacity: "20ft, 40ft, 40ft HQ, 45ft High Cube",
    summary:
      "Direct vessel slot allocations across major maritime alliances. Guaranteed container equipment availability even during peak seasons with live AIS satellite voyage tracking.",
    features: [
      "Contracted carrier space on 2M, Ocean Alliance & THE Alliance",
      "Full Container Load (FCL) and consolidated LCL options",
      "Reefer temperature control with automated IoT telematics",
      "Port-to-Port, Door-to-Port, and Door-to-Door routing",
    ],
    lanes: ["Shanghai ⇄ Rotterdam", "Chittagong ⇄ Singapore", "Ningbo ⇄ Los Angeles"],
  },
  {
    id: "air-cargo",
    name: "Air Freight Express & Charters",
    category: "Aviation",
    icon: Plane,
    tag: "Time-Critical / Express",
    leadTime: "1 - 5 Days",
    capacity: "Up to 110,000 kg (B747 / B777 Freighters)",
    summary:
      "When deadlines can't wait, our air cargo network delivers urgent components, high-value electronics, and emergency replenishment via direct flights and dedicated cargo charters.",
    features: [
      "Next-Flight-Out (NFO) priority boarding",
      "Consolidated deferred air options for reduced expenses",
      "Dangerous Goods (DGR) certified handling",
      "Airport ramp tarmac transfer with armed security options",
    ],
    lanes: ["Frankfurt ⇄ Dubai", "Hong Kong ⇄ Chicago", "Singapore ⇄ London Heathrow"],
  },
  {
    id: "intermodal-trucking",
    name: "Overland Intermodal & Drayage",
    category: "Ground",
    icon: Truck,
    tag: "Regional & Cross-Border",
    leadTime: "12 Hours - 4 Days",
    capacity: "Standard 53ft, Flatbed, Lowboy, Curtainsider",
    summary:
      "Complete inland drayage from ocean terminals and rail ramps directly to your warehouse doors. GPS-equipped fleet with live driver dispatch and electronic proof of delivery.",
    features: [
      "Port & rail container drayage with zero demurrage guarantees",
      "Cross-border bonded transit under TIR carnet",
      "Automated route optimization avoiding road tolls and traffic",
      "Real-time driver telematics and speed monitoring",
    ],
    lanes: ["Rotterdam ⇄ Ruhr Valley", "Chicago ⇄ Dallas", "Chittagong ⇄ Dhaka EPZ"],
  },
  {
    id: "customs-brokerage",
    name: "AI Customs Clearance & Brokerage",
    category: "Compliance",
    icon: FileCheck2,
    tag: "Zero-Hold Border Clearance",
    leadTime: "Under 4 Hours",
    capacity: "Unlimited Declarations",
    summary:
      "Automate HS tariff classifications and import duty calculations. Our licensed in-house customs brokers manage pre-arrival filing to ensure rapid release without border demurrage.",
    features: [
      "Automated electronic entry filing (ACE, CDS, ATLAS)",
      "Automated tariff duty calculation & VAT reclaim assistance",
      "Sanctions, dual-use goods, and anti-dumping checks",
      "Complete digital audit trail for tax authorities",
    ],
    lanes: ["European Union", "United States CBP", "ASEAN Single Window", "UK HMRC"],
  },
  {
    id: "smart-warehousing",
    name: "Smart Warehousing & 3PL Hubs",
    category: "Storage",
    icon: Warehouse,
    tag: "Automated Inventory",
    leadTime: "Same-Day Dispatch",
    capacity: "450,000+ sq ft across 12 Hubs",
    summary:
      "Modern bonded and ambient warehousing facilities equipped with WMS real-time API integrations, automated cross-docking, pick-and-pack, and kitting.",
    features: [
      "Bonded customs warehouse storage to defer import duties",
      "Barcode and RFID asset tagging for 99.98% inventory accuracy",
      "Cross-dock consolidation and pallet breakdown",
      "Direct API integration with Shopify, SAP, and NetSuite",
    ],
    lanes: ["Singapore Hub", "Rotterdam Maasvlakte", "Jebel Ali Dubai", "New Jersey Terminal"],
  },
  {
    id: "cold-chain",
    name: "Pharma & Cold Chain Logistics",
    category: "Specialized",
    icon: ThermometerSnowflake,
    tag: "-25°C to +25°C Controlled",
    leadTime: "Pre-scheduled Priority",
    capacity: "Active & Passive Cold Boxes",
    summary:
      "Unbroken cold chain custody for biologics, vaccines, perishable fresh food, and chemical goods with redundant active temperature loggers transmitting live telemetry.",
    features: [
      "GDP (Good Distribution Practice) compliant handling",
      "Dry ice replenishment and cryogenic nitrogen shippers",
      "Real-time temperature and humidity telemetry alerts",
      "Dedicated refrigerated container plugs on vessel decks",
    ],
    lanes: ["Basel ⇄ Boston", "Oslo ⇄ Tokyo", "Santiago ⇄ Philadelphia"],
  },
];

export default function ServicesPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const categories = ["All", "Maritime", "Aviation", "Ground", "Compliance", "Storage", "Specialized"];

  const filteredServices =
    activeCategory === "All"
      ? SERVICES
      : SERVICES.filter((s) => s.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f0f] text-[#e0faf5] overflow-x-hidden">
      <Navbar />

      <main className="flex-1 pt-24 sm:pt-28 pb-16">
        <GsapPageWrapper className={`${CONTAINER_CLASS} space-y-12 sm:space-y-16`}>
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto pt-6 sm:pt-10 space-y-4">
            <div className="gsap-reveal inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#00c9a7]/10 text-[#00e5c0] border border-[#00c9a7]/30">
              <Layers size={14} className="text-[#00c9a7]" />
              <span>Comprehensive Multi-Modal Freight Solutions</span>
            </div>

            <h1 className="gsap-reveal text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]">
              Engineered for Speed, Scale, &{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00c9a7] via-[#00e5c0] to-[#00b4d8]">
                Precision Logistics
              </span>
            </h1>

            <p className="gsap-reveal text-sm sm:text-base text-[#7ecfc4]/90 max-w-2xl mx-auto leading-relaxed">
              Explore our comprehensive freight services covering maritime vessel corridors, priority air express, cross-border overland drayage, and automated customs brokerage.
            </p>

            <div className="gsap-reveal flex items-center justify-center gap-3 pt-2">
              <Link
                href={ROUTES.QUOTE}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] font-bold text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-[#00c9a7]/20 hover:opacity-95 transition-all hover:scale-105"
              >
                <Sparkles size={15} />
                <span>Instant Rate Calculator</span>
              </Link>
              <Link
                href={ROUTES.CONTACT}
                className="px-6 py-3 rounded-2xl border border-[#1a4a4a] bg-[#0d1f1f] text-[#7ecfc4] font-semibold text-xs sm:text-sm hover:border-[#00c9a7] hover:text-[#e0faf5] transition-all"
              >
                Talk to a Freight Specialist
              </Link>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="gsap-reveal flex items-center justify-center gap-2 flex-wrap pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeCategory === cat
                    ? "bg-[#00c9a7] text-[#0a0f0f] shadow-lg shadow-[#00c9a7]/20"
                    : "bg-[#0d1f1f] text-[#7ecfc4] border border-[#1a4a4a] hover:border-[#00c9a7]/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredServices.map((service) => {
              const IconComp = service.icon;
              return (
                <div
                  key={service.id}
                  className="gsap-reveal p-6 sm:p-7 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] hover:border-[#00c9a7]/60 transition-all flex flex-col justify-between group shadow-xl"
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0] group-hover:scale-110 transition-transform">
                          <IconComp size={22} />
                        </div>
                        <div>
                          <h3 className="text-base sm:text-lg font-bold text-[#e0faf5]">
                            {service.name}
                          </h3>
                          <span className="text-[10px] font-mono text-[#00c9a7] font-semibold uppercase tracking-wider">
                            {service.category} Service
                          </span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4]">
                        {service.tag}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-[#7ecfc4]/80 leading-relaxed">
                      {service.summary}
                    </p>

                    {/* Specs Pills */}
                    <div className="grid grid-cols-2 gap-3 py-2">
                      <div className="p-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a]/50">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#3a6b66] font-bold uppercase tracking-wider">
                          <Clock size={12} className="text-[#00c9a7]" />
                          Average Transit
                        </div>
                        <div className="text-xs font-bold text-[#e0faf5] mt-0.5">
                          {service.leadTime}
                        </div>
                      </div>

                      <div className="p-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a]/50">
                        <div className="flex items-center gap-1.5 text-[10px] text-[#3a6b66] font-bold uppercase tracking-wider">
                          <Shield size={12} className="text-[#00b4d8]" />
                          Unit Capacity
                        </div>
                        <div className="text-xs font-bold text-[#e0faf5] mt-0.5 truncate">
                          {service.capacity}
                        </div>
                      </div>
                    </div>

                    {/* Features list */}
                    <div className="space-y-1.5 pt-1">
                      {service.features.map((feat) => (
                        <div key={feat} className="flex items-start gap-2 text-xs text-[#7ecfc4]/90">
                          <CheckCircle2 size={13} className="text-[#00c9a7] flex-shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Action */}
                  <div className="mt-6 pt-4 border-t border-[#1a4a4a]/50 flex items-center justify-between gap-4">
                    <div className="text-[11px] text-[#3a6b66]">
                      Frequent Lanes: <strong className="text-[#7ecfc4]">{service.lanes[0]}</strong>
                    </div>

                    <Link
                      href={`${ROUTES.QUOTE}?mode=${service.category.toLowerCase()}`}
                      className="px-4 py-2 rounded-xl bg-[#112a2a] hover:bg-[#00c9a7]/15 border border-[#1a4a4a] hover:border-[#00c9a7] text-xs font-bold text-[#00e5c0] transition-colors flex items-center gap-1.5"
                    >
                      <span>Get Rate</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bottom Banner */}
          <div className="gsap-reveal p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#00c9a7]/15 via-[#0d1f1f] to-[#00b4d8]/15 border border-[#00c9a7]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-bold text-[#e0faf5]">
                Need a Custom Project Cargo or Charter Quote?
              </h3>
              <p className="text-xs sm:text-sm text-[#7ecfc4]">
                Our enterprise logistics desk handles oversized breakbulk, heavy-lift vessels, and dedicated air charters.
              </p>
            </div>

            <Link
              href={ROUTES.CONTACT}
              className="px-6 py-3 rounded-2xl bg-[#00c9a7] text-[#0a0f0f] font-bold text-xs sm:text-sm whitespace-nowrap shadow-md shadow-[#00c9a7]/30 hover:opacity-90 transition-opacity flex items-center gap-2"
            >
              <span>Connect with Operations</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </GsapPageWrapper>
      </main>

      <Footer />
    </div>
  );
}
