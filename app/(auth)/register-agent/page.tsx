import type { Metadata } from "next";
import { Suspense } from "react";
import { RegisterAgentClient } from "./RegisterAgentClient";

// ─── SEO Metadata ─────────────────────────────────────────────────────────────
export const metadata: Metadata = {
    title: "Register as Logistics Agent | FreightAgent Global Dispatch Network",
    description:
        "Join FreightAgent as an accredited freight forwarding and logistics routing agent. Configure your operational shipping corridors across 225+ maritime sea ports and air terminals, claim freight manifests, and access real-time shipment radar.",
    keywords: [
        "freight agent registration",
        "logistics agent",
        "cargo forwarding agent",
        "trade corridors",
        "shipping hub routing",
        "ocean freight forwarder",
        "air cargo terminal dispatcher",
        "container tracking network",
        "FreightAgent accreditation",
    ],
    authors: [{ name: "FreightAgent Global Logistics Platform" }],
    creator: "FreightAgent Global Logistics",
    publisher: "FreightAgent",
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        canonical: "/register-agent",
    },
    openGraph: {
        title: "Register as Logistics Agent | FreightAgent Global Dispatch",
        description:
            "Become an accredited logistics agent on the FreightAgent network. Define your operational shipping lanes across 225+ global shipping hubs and access live consignment radar.",
        url: "/register-agent",
        siteName: "FreightAgent Logistics Platform",
        locale: "en_US",
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "Register as Logistics Agent | FreightAgent",
        description:
            "Join FreightAgent's global logistics routing network. Set up operational trade corridors across 225+ sea and air terminals.",
    },
};

// ─── JSON-LD Structured Data Schema for Search Engines ───────────────────────
const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebPage",
            "@id": "/register-agent#webpage",
            "url": "/register-agent",
            "name": "Register as Logistics Agent | FreightAgent",
            "description":
                "Accredited logistics agent registration portal for FreightAgent Global Freight & Consignment Manifest.",
            "isPartOf": {
                "@type": "WebSite",
                "name": "FreightAgent Logistics Platform",
                "url": "/",
            },
            "breadcrumb": {
                "@type": "BreadcrumbList",
                "itemListElement": [
                    {
                        "@type": "ListItem",
                        "position": 1,
                        "name": "Home",
                        "item": "/",
                    },
                    {
                        "@type": "ListItem",
                        "position": 2,
                        "name": "Register as Agent",
                        "item": "/register-agent",
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
                "name": "FreightAgent Global Logistics Platform",
            },
            "termsOfService": "/terms",
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
            {/* Structured data injection for Rich Snippets */}
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
