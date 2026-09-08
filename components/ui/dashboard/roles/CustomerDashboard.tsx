"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import StatCardsRow from "@/components/ui/dashboard/StatCardsRow";
import OrderControlBar from "@/components/ui/dashboard/OrderControlBar";
import OrderCardsList, {
    INITIAL_ORDERS,
    ShipmentOrder,
} from "@/components/ui/dashboard/OrderCardsList";
import RouteMapWidget from "@/components/ui/dashboard/RouteMapWidget";
import PackageStatusTimeline from "@/components/ui/dashboard/PackageStatusTimeline";
import TransportationCard from "@/components/ui/dashboard/TransportationCard";
import DriverStatisticCard from "@/components/ui/dashboard/DriverStatisticCard";
import WorkingTimeChart from "@/components/ui/dashboard/WorkingTimeChart";

export default function CustomerDashboard() {
    const [selectedOrder, setSelectedOrder] = useState<ShipmentOrder>(
        INITIAL_ORDERS[0]
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="space-y-5 pb-8"
        >
            {/* Top Row: Tracking Order Summary & 3 Metric Cards */}
            <StatCardsRow />

            {/* Sub Bar: Order List Database & Action Buttons */}
            <OrderControlBar pendingCount={5} />

            {/* Main 3-Column Grid Matching Reference Design */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                {/* Column 1: Shipment Order Cards List (Left) */}
                <div className="lg:col-span-4">
                    <OrderCardsList
                        selectedOrderId={selectedOrder.id}
                        onSelectOrder={(order) => setSelectedOrder(order)}
                    />
                </div>

                {/* Column 2: Vector Route Map & Package Status Timeline (Center) */}
                <div className="lg:col-span-4 space-y-5">
                    <RouteMapWidget
                        orderCode={selectedOrder.code.replace("ID: ", "")}
                        routeText="New York - Delaware"
                        totalPackages={230}
                        deliveryDate="Thu, 14 October, 2023"
                        weight="2.415 lbs"
                    />
                    <PackageStatusTimeline />
                </div>

                {/* Column 3: Deigo Transportation, Driver Statistic, Working Time Chart (Right) */}
                <div className="lg:col-span-4 space-y-5">
                    <TransportationCard />
                    <DriverStatisticCard />
                    <WorkingTimeChart />
                </div>
            </div>
        </motion.div>
    );
}
