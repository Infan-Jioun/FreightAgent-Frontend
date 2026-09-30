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

export default async function NotificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  return <NotificationDetailClient id={resolved.id} params={params} />;
}
