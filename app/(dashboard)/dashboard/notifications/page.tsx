import type { Metadata } from "next";
import NotificationsClient from "./NotificationsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notifications | FreightAgent",
  description: "Operational updates, shipment events, and system alerts.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
