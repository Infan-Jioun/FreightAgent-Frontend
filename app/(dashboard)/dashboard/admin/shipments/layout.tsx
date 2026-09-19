import type { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
    title: "Shipment Manifest & Operations | FreightAgent Admin",
    description:
        "Central dispatch authority console for managing platform freight consignments, agent dispatches, tracking lifecycles, and customs clearances.",
    robots: { index: false, follow: false },
    openGraph: {
        title: "Shipment Manifest & Operations | FreightAgent Admin",
        description: "Central dispatch authority for tracking global consignments and road agent assignments.",
        type: "website",
    },
};

interface AdminShipmentsLayoutProps {
    children: React.ReactNode;
}

export default function AdminShipmentsLayout({ children }: AdminShipmentsLayoutProps) {
    return <>{children}</>;
}
