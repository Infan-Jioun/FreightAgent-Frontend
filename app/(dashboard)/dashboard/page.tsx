import type { Metadata } from "next";
import DashboardRedirectClient from "./DashboardRedirectClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Console Gateway | FreightAgent",
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
};

export default function DashboardRootPage() {
    return <DashboardRedirectClient />;
}