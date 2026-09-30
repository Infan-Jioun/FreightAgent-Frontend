import { redirect } from "next/navigation";
import { ROUTES } from "@/app/constants/routes";

export const dynamic = "force-dynamic";

export default function NotificationsLegacyPage() {
  redirect(ROUTES.NOTIFICATIONS);
}
