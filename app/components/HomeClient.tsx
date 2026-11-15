"use client";

import dynamic from "next/dynamic";
import { Navbar } from "./Navbar";
import { LiveOpsStatsTicker } from "./LiveOpsStatsTicker";
import { MultiModalFleet } from "./MultiModalFleet";
import { LiveTracking } from "./LiveTracking";
import { FreightCostCalculator } from "./FreightCostCalculator";
import { ShipmentLifecycle } from "./ShipmentLifecycle";
import { BorderCustomsAutomation } from "./BorderCustomsAutomation";
import { GlobalCoverage } from "./GlobalCoverage";
import { AICommandCenter } from "./AICommandCenter";
import { LogisticsInfrastructure } from "./LogisticsInfrastructure";
import { HowItWorks } from "./HowItWorks";
import { EnterpriseTestimonials } from "./EnterpriseTestimonials";
import { FinalCTA } from "./FinalCTA";
import { Footer } from "./Footer";

// Only Hero3D and GlobalNetwork are 3D Canvas scenes
const Hero3D = dynamic(() => import("./Hero3D"), { ssr: false });
const GlobalNetwork = dynamic(() => import("./GlobalNetwork"), { ssr: false });

export function HomeClient() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#0a0f0f]" style={{ background: "var(--bg-primary)" }}>
      <Navbar />
      <h1 className="sr-only">
        Move the world. Track every shipment. — FreightAgent global freight platform.
      </h1>

      {/* 1. Hero 3D Section */}
      <Hero3D />

      {/* 2. NEW: Global Live Telemetry & Port Congestion Index */}
      <LiveOpsStatsTicker />

      {/* 3. Global Interactive Route Network */}
      <GlobalNetwork />

      {/* 4. NEW: Multi-Modal Fleet & Cargo Capabilities (Ocean, Air, Rail, Road) */}
      <MultiModalFleet />

      {/* 5. Live Parcel & Freight Tracking Widget */}
      <LiveTracking />

      {/* 6. NEW: Interactive Instant Freight Quoting & Carbon Footprint Calculator */}
      <FreightCostCalculator />

      {/* 7. Milestone Lifecycle Pipeline */}
      <ShipmentLifecycle />

      {/* 8. NEW: AI Border Customs & Compliance Automation Engine */}
      <BorderCustomsAutomation />

      {/* 9. Global Port & Airport Coverage Map */}
      <GlobalCoverage />

      {/* 10. AI Telemetry Command Center */}
      <AICommandCenter />

      {/* 11. Logistics Infrastructure */}
      <LogisticsInfrastructure />

      {/* 12. 4-Step Process */}
      <HowItWorks />

      {/* 13. NEW: Enterprise Shipper Success Stories, ROI Metrics & Certifications */}
      <EnterpriseTestimonials />

      {/* 14. Action CTA */}
      <FinalCTA />

      {/* 15. Navigation Footer */}
      <Footer />
    </main>
  );
}

export default HomeClient;
