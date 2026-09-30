import { redirect } from "next/navigation";
import { ROUTES } from "@/app/constants/routes";

export const dynamic = "force-dynamic";

export default async function NotificationDetailLegacyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  redirect(ROUTES.NOTIFICATION_DETAIL(resolved.id));
}
