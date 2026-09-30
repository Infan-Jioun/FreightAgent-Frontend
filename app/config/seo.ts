import type { Metadata } from "next";

export const SITE_CONFIG = {
  name: "FreightAgent",
  legalName: "FreightAgent Global Logistics Inc.",
  tagline: "Autonomous Multi-Modal Freight & Real-Time Logistics Intelligence",
  title: "FreightAgent | Next-Gen AI Freight & Global Logistics Management",
  description:
    "Enterprise AI-powered freight management platform. Instant multi-modal ocean liner & air cargo quoting, zero-hold customs brokerage, GPS telematics, and real-time container tracking across 140+ countries.",
  url: process.env.NEXT_PUBLIC_APP_URL || "https://freightagent.vercel.app",
  locale: "en_US",
  twitterHandle: "@freightagent",
  themeColor: "#00c9a7",
  backgroundColor: "#0a0f0f",
  keywords: [
    "FreightAgent",
    "freight management platform",
    "AI freight forwarding",
    "b2b logistics platform",
    "ocean liner freight FCL LCL",
    "air freight cargo charters",
    "intermodal trucking drayage",
    "automated customs clearance",
    "real-time container tracking",
    "freight rate calculator",
    "telematics shipment tracking",
    "cold chain pharma logistics",
    "bonded warehousing 3PL",
    "global maritime freight",
    "cargo logistics software",
  ],
  authors: [
    {
      name: "FreightAgent Operations & Engineering",
      url: process.env.NEXT_PUBLIC_APP_URL || "https://freightagent.vercel.app",
    },
  ],
  creator: "FreightAgent",
  publisher: "FreightAgent Global Logistics Inc.",
  contact: {
    email: "operations@freightagent.com",
    phone: "+31 10 798 4400",
    address: {
      streetAddress: "Maasvlakte 2, Haven 9200",
      addressLocality: "Rotterdam",
      postalCode: "3047 AL",
      addressCountry: "NL",
    },
  },
  socialLinks: [
    "https://twitter.com/freightagent",
    "https://linkedin.com/company/freightagent",
    "https://github.com/freightagent",
  ],
};

export interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
  ogType?: "website" | "article";
  image?: {
    url: string;
    width: number;
    height: number;
    alt: string;
  };
}

/**
 * Generates production-grade, strictly typed metadata for any route.
 */
export function createPageMetadata({
  title,
  description,
  path = "",
  keywords = [],
  noIndex = false,
  ogType = "website",
  image,
}: PageMetadataOptions): Metadata {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const canonicalUrl = `${SITE_CONFIG.url}${cleanPath === "/" ? "" : cleanPath}`;
  const allKeywords = Array.from(new Set([...keywords, ...SITE_CONFIG.keywords]));

  const ogImages = image
    ? [
        {
          url: image.url,
          width: image.width,
          height: image.height,
          alt: image.alt,
        },
      ]
    : [
        {
          url: `${SITE_CONFIG.url}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: `${title} | FreightAgent Logistics`,
        },
      ];

  return {
    title,
    description,
    keywords: allKeywords,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          nocache: true,
          googleBot: {
            index: false,
            follow: false,
            noimageindex: true,
          },
        }
      : {
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
      type: ogType,
      locale: SITE_CONFIG.locale,
      url: canonicalUrl,
      siteName: SITE_CONFIG.name,
      title: `${title} | FreightAgent`,
      description,
      images: ogImages,
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | FreightAgent`,
      description,
      creator: SITE_CONFIG.twitterHandle,
      site: SITE_CONFIG.twitterHandle,
      images: ogImages.map((img) => img.url),
    },
  };
}
