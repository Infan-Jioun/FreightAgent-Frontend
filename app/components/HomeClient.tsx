"use client";

import dynamic from "next/dynamic";
import { Navbar } from "./Navbar";
import { LiveTracking } from "./LiveTracking";
import { ShipmentLifecycle } from "./ShipmentLifecycle";
import { GlobalCoverage } from "./GlobalCoverage";
import { AICommandCenter } from "./AICommandCenter";
import { LogisticsInfrastructure } from "./LogisticsInfrastructure";
import { HowItWorks } from "./HowItWorks";
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

      {/* Hero 3D Section */}
      <Hero3D />

      {/* Global Interactive Route Network */}
      <GlobalNetwork />

      {/* Live Parcel & Fleet Tracking Widget */}
      <LiveTracking />

      {/* Milestone Lifecycle Pipeline */}
      <ShipmentLifecycle />

      {/* Global Port & Airport Coverage Map */}
      <GlobalCoverage />

      {/* AI Telemetry Command Center */}
      <AICommandCenter />

      {/* Logistics Infrastructure */}
      <LogisticsInfrastructure />

      {/* 4-Step Process */}
      <HowItWorks />

      {/* Action CTA */}
      <FinalCTA />

      {/* Navigation Footer */}
      <Footer />
    </main>
  );
}

export default HomeClient;