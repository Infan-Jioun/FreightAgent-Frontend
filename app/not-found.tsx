import type { Metadata } from "next";
import { NotFoundClient } from "./components/NotFoundClient";
import { createPageMetadata } from "./config/seo";

export const metadata: Metadata = createPageMetadata({
  title: "404 - Waypoint Not Found | Telemetry Lost",
  description:
    "The requested freight manifest, vessel route, or waypoint sector does not exist in the active logistics registry or has drifted outside charted maritime corridors.",
  noIndex: true,
});

export default function NotFound() {
  return <NotFoundClient />;
}
