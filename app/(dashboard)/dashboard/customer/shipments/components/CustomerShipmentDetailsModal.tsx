"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    X,
    Weight,
    Calendar,
    MapPin,
    UserCheck,
    Mail,
    Phone,
    FileText,
    Copy,
    Check,
    ArrowRight,
    CreditCard,
    Clock,
    Search,
    Receipt,
    Loader2,
    ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";
import { IShipment } from "@/app/types/shipment.types";
import { StatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";

export interface CustomerShipmentDetailsModalProps {
    shipment: IShipment | null;
    isOpen: boolean;
    onClose: () => void;
    onOpenPayModal?: (shipment: IShipment) => void;
    isCreatingIntent?: boolean;
}

export function CustomerShipmentDetailsModal({
    shipment,
    isOpen,
    onClose,
    onOpenPayModal,
    isCreatingIntent = false,
}: CustomerShipmentDetailsModalProps) {
    const [copied, setCopied] = useState(false);

    if (!isOpen || !shipment) return null;

    const handleCopyWaybill = () => {
        if (!shipment?.trackingId) return;
        void navigator.clipboard.writeText(shipment.trackingId);
        setCopied(true);
        toast.success("Waybill tracking ID copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const formattedCreatedAt = shipment.createdAt
        ? new Date(shipment.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : "N/A";

    const formattedUpdatedAt = shipment.updatedAt
        ? new Date(shipment.updatedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : null;

    const formattedPaidAt = shipment.paidAt
        ? new Date(shipment.paidAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
          })
        : null;

    const isUnpaid =
        (!shipment.paymentStatus ||
            shipment.paymentStatus === "UNPAID" ||
            shipment.paymentStatus === "FAILED") &&
        shipment.status !== "CANCELLED";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
            <div className="w-full max-w-3xl bg-[#0d1f1f] border border-[#1a4a4a] rounded-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                {/* 1. Header with Waybill and Status Badges */}
                <div className="flex items-start justify-between border-b border-[#1a4a4a] pb-4 gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-[#00c9a7] uppercase tracking-wider font-bold">
                                Consignment Waybill
                            </span>
                            <span className="text-[10px] text-[#3a6b66] font-mono">
                                ID: {shipment.id.slice(0, 12)}...
                            </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <h3 className="text-xl font-extrabold text-[#e0faf5] font-mono tracking-tight">
                                {shipment.trackingId}
                            </h3>
                            <button
                                type="button"
                                onClick={handleCopyWaybill}
                                className="p-1.5 rounded-lg bg-[#112a2a] hover:bg-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] transition-colors cursor-pointer"
                                title="Copy Full Waybill"
                            >
                                {copied ? <Check size={13} className="text-[#00e5c0]" /> : <Copy size={13} />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <StatusBadge status={shipment.status} />
                        <PaymentStatusBadge status={shipment.paymentStatus} />
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-xl bg-[#112a2a] hover:bg-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] transition-colors cursor-pointer"
                            title="Close modal"
                        >
                            <X size={16} />
                        </button>
                    </div>
                </div>

                {/* 2. Route Corridor Card */}
                <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#7ecfc4]/70 tracking-wider block">
                            Origin Facility / Port
                        </span>
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[#00c9a7] shrink-0" />
                            <p className="text-xs font-bold text-[#e0faf5] truncate" title={shipment.origin}>
                                {shipment.origin}
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col items-center justify-center shrink-0 px-2">
                        <span className="text-[10px] font-mono text-[#00c9a7]">Transit Route</span>
                        <ArrowRight size={16} className="text-[#00c9a7]" />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#7ecfc4]/70 tracking-wider block">
                            Destination Facility / Port
                        </span>
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[#00b4d8] shrink-0" />
                            <p className="text-xs font-bold text-[#e0faf5] truncate" title={shipment.destination}>
                                {shipment.destination}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Assigned Road Agent & Cargo Specifications */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Assigned Carrier Road Agent (Secondary Detail) */}
                    <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-3">
                        <h4 className="text-xs font-bold text-[#e0faf5] uppercase tracking-wider flex items-center gap-1.5">
                            <UserCheck size={14} className="text-[#00c9a7]" />
                            <span>Carrier Dispatch Agent</span>
                        </h4>

                        {shipment.assignedAgent ? (
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-[#7ecfc4] w-16 shrink-0">Agent:</span>
                                    <span className="font-bold text-[#e0faf5] truncate">
                                        {shipment.assignedAgent.name}
                                    </span>
                                </div>

                                {shipment.assignedAgent.email && (
                                    <div className="flex items-center gap-2">
                                        <Mail size={12} className="text-[#00c9a7] shrink-0" />
                                        <span className="text-[#7ecfc4] truncate font-mono text-[11px]">
                                            {shipment.assignedAgent.email}
                                        </span>
                                    </div>
                                )}

                                {shipment.assignedAgent.phone && (
                                    <div className="flex items-center gap-2">
                                        <Phone size={12} className="text-[#00c9a7] shrink-0" />
                                        <a
                                            href={`tel:${shipment.assignedAgent.phone}`}
                                            className="text-[#00e5c0] hover:underline font-mono text-[11px]"
                                            title="Call Carrier Agent"
                                        >
                                            {shipment.assignedAgent.phone}
                                        </a>
                                    </div>
                                )}

                                {shipment.assignedAgent.assignedArea && (
                                    <div className="pt-1 text-[11px] text-amber-300/90 truncate">
                                        Carrier Corridor: {shipment.assignedAgent.assignedArea}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="p-3 rounded-xl bg-[#112a2a]/40 border border-[#1a4a4a]/40 text-xs space-y-1">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                    Waiting for Assignment
                                </span>
                                <p className="text-[11px] text-[#7ecfc4]/70 pt-1">
                                    Central dispatch authority is assigning a dedicated road carrier agent to your route corridor.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Cargo Specifications */}
                    <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-3">
                        <h4 className="text-xs font-bold text-[#e0faf5] uppercase tracking-wider flex items-center gap-1.5">
                            <Weight size={14} className="text-[#00c9a7]" />
                            <span>Cargo Specifications</span>
                        </h4>

                        <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="p-2.5 rounded-xl bg-[#112a2a]/60 border border-[#1a4a4a]/60">
                                <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Cargo Weight</span>
                                <span className="font-bold text-[#e0faf5] text-sm">
                                    {shipment.weight} <span className="text-xs font-normal text-[#7ecfc4]">kg</span>
                                </span>
                            </div>

                            <div className="p-2.5 rounded-xl bg-[#112a2a]/60 border border-[#1a4a4a]/60">
                                <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Declared Value</span>
                                <span className="font-bold text-amber-300 text-sm">
                                    {shipment.declaredCargoValue ? `$${Number(shipment.declaredCargoValue).toFixed(2)}` : "Not Declared"}
                                </span>
                            </div>
                        </div>

                        {shipment.description && (
                            <div className="p-2.5 rounded-xl bg-[#112a2a]/40 border border-[#1a4a4a]/40 text-xs">
                                <span className="text-[10px] text-[#7ecfc4] block mb-0.5 flex items-center gap-1">
                                    <FileText size={11} />
                                    <span>Cargo Instructions</span>
                                </span>
                                <p className="text-[#e0faf5] font-medium leading-relaxed truncate">
                                    {shipment.description}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Commercial Tariff & Settlement (Secondary Detail) */}
                <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#e0faf5] uppercase tracking-wider flex items-center gap-1.5">
                            <Receipt size={14} className="text-[#00c9a7]" />
                            <span>Commercial Tariff & Payment Settlement</span>
                        </h4>
                        <PaymentStatusBadge status={shipment.paymentStatus} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#112a2a]/40 border border-[#1a4a4a]/40">
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Total Consignment Cost</span>
                            <span className="font-bold text-[#00e5c0] text-sm">
                                {shipment.cost?.totalCost
                                    ? `$${Number(shipment.cost.totalCost).toFixed(2)} ${shipment.cost.currency || "USD"}`
                                    : "Calculated Tariff"}
                            </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#112a2a]/40 border border-[#1a4a4a]/40">
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Settlement Status</span>
                            <span className="font-medium text-[#e0faf5] text-[11px] truncate block">
                                {shipment.paymentStatus === "PAID"
                                    ? "Fully Settled via Stripe"
                                    : "Payment Required for Dispatch"}
                            </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#112a2a]/40 border border-[#1a4a4a]/40">
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Payment Reference</span>
                            <span className="font-mono text-[#7ecfc4] text-[11px] truncate block">
                                {shipment.stripePaymentIntentId
                                    ? `${shipment.stripePaymentIntentId.slice(0, 14)}...`
                                    : formattedPaidAt || "Pending"}
                            </span>
                        </div>
                    </div>

                    {/* Receipt Download Action Banner if Paid */}
                    {shipment.paymentStatus === "PAID" && shipment.invoiceUrl && (
                        <div className="p-3 rounded-xl bg-[#00c9a7]/10 border border-[#00c9a7]/30 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-[#e0faf5]">
                                <FileText size={16} className="text-[#00e5c0] shrink-0" />
                                <span className="font-semibold">Official invoice receipt generated for this booking</span>
                            </div>
                            <a
                                href={shipment.invoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] text-xs font-black transition-all shadow-xs shrink-0"
                            >
                                <FileText size={13} />
                                <span>📄 Download Receipt</span>
                            </a>
                        </div>
                    )}

                    {/* Booking Timestamps */}
                    <div className="pt-2 border-t border-[#1a4a4a]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#7ecfc4]/70">
                        <div className="flex items-center gap-1.5">
                            <Calendar size={11} />
                            <span>Booked: {formattedCreatedAt}</span>
                        </div>
                        {formattedUpdatedAt && (
                            <div className="flex items-center gap-1.5">
                                <Clock size={11} />
                                <span>Last Checkpoint: {formattedUpdatedAt}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 5. Footer Actions */}
                <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-[#1a4a4a]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#112a2a] hover:bg-[#1a4a4a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] transition-colors cursor-pointer"
                    >
                        Close
                    </button>

                    {shipment.paymentStatus === "PAID" && shipment.invoiceUrl && (
                        <a
                            href={shipment.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#00c9a7]/20 hover:bg-[#00c9a7]/30 text-[#00e5c0] border border-[#00c9a7]/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <FileText size={13} />
                            <span>📄 Download Receipt</span>
                        </a>
                    )}

                    {isUnpaid && onOpenPayModal && (
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onOpenPayModal(shipment);
                            }}
                            disabled={isCreatingIntent}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                        >
                            {isCreatingIntent ? (
                                <Loader2 size={13} className="animate-spin" />
                            ) : (
                                <CreditCard size={13} />
                            )}
                            <span>Pay Consignment with Stripe</span>
                        </button>
                    )}

                    <Link
                        href={`/dashboard/customer/tracking?trackingId=${encodeURIComponent(shipment.trackingId)}`}
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                        <Search size={13} />
                        <span>Live GPS Tracking</span>
                        <ArrowRight size={13} />
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default CustomerShipmentDetailsModal;
