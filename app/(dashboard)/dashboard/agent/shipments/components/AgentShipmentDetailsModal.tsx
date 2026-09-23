"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    X,
    Weight,
    Calendar,
    MapPin,
    User,
    Mail,
    Phone,
    DollarSign,
    ShieldCheck,
    FileText,
    Copy,
    Check,
    ArrowRight,
    CheckSquare,
    Clock,
    Truck,
    Receipt,
} from "lucide-react";
import { toast } from "sonner";
import { IShipment } from "@/app/types/shipment.types";
import { PaymentStatusBadge, StatusBadge } from "@/components/ui/status-badge";
import { Modal } from "@/components/ui/Modal";

export interface AgentShipmentDetailsModalProps {
    shipment: IShipment | null;
    isOpen: boolean;
    onClose: () => void;
    onOpenAcceptModal?: (shipment: IShipment) => void;
}

export function AgentShipmentDetailsModal({
    shipment,
    isOpen,
    onClose,
    onOpenAcceptModal,
}: AgentShipmentDetailsModalProps) {
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

    return (
        <Modal
            isOpen={!!shipment}
            onClose={onClose}
            maxWidth="3xl"
            showCloseButton={false}
        >
            <div className="space-y-5">
                {/* 1. Header with Waybill and Status */}
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
                            Origin Dispatch Terminal
                        </span>
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[#00c9a7] shrink-0" />
                            <p className="text-xs font-bold text-[#e0faf5] truncate" title={shipment.origin}>
                                {shipment.origin}
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex flex-col items-center justify-center shrink-0 px-2">
                        <span className="text-[10px] font-mono text-[#00c9a7]">Corridor</span>
                        <ArrowRight size={16} className="text-[#00c9a7]" />
                    </div>

                    <div className="space-y-1 flex-1 min-w-0">
                        <span className="text-[10px] uppercase font-bold text-[#7ecfc4]/70 tracking-wider block">
                            Destination Terminal
                        </span>
                        <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-[#00b4d8] shrink-0" />
                            <p className="text-xs font-bold text-[#e0faf5] truncate" title={shipment.destination}>
                                {shipment.destination}
                            </p>
                        </div>
                    </div>
                </div>

                {/* 3. Specifications & Customer Profile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Cargo Specs */}
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
                                    <span>Cargo Manifest / Instructions</span>
                                </span>
                                <p className="text-[#e0faf5] font-medium leading-relaxed">
                                    {shipment.description}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Customer Contact */}
                    <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-3">
                        <h4 className="text-xs font-bold text-[#e0faf5] uppercase tracking-wider flex items-center gap-1.5">
                            <User size={14} className="text-[#00c9a7]" />
                            <span>Shipper / Merchant Contact</span>
                        </h4>

                        <div className="space-y-2 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="text-[11px] text-[#7ecfc4] w-16 shrink-0">Name:</span>
                                <span className="font-bold text-[#e0faf5] truncate">
                                    {shipment.user?.name || "Merchant Shipper"}
                                </span>
                            </div>

                            {shipment.user?.email && (
                                <div className="flex items-center gap-2">
                                    <Mail size={12} className="text-[#00c9a7] shrink-0" />
                                    <span className="text-[#7ecfc4] truncate font-mono text-[11px]">
                                        {shipment.user.email}
                                    </span>
                                </div>
                            )}

                            {shipment.user?.phone ? (
                                <div className="flex items-center gap-2">
                                    <Phone size={12} className="text-[#00c9a7] shrink-0" />
                                    <a
                                        href={`tel:${shipment.user.phone}`}
                                        className="text-[#00e5c0] hover:underline font-mono text-[11px]"
                                        title="Call Customer"
                                    >
                                        {shipment.user.phone}
                                    </a>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2 text-[#7ecfc4]/50 text-[11px]">
                                    <Phone size={12} className="shrink-0" />
                                    <span>No direct phone on record</span>
                                </div>
                            )}
                        </div>

                        {/* Booking & Assigned Timestamp */}
                        <div className="pt-2 border-t border-[#1a4a4a]/60 space-y-1 text-[11px] text-[#7ecfc4]/70">
                            <div className="flex items-center gap-1.5">
                                <Calendar size={11} />
                                <span>Booked: {formattedCreatedAt}</span>
                            </div>
                            {formattedUpdatedAt && (
                                <div className="flex items-center gap-1.5">
                                    <Clock size={11} />
                                    <span>Last Status Update: {formattedUpdatedAt}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Payment & Commercial Settlement Details (Secondary Info) */}
                <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[#e0faf5] uppercase tracking-wider flex items-center gap-1.5">
                            <Receipt size={14} className="text-[#00c9a7]" />
                            <span>Commercial & Payment Settlement</span>
                        </h4>
                        <PaymentStatusBadge status={shipment.paymentStatus} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div className="p-2.5 rounded-xl bg-[#112a2a]/40 border border-[#1a4a4a]/40">
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Total Consignment Cost</span>
                            <span className="font-bold text-[#00e5c0] text-sm">
                                {shipment.cost?.totalCost
                                    ? `$${Number(shipment.cost.totalCost).toFixed(2)} ${shipment.cost.currency || "USD"}`
                                    : "Included in Tariff"}
                            </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#00c9a7]/10 border border-[#00c9a7]/30">
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">My Agency Commission</span>
                            <span className="font-bold text-[#00e5c0] text-sm">
                                {shipment.cost?.agencyFee
                                    ? `$${Number(shipment.cost.agencyFee).toFixed(2)} USD`
                                    : "$0.00 USD"}
                            </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#112a2a]/40 border border-[#1a4a4a]/40">
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Payment Verification</span>
                            <span className="font-medium text-[#e0faf5] text-[11px] truncate block">
                                {shipment.paymentStatus === "PAID"
                                    ? "Settled via Merchant Account"
                                    : "Pending Customer Payment"}
                            </span>
                        </div>

                        <div className="p-2.5 rounded-xl bg-[#112a2a]/40 border border-[#1a4a4a]/40">
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Payment Reference</span>
                            <span className="font-mono text-[#7ecfc4] text-[11px] truncate block" title={shipment.stripePaymentIntentId || "None"}>
                                {shipment.stripePaymentIntentId
                                    ? `${shipment.stripePaymentIntentId.slice(0, 14)}...`
                                    : formattedPaidAt || "N/A"}
                            </span>
                        </div>
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

                    {shipment.status === "ASSIGNED" && onOpenAcceptModal && (
                        <button
                            type="button"
                            onClick={() => {
                                onClose();
                                onOpenAcceptModal(shipment);
                            }}
                            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0f] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                        >
                            <CheckSquare size={13} />
                            <span>Accept Consignment</span>
                        </button>
                    )}

                    <Link
                        href={`/dashboard/agent/shipments/${shipment.id}`}
                        onClick={onClose}
                        className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#00c9a7]/20 hover:bg-[#00c9a7] text-[#00e5c0] hover:text-[#0a0f0f] border border-[#00c9a7]/40 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                        <Truck size={13} />
                        <span>Manage & Update Checkpoint</span>
                        <ArrowRight size={13} />
                    </Link>
                </div>
            </div>
        </Modal>
    );
}

export default AgentShipmentDetailsModal;
