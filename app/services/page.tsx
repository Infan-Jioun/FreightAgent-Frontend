import type { Metadata } from "next";
import ServicesClient from "./ServicesClient";
import { SERVICES_DATA } from "./servicesData";
import { createPageMetadata, SITE_CONFIG } from "@/app/config/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "Global Freight Services | Ocean Liner, Air Cargo & Customs",
  description:
    "Explore FreightAgent's multi-modal freight capabilities: Ocean Liner (FCL/LCL), Air Cargo Charters, Overland Intermodal Drayage, Smart 3PL Warehousing, and AI Customs Brokerage.",
  path: "/services",
  keywords: [
    "ocean liner freight",
    "FCL LCL container shipping",
    "air freight charter",
    "intermodal drayage",
    "customs clearance broker",
    "cold chain pharma logistics",
    "bonded warehousing",
  ],
});

export default function ServicesPage() {
  const servicesSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "FreightAgent Logistics Services",
    description: "Multi-modal international shipping and customs solutions.",
    itemListElement: SERVICES_DATA.map((service, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Service",
        name: service.name,
        serviceType: service.category,
        description: service.summary,
        provider: {
          "@type": "Organization",
          name: SITE_CONFIG.name,
          url: SITE_CONFIG.url,
        },
        areaServed: "Worldwide",
      },
    })),
  };

  return (
    <>
      <JsonLd data={servicesSchema} />
      <ServicesClient />
    </>
  );
}
