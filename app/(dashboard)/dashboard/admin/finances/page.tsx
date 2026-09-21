import type { Metadata } from "next";
import AdminFinancesClient from "./components/AdminFinancesClient";

export const metadata: Metadata = {
    title: "Financial Analytics & Treasury | Admin Console | FreightAgent",
    description:
        "Global corporate financial analytics, platform revenue breakdown, carrier payout audits, and transaction ledgers.",
    robots: { index: false, follow: false },
};

export default function AdminFinancesPage() {
    return <AdminFinancesClient />;
}
