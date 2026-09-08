"use client";

import MaritimeRouteTrackingWidget from "./MaritimeRouteTrackingWidget";

interface RouteMapWidgetProps {
    orderCode?: string;
    routeText?: string;
    totalPackages?: number;
    deliveryDate?: string;
    weight?: string;
}

export default function RouteMapWidget({
    orderCode = "#26277886-ID-KL",
    routeText = "Chattogram Port (BD) ➔ Shanghai Port (CN)",
    totalPackages = 230,
    deliveryDate = "Thu, 15 October, 2023",
    weight = "16,400 TEU",
}: RouteMapWidgetProps) {
    return <MaritimeRouteTrackingWidget />;
}
