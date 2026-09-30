// app/contact/page.tsx
import type { Metadata } from "next";
import ContactClient from "./ContactClient";
import { OFFICES } from "./officesData";
import { createPageMetadata, SITE_CONFIG } from "@/app/config/seo";
import { JsonLd } from "@/components/seo/JsonLd";

export const metadata: Metadata = createPageMetadata({
  title: "Contact 24/7 Operations Desk & Global Control Towers",
  description:
    "Get in touch with FreightAgent global dispatch operations. 24/7 assistance across Rotterdam, Singapore, Dubai, New York, and Chittagong logistics control hubs.",
  path: "/contact",
  keywords: [
    "contact FreightAgent",
    "freight operations hotline",
    "logistics support desk",
    "emergency air cargo dispatch",
    "customs clearance help",
  ],
});

export default function ContactPage() {
  const contactSchema = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact FreightAgent Operations",
    description: "24/7 dispatch and regional freight assistance control desks.",
    url: `${SITE_CONFIG.url}/contact`,
    mainEntity: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.url,
      telephone: SITE_CONFIG.contact.phone,
      email: SITE_CONFIG.contact.email,
      contactPoint: OFFICES.map((office) => ({
        "@type": "ContactPoint",
        contactType: office.role,
        telephone: office.phone,
        email: office.email,
        areaServed: office.city,
        availableLanguage: ["English"],
      })),
    },
  };

  return (
    <>
      <JsonLd data={contactSchema} />
      <ContactClient />
    </>
  );
}
