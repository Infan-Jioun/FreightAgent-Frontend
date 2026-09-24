import type { Metadata } from "next";
import ShipmentsClient from "./ShipmentsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Consignments & Cargo Manifests | FreightAgent",
    description: "Manage, track, and monitor active freight consignments across the corridor network.",
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
};

export default function ShipmentsPage() {
    return <ShipmentsClient />;
}
