import type { Metadata } from "next";
import SettingsClient from "./SettingsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Account Settings & Preferences | FreightAgent",
    description: "Manage regional dispatch preferences, telemetry notifications, and security credentials.",
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
};

export default function SettingsPage() {
    return <SettingsClient />;
}
