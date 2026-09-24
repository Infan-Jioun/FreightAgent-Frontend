import type { Metadata } from "next";
import NotificationDetailClient from "./NotificationDetailClient";


export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Notification Details | FreightAgent",
  description: "View specific operational notification details, payload metadata, and transit milestones.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  return <NotificationDetailClient params={params} />;
}
