export const dynamic = "force-dynamic";

// app/(auth)/forgot-password/page.tsx
import type { Metadata } from "next";
import ForgotPasswordClient from "./ForgotPasswordClient";
import { createPageMetadata } from "@/app/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Forgot Password | FreightAgent",
  description: "Request a password reset code for your FreightAgent account.",
  path: "/forgot-password",
  noIndex: true,
});

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
