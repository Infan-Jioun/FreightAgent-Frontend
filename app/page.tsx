// app/page.tsx
import type { Metadata } from "next";
import { HomeClient } from "./components/HomeClient";
import { createPageMetadata, SITE_CONFIG } from "./config/seo";
import { JsonLd, getSoftwareApplicationSchema } from "@/components/seo/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "AI-Powered B2B Freight Management & Logistics Platform",
  description:
    "Streamline global supply chains with FreightAgent. Instant freight quoting, AI route planning, real-time multi-modal tracking, and border-cleared customs brokerage.",
  path: "/",
  keywords: [
    "AI freight forwarding",
    "global logistics software",
    "container shipping platform",
    "freight quoting engine",
    "maritime cargo tracking",
  ],
});

export default function HomePage() {
  return (
    <>
      <JsonLd data={getSoftwareApplicationSchema()} />
      <HomeClient />
    </>
  );
}