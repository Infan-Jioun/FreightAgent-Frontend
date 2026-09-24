// app/(dashboard)/layout.tsx
import type { Metadata } from "next";
import DashboardShell from "./DashboardShell";

export const metadata: Metadata = {
    title: {
        default: "Freight Management Console",
        template: "%s | FreightAgent Console",
    },
    robots: {
        index: false,
        follow: false,
        nocache: true,
        googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
        },
    },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <DashboardShell>{children}</DashboardShell>;
}