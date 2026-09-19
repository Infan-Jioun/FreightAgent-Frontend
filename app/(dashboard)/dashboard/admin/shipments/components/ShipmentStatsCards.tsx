"use client";

import React from "react";
import { Package, Truck, CheckCircle2, AlertTriangle } from "lucide-react";

export interface ShipmentStatsCardsProps {
    totalCount: number;
    inTransitCount: number;
    deliveredCount: number;
    customsOrPendingCount: number;
}

export function ShipmentStatsCards({
    totalCount,
    inTransitCount,
    deliveredCount,
    customsOrPendingCount,
}: ShipmentStatsCardsProps) {
    return (
        <section aria-label="Shipment Manifest Overview Metrics" className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] transition-all hover:border-[#00c9a7]/40">
                <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Consignments</span>
                    <Package size={16} className="text-[#00c9a7]" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{totalCount}</p>
                <span className="text-[10px] text-[#7ecfc4] font-semibold mt-0.5 block">Across all corridors</span>
            </div>

            <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] transition-all hover:border-[#00b4d8]/40">
                <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">In Transit Live</span>
                    <Truck size={16} className="text-[#00b4d8]" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{inTransitCount}</p>
                <span className="text-[10px] text-[#00b4d8] font-semibold mt-0.5 block">Active on radar</span>
            </div>

            <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] transition-all hover:border-[#00e5c0]/40">
                <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Delivered</span>
                    <CheckCircle2 size={16} className="text-[#00e5c0]" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{deliveredCount}</p>
                <span className="text-[10px] text-[#00e5c0] font-semibold mt-0.5 block">Signed & confirmed</span>
            </div>

            <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] transition-all hover:border-[#fbbf24]/40">
                <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Customs / Pending</span>
                    <AlertTriangle size={16} className="text-[#fbbf24]" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{customsOrPendingCount}</p>
                <span className="text-[10px] text-[#fbbf24] font-semibold mt-0.5 block">Requires attention</span>
            </div>
        </section>
    );
}

export default ShipmentStatsCards;
