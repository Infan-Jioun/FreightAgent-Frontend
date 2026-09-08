// app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import LenisProvider from "./providers/LenisProvider";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: {
    default: "FreightAgent",
    template: "%s | FreightAgent",
  },
  description: "B2B AI-powered freight management platform",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" style={{ colorScheme: "dark", backgroundColor: "#0a0f0f" }} suppressHydrationWarning>
      <body className={`${geist.variable} antialiased bg-[#0a0f0f] text-[#e0faf5] selection:bg-[#00c9a7]/30 selection:text-[#00e5c0]`}>
        <LenisProvider>
          <div className="min-h-screen bg-[#0a0f0f]">
            {children}
          </div>
        </LenisProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
              color: "var(--text-primary)",
            },
          }}
        />
      </body>
    </html>
  );
}