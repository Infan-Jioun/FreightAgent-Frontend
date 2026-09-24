// app/quote/page.tsx
import type { Metadata } from "next";
import QuoteClient from "./QuoteClient";
import { createPageMetadata, SITE_CONFIG } from "@/app/config/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "Instant Freight Quote & Spot Rate Calculator",
  description:
    "Calculate instant multi-modal ocean, air, and ground freight rates. Transparent spot market pricing, automated customs estimation, and live transit schedules.",
  path: "/quote",
  keywords: [
    "freight quote calculator",
    "ocean container rates",
    "air freight spot rate",
    "instant logistics quote",
    "container shipping cost",
    "customs clearance fees",
  ],
});

export default function QuotePage() {
  const quoteSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "FreightAgent Instant Freight Rate Calculator",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web Browser",
    url: `${SITE_CONFIG.url}/quote`,
    description: "Real-time spot rate calculator for maritime, air cargo, and drayage freight routes.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      description: "Free instant spot freight estimation tool",
    },
  };

  return (
    <>
      <JsonLd data={quoteSchema} />
      <QuoteClient />
    </>
  );
}
