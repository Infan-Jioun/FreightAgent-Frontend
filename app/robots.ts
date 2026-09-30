// app/robots.ts
import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/app/config/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/about",
          "/services",
          "/quote",
          "/contact",
          "/tracking",
          "/opengraph-image",
          "/twitter-image",
        ],
        disallow: [
          "/dashboard/",
          "/admin/",
          "/profile",
          "/settings",
          "/shipments",
          "/api/",
          "/login",
          "/register",
          "/register-agent",
          "/forgot-password",
          "/reset-password",
          "/verify-email",
          "/google/",
        ],
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    host: SITE_CONFIG.url,
  };
}
