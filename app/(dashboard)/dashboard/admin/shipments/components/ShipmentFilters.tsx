"use client";

import React from "react";
import { ShipmentStatus } from "@/app/types/shipment.types";
import { SearchBar } from "@/components/ui/SearchBar";
import type { StatusFilterOption } from "@/app/types/interface";

export type { StatusFilterOption };

export const ALL_STATUSES: StatusFilterOption[] = [
    { label: "All Statuses", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Assigned", value: "ASSIGNED" },
    { label: "Accepted", value: "ACCEPTED" },
    { label: "Picked Up", value: "PICKED_UP" },
    { label: "In Transit", value: "IN_TRANSIT" },
    { label: "At Customs", value: "AT_CUSTOMS" },
    { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
];

export interface ShipmentFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    statusFilter: ShipmentStatus | "ALL";
    onStatusChange: (status: ShipmentStatus | "ALL") => void;
}

export function ShipmentFilters({
    searchQuery,
    onSearchChange,
    statusFilter,
    onStatusChange,
}: ShipmentFiltersProps) {
    return (
        <section
            aria-label="Shipment Manifest Filtering and Search"
            className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg shadow-black/20"
        >
            {/* Status Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] w-full md:w-auto overflow-x-auto custom-modal-scrollbar">
                {ALL_STATUSES.map((s) => {
                    const isActive = statusFilter === s.value;
                    return (
                        <button
                            key={s.value}
                            type="button"
                            onClick={() => onStatusChange(s.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                                isActive
                                    ? "bg-[#00c9a7] text-[#0a0f0f] shadow-xs"
                                    : "text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]/60"
                            }`}
                        >
                            {s.label}
                        </button>
                    );
                })}
            </div>

            {/* SearchBar Component */}
            <div className="w-full md:w-80">
                <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Search tracking, origin, destination..."
                    className="w-full"
                />
            </div>
        </section>
    );
}

export default ShipmentFilters;
