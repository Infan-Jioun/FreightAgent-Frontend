import type { Metadata } from "next";
import ShipmentsRedirectClient from "./ShipmentsRedirectClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consignments & Cargo Manifests | FreightAgent",
  description: "Directing to your designated consignment and manifest console.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function ShipmentsGatewayPage() {
  return <ShipmentsRedirectClient />;
}
