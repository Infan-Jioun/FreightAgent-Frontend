export const dynamic = "force-dynamic";

// app/(auth)/login/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";
import { createPageMetadata } from "@/app/config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Sign In to FreightAgent",
  description: "Sign in to access your freight management dashboard, booking quotes, and real-time shipment telematics.",
  path: "/login",
  noIndex: true,
});

export default function LoginPage() {
  return (
    <div>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-sm text-[#7ecfc4]">
            Loading...
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
