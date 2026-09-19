import type { Metadata } from "next";
import LocationsPageClient from "./components/LocationsPageClient";


// ─── SEO Metadata ─────────────────────────────────────────
export const metadata: Metadata = {
    title: "Locations | FreightAgent Admin",
    description:
        "Manage sea ports, air ports, and freight terminals. Add, edit, block, or restore shipping locations used across FreightAgent routes and shipments.",
    robots: { index: false, follow: false }, // admin panel — no indexing
    openGraph: {
        title: "Locations | FreightAgent Admin",
        description: "Manage shipping ports and freight terminals.",
        type: "website",
    },
};

export default function LocationsPage() {
    return <LocationsPageClient />;
}