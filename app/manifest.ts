// app/manifest.ts
import type { MetadataRoute } from "next";
import { SITE_CONFIG } from "@/app/config/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "FreightAgent Logistics Platform",
    short_name: "FreightAgent",
    description: SITE_CONFIG.description,
    start_url: "/",
    display: "standalone",
    background_color: SITE_CONFIG.backgroundColor,
    theme_color: SITE_CONFIG.themeColor,
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
