// app/(auth)/verify-email/page.tsx
import type { Metadata } from "next";
import VerifyEmailClient from "./VerifyEmailClient";
import { createPageMetadata } from "@/app/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Verify Email | FreightAgent",
  description: "Verify your email address to activate your FreightAgent logistics account.",
  path: "/verify-email",
  noIndex: true,
});

export default function VerifyEmailPage() {
  return <VerifyEmailClient />;
}