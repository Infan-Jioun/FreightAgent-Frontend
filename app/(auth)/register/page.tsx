// app/(auth)/register/page.tsx
import type { Metadata } from "next";
import RegisterClient from "./RegisterClient";
import { createPageMetadata } from "@/app/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Create Account | FreightAgent",
  description: "Create your FreightAgent account to manage international container freight, air shipments, and automated customs filing.",
  path: "/register",
  noIndex: true,
});

export default function RegisterPage() {
  return <RegisterClient />;
}