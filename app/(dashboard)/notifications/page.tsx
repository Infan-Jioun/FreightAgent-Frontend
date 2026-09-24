import type { Metadata } from "next";
import NotificationsClient from "./NotificationsClient";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notification Center | FreightAgent",
  description: "View and manage all real-time dispatches, system alerts, and consignment updates.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
