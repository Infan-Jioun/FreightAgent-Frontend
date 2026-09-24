// app/about/page.tsx
import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { createPageMetadata, SITE_CONFIG } from "@/app/config/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "About FreightAgent | Global Multi-Modal Logistics & AI Routing",
  description:
    "Learn how FreightAgent connects ocean liner alliances, priority air charters, and cross-border drayage across 140+ countries with AI route optimization.",
  path: "/about",
  keywords: [
    "about FreightAgent",
    "global logistics network",
    "maritime freight corridor",
    "freight AI optimization",
    "FIATA licensed forwarder",
  ],
});

export default function AboutPage() {
  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About FreightAgent",
    description:
      "Enterprise AI-powered multi-modal logistics platform connecting global ocean, air, and ground supply chains.",
    url: `${SITE_CONFIG.url}/about`,
    mainEntity: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      legalName: SITE_CONFIG.legalName,
      url: SITE_CONFIG.url,
      foundingDate: "2024",
      description: SITE_CONFIG.description,
    },
  };

  return (
    <>
      <JsonLd data={aboutSchema} />
      <AboutClient />
    </>
  );
}
