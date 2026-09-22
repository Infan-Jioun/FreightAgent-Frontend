"use client";

import React from "react";
import { Package, MapPin, Truck } from "lucide-react";
import { StatCard } from "@/components/ui/dashboard/StatCard";
import { cn } from "@/lib/utils";

export interface StatCardsRowProps {
    title?: string;
    dateLabel?: string;
    metrics?: {
        totalShipments?: number | string;
        shipmentsTrend?: string;
        packageTracking?: number | string;
        trackingTrend?: string;
        totalDelivered?: number | string;
        deliveredTrend?: string;
    };
    className?: string;
}

export default function StatCardsRow({
    title = "Tracking Order Summary",
    dateLabel = "Tue, 10 October 2023",
    metrics,
    className = "",
}: StatCardsRowProps): React.JSX.Element {
    return (
        <div className={cn("flex flex-col xl:flex-row xl:items-center justify-between gap-6", className)}>
            {/* Left: Heading & Date Pill */}
            <div className="shrink-0">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#e0faf5] tracking-tight">
                    {title}
                </h1>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] text-[11px] font-medium shadow-xs">
                    <span>{dateLabel}</span>
                </div>
            </div>

            {/* Right: 3 Metric Cards with Uniform Size & Reusable StatCard */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:gap-5 grow">
                <StatCard
                    title="Total Shipments"
                    value={metrics?.totalShipments ?? "876"}
                    icon={Package}
                    variant="teal"
                    trend={{
                        value: metrics?.shipmentsTrend ?? "+3.45%",
                        isPositive: true,
                    }}
                    subtitle="Platform active cargo"
                />

                <StatCard
                    title="Package Tracking"
                    value={metrics?.packageTracking ?? "241"}
                    icon={MapPin}
                    variant="cyan"
                    trend={{
                        value: metrics?.trackingTrend ?? "-2.95%",
                        isPositive: false,
                    }}
                    subtitle="In-transit tracking"
                />

                <StatCard
                    title="Total Delivered"
                    value={metrics?.totalDelivered ?? "1.245"}
                    icon={Truck}
                    variant="amber"
                    trend={{
                        value: metrics?.deliveredTrend ?? "+1.47%",
                        isPositive: true,
                    }}
                    subtitle="Successfully fulfilled"
                />
            </div>
        </div>
    );
}
