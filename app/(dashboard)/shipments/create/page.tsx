import type { Metadata } from "next";
import CreateShipmentClient from "./CreateShipmentClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
    title: "Book Freight Consignment | FreightAgent",
    description: "Schedule a freight consignment dispatch across regional and global corridors.",
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
};

export default function CreateShipmentPage() {
    return <CreateShipmentClient />;
}
