// app/(dashboard)/tracking/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import TrackingClient from "./TrackingClient";
import { createPageMetadata, SITE_CONFIG } from "@/app/config/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "Live Freight & Cargo Tracking | Real-Time Telematics",
  description:
    "Track your multi-modal freight shipments, ocean containers, and air cargo with real-time GPS coordinates, checkpoint milestone logs, and AIS vessel telemetry.",
  path: "/tracking",
  keywords: [
    "freight tracking",
    "container tracking",
    "real time cargo tracking",
    "live vessel AIS tracking",
    "air waybill tracking",
    "shipment status locator",
  ],
});

export default function TrackingPage() {
  const trackingSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FreightAgent Consignment Tracking Radar",
    url: `${SITE_CONFIG.url}/tracking`,
    applicationCategory: "BusinessApplication",
    description: "Real-time multi-modal cargo and container tracking engine.",
    operatingSystem: "All modern web browsers",
  };

  return (
    <>
      <JsonLd data={trackingSchema} />
      <Suspense
        fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-[#1a4a4a] border-t-[#00c9a7] animate-spin" />
              <p className="text-xs text-[#7ecfc4]">Loading tracking details...</p>
            </div>
          </div>
        }
      >
        <TrackingClient />
      </Suspense>
    </>
  );
}
