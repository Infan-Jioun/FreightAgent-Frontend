import type { Metadata } from "next";
import ShipmentDetailRedirectClient from "./ShipmentDetailRedirectClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Consignment Detail | FreightAgent",
  description: "Locating and navigating to operational consignment dossier.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default async function ShipmentDetailGatewayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolved = await params;
  return <ShipmentDetailRedirectClient id={resolved.id} />;
}
