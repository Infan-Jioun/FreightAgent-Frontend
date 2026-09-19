"use client";

import React from "react";
import {
    Eye,
    RefreshCw,
    UserCheck,
    Loader2,
    Package,
} from "lucide-react";
import { IShipment, ShipmentStatus } from "@/app/types/shipment.types";
import { PaymentStatusBadge } from "@/components/ui/status-badge";
import { DataTableWrapper } from "@/components/ui/DataTableWrapper";
import { PaginationBar } from "@/components/ui/PaginationBar";

export interface ShipmentTableProps {
    shipments: IShipment[];
    loading: boolean;
    isAdmin: boolean;
    onViewDetails: (shipment: IShipment) => void;
    onOpenStatusModal: (shipment: IShipment) => void;
    onOpenAssignModal: (shipment: IShipment) => void;
    onOpenRefundModal: (shipment: IShipment) => void;
    onOpenDeleteModal: (shipment: IShipment) => void;
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
}

export const getShipmentStatusStyle = (status: ShipmentStatus) => {
    switch (status) {
        case "DELIVERED":
            return "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/40";
        case "IN_TRANSIT":
        case "OUT_FOR_DELIVERY":
            return "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/40";
        case "PICKED_UP":
            return "bg-[#6366f1]/15 text-[#818cf8] border-[#6366f1]/40";
        case "AT_CUSTOMS":
            return "bg-[#ec4899]/15 text-[#f472b6] border-[#ec4899]/40";
        case "PENDING":
            return "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/40";
        case "CANCELLED":
            return "bg-[#ff6b6b]/15 text-[#ff6b6b] border-[#ff6b6b]/40";
        default:
            return "bg-[#1a4a4a]/40 text-[#7ecfc4] border-[#1a4a4a]";
    }
};

export function ShipmentTable({
    shipments,
    loading,
    isAdmin,
    onViewDetails,
    onOpenStatusModal,
    onOpenAssignModal,
    onOpenRefundModal,
    onOpenDeleteModal,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    onPageChange,
}: ShipmentTableProps) {
    return (
        <DataTableWrapper>
            <table className="w-full text-left text-xs">
                <thead>
                    <tr className="border-b border-[#1a4a4a] bg-[#0a1a1a]/50 text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider">
                        <th className="py-3.5 px-4">Tracking Waybill</th>
                        <th className="py-3.5 px-4">Route</th>
                        <th className="py-3.5 px-4">Status</th>
                        <th className="py-3.5 px-4">Payment</th>
                        <th className="py-3.5 px-4">Carrier Agent</th>
                        <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[#1a4a4a]/40">
                    {loading ? (
                        <tr>
                            <td colSpan={6} className="py-12 text-center">
                                <Loader2 size={28} className="mx-auto text-[#00c9a7] animate-spin mb-2" />
                                <p className="text-xs font-semibold text-[#7ecfc4]">
                                    Loading consignments from network...
                                </p>
                            </td>
                        </tr>
                    ) : shipments.length === 0 ? (
                        <tr>
                            <td colSpan={6} className="py-12 text-center">
                                <Package size={36} className="mx-auto text-[#3a6b66] mb-2" />
                                <p className="text-xs font-bold text-[#e0faf5]">No consignments match current filter</p>
                                <p className="text-[11px] text-[#7ecfc4]/70 mt-1">Try resetting the status filter or search query</p>
                            </td>
                        </tr>
                    ) : (
                        shipments.map((item) => (
                            <tr
                                key={item.id}
                                className="hover:bg-[#112a2a]/40 transition-colors group cursor-pointer"
                                onClick={() => onViewDetails(item)}
                            >
                                {/* 1. Tracking ID & Shipper */}
                                <td className="py-3.5 px-4">
                                    <div className="flex flex-col min-w-0">
                                        <span
                                            className="font-mono font-bold text-[#e0faf5] group-hover:text-[#00e5c0] transition-colors truncate max-w-[190px]"
                                            title={`Waybill: ${item.trackingId}`}
                                        >
                                            {item.trackingId.length > 20
                                                ? `${item.trackingId.slice(0, 10)}...${item.trackingId.slice(-6)}`
                                                : item.trackingId}
                                        </span>
                                        <span className="text-[11px] text-[#7ecfc4]/70 truncate max-w-[190px]">
                                            {item.user?.name ? item.user.name : "Guest Shipper"}
                                        </span>
                                    </div>
                                </td>

                                {/* 2. Route Corridor */}
                                <td className="py-3.5 px-4">
                                    <div className="flex items-center gap-1.5 text-[#e0faf5] font-semibold text-xs min-w-0 max-w-[220px]">
                                        <span className="truncate" title={item.origin}>
                                            {item.origin}
                                        </span>
                                        <span className="text-[#00c9a7] shrink-0 font-bold">→</span>
                                        <span className="truncate" title={item.destination}>
                                            {item.destination}
                                        </span>
                                    </div>
                                </td>

                                {/* 3. Status */}
                                <td className="py-3.5 px-4">
                                    <span
                                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block ${getShipmentStatusStyle(
                                            item.status
                                        )}`}
                                    >
                                        {item.status.replace(/_/g, " ")}
                                    </span>
                                </td>

                                {/* 4. Payment */}
                                <td className="py-3.5 px-4">
                                    <PaymentStatusBadge status={item.paymentStatus} />
                                </td>

                                {/* 5. Assigned Carrier Agent */}
                                <td className="py-3.5 px-4">
                                    {item.assignedAgent ? (
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#e0faf5] truncate max-w-[160px]">
                                            <UserCheck size={13} className="text-[#00c9a7] shrink-0" />
                                            <span className="truncate">{item.assignedAgent.name}</span>
                                        </div>
                                    ) : (
                                        <span className="text-[11px] font-medium text-[#3a6b66] italic">
                                            Unassigned
                                        </span>
                                    )}
                                </td>

                                {/* 6. Actions (Only Primary Details + Quick Status) */}
                                <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <div className="inline-flex items-center gap-2 justify-end">
                                        <button
                                            type="button"
                                            onClick={() => onViewDetails(item)}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-xs font-bold transition-colors cursor-pointer"
                                            title="View full details and management controls"
                                        >
                                            <Eye size={13} />
                                            <span>Details</span>
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onOpenStatusModal(item)}
                                            className="p-1.5 rounded-xl bg-[#112a2a] hover:bg-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] transition-colors cursor-pointer"
                                            title="Update checkpoint status"
                                        >
                                            <RefreshCw size={13} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            <PaginationBar
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={totalCount}
                pageSize={pageSize}
                itemName="consignments"
                onPageChange={onPageChange}
            />
        </DataTableWrapper>
    );
}

export default ShipmentTable;
