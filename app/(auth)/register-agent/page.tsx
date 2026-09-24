// app/(auth)/register-agent/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterAgentClient } from "./RegisterAgentClient";
import { createPageMetadata, SITE_CONFIG } from "@/app/config/seo";

export const metadata: Metadata = createPageMetadata({
    title: "Register as Logistics Agent | FreightAgent Global Dispatch Network",
    description:
        "Join FreightAgent as an accredited freight forwarding and logistics routing agent. Configure operational shipping corridors across 225+ maritime sea ports and air terminals.",
    path: "/register-agent",
    keywords: [
        "freight agent registration",
        "logistics agent",
        "cargo forwarding agent",
        "trade corridors",
        "shipping hub routing",
        "ocean freight forwarder",
        "air cargo terminal dispatcher",
        "container tracking network",
    ],
});

const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebPage",
            "@id": `${SITE_CONFIG.url}/register-agent#webpage`,
            "url": `${SITE_CONFIG.url}/register-agent`,
            "name": "Register as Logistics Agent | FreightAgent",
            "description":
                "Accredited logistics agent registration portal for FreightAgent Global Freight & Consignment Manifest.",
            "isPartOf": {
                "@type": "WebSite",
                "name": SITE_CONFIG.name,
                "url": SITE_CONFIG.url,
            },
            "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": `${SITE_CONFIG.url}/`,
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Register as Agent",
                        "item": `${SITE_CONFIG.url}/register-agent`,
                    },
                ],
            },
        },
        {
            "@type": "Service",
            "name": "FreightAgent Logistics Network Accreditation",
            "serviceType": "Freight Forwarding & Cargo Dispatch Network",
            "provider": {
                "@type": "Organization",
                "name": SITE_CONFIG.name,
                "url": SITE_CONFIG.url,
            },
        },
    ],
};

function RegisterLoadingFallback(): React.JSX.Element {
    return (
        <div
            className="min-h-screen w-full flex items-center justify-center p-6"
            style={{ background: "var(--bg-primary)" }}
        >
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-teal-400/30 border-t-teal-400 animate-spin" />
                <span className="text-xs font-mono text-teal-400/80">
                    Loading agent registration portal...
                </span>
            </div>
        </div>
    );
}

export default function RegisterAgentPage(): React.JSX.Element {
    return (
        <main className="min-h-screen w-full">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <Suspense fallback={<RegisterLoadingFallback />}>
                <RegisterAgentClient />
            </Suspense>
        </main>
    );
}
