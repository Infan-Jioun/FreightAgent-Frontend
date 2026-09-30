export const dynamic = "force-dynamic";

// app/(auth)/reset-password/page.tsx
import type { Metadata } from "next";
import ResetPasswordClient from "./ResetPasswordClient";
import { createPageMetadata } from "@/app/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Reset Password | FreightAgent",
  description: "Set a new secure password for your FreightAgent account.",
  path: "/reset-password",
  noIndex: true,
});

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
