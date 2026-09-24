// app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import LenisProvider from "./providers/LenisProvider";
import { SITE_CONFIG } from "./config/seo";
import { JsonLd, getOrganizationSchema, getWebSiteSchema } from "@/components/seo/JsonLd";
const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const viewport: Viewport = {
  themeColor: "#0a0f0f",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_CONFIG.url),
  title: {
    default: SITE_CONFIG.title,
    template: "%s | FreightAgent",
  },
  description: SITE_CONFIG.description,
  keywords: [...SITE_CONFIG.keywords],
  authors: [...SITE_CONFIG.authors],
  creator: SITE_CONFIG.creator,
  publisher: SITE_CONFIG.publisher,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: SITE_CONFIG.locale,
    url: SITE_CONFIG.url,
    siteName: SITE_CONFIG.name,
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: SITE_CONFIG.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_CONFIG.title,
    description: SITE_CONFIG.description,
    creator: SITE_CONFIG.twitterHandle,
    site: SITE_CONFIG.twitterHandle,
    images: ["/twitter-image"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark"
      style={{ colorScheme: "dark", backgroundColor: "#0a0f0f" }}
      suppressHydrationWarning
    >
      <body
        className={`${geist.variable} antialiased bg-[#0a0f0f] text-[#e0faf5] selection:bg-[#00c9a7]/30 selection:text-[#00e5c0]`}
      >

        <JsonLd data={getOrganizationSchema()} />
        <JsonLd data={getWebSiteSchema()} />

        <LenisProvider>
          <div className="min-h-screen bg-[#0a0f0f]">{children}</div>
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