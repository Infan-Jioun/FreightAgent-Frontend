// This needs 'use client' because: it manages interactive modal presentation, clipboard copying, and RBAC-gated dispatch actions.
"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
    X,
    Weight,
    Calendar,
    MapPin,
    UserPlus,
    UserCheck,
    Clock,
    ChevronRight,
    User,
    Mail,
    Phone,
    DollarSign,
    ShieldCheck,
    Trash2,
    RotateCcw,
    FileText,
    Copy,
    Check,
} from "lucide-react";
import { toast } from "sonner";
import { IShipment } from "@/app/types/shipment.types";
import { PaymentStatusBadge } from "@/components/ui/status-badge";
import { getShipmentStatusStyle } from "./ShipmentTable";
import { Modal } from "@/components/ui/Modal";
import { PermissionGate } from "@/components/auth/PermissionGate";

export interface ShipmentDetailsModalProps {
    shipment: IShipment | null;
    isAdmin: boolean;
    onClose: () => void;
    onOpenStatusModal: (shipment: IShipment) => void;
    onOpenAssignModal: (shipment: IShipment) => void;
    onOpenRefundModal: (shipment: IShipment) => void;
    onOpenDeleteModal?: (shipment: IShipment) => void;
}

export function ShipmentDetailsModal({
    shipment,
    isAdmin,
    onClose,
    onOpenStatusModal,
    onOpenAssignModal,
    onOpenRefundModal,
    onOpenDeleteModal,
}: ShipmentDetailsModalProps) {
    const [copied, setCopied] = useState(false);

    if (!shipment) return null;

    const handleCopyWaybill = () => {
        if (!shipment?.trackingId) return;
        navigator.clipboard.writeText(shipment.trackingId);
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

    return (
        <Modal
            isOpen={!!shipment}
            onClose={onClose}
            maxWidth="3xl"
            showCloseButton={false}
        >
            <div className="space-y-5">
                {/* 1. Header & Meta Identifiers */}
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
                        <p className="text-[11px] text-[#7ecfc4]/70 mt-1 flex flex-wrap items-center gap-2">
                            <span>Booked: {formattedCreatedAt}</span>
                            {formattedUpdatedAt && (
                                <>
                                    <span className="text-[#3a6b66]">•</span>
                                    <span>Updated: {formattedUpdatedAt}</span>
                                </>
                            )}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#1a4a4a] transition-colors cursor-pointer shrink-0"
                        title="Close Modal"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* 2. Top Overview Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                        <span className="text-[10px] text-[#3a6b66] font-bold uppercase block mb-1">
                            Current Status
                        </span>
                        <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border inline-block ${getShipmentStatusStyle(
                                shipment.status
                            )}`}
                        >
                            {shipment.status.replace(/_/g, " ")}
                        </span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                        <span className="text-[10px] text-[#3a6b66] font-bold uppercase block mb-1">
                            Payment Settlement
                        </span>
                        <div className="flex items-center justify-between gap-1">
                            <PaymentStatusBadge status={shipment.paymentStatus} />
                            {shipment.paymentStatus === "PAID" && isAdmin && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onOpenRefundModal(shipment);
                                    }}
                                    className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer flex items-center gap-1"
                                >
                                    <RotateCcw size={10} />
                                    <span>Refund</span>
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                        <span className="text-[10px] text-[#3a6b66] font-bold uppercase block mb-1">
                            Cargo Specs & Weight
                        </span>
                        <div className="space-y-0.5">
                            <span className="text-sm font-bold text-[#e0faf5] flex items-center gap-1">
                                <Weight size={14} className="text-[#00c9a7]" />
                                {shipment.weight} kg
                            </span>
                            {shipment.declaredCargoValue ? (
                                <span className="text-[10px] text-[#7ecfc4]/70 block">
                                    Value: ${shipment.declaredCargoValue.toLocaleString()}
                                </span>
                            ) : null}
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                        <span className="text-[10px] text-[#3a6b66] font-bold uppercase block mb-1">
                            Estimated Delivery
                        </span>
                        <span className="text-sm font-bold text-[#e0faf5] flex items-center gap-1">
                            <Calendar size={14} className="text-[#00b4d8]" />
                            {shipment.estimatedDate
                                ? new Date(shipment.estimatedDate).toLocaleDateString()
                                : "Pending Scheduling"}
                        </span>
                    </div>
                </div>

                {/* 3. Shipper / Customer Profile Details */}
                <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-3">
                    <span className="text-[10px] text-[#3a6b66] font-bold uppercase block">
                        Shipper / Booking Customer
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Customer Name</span>
                            <p className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                                <User size={13} className="text-[#00c9a7] shrink-0" />
                                <span>{shipment.user?.name || "Guest Customer"}</span>
                            </p>
                        </div>
                        <div>
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Email Address</span>
                            {shipment.user?.email ? (
                                <p className="text-xs font-semibold text-[#e0faf5] flex items-center gap-1.5 truncate">
                                    <Mail size={13} className="text-[#00c9a7] shrink-0" />
                                    <a
                                        href={`mailto:${shipment.user.email}`}
                                        className="hover:underline hover:text-[#00e5c0] truncate"
                                    >
                                        {shipment.user.email}
                                    </a>
                                </p>
                            ) : (
                                <span className="text-xs text-[#3a6b66] italic">No email on file</span>
                            )}
                        </div>
                        <div>
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Phone Number</span>
                            {shipment.user?.phone ? (
                                <p className="text-xs font-semibold text-[#e0faf5] flex items-center gap-1.5">
                                    <Phone size={13} className="text-[#00c9a7] shrink-0" />
                                    <a
                                        href={`tel:${shipment.user.phone}`}
                                        className="hover:underline hover:text-[#00e5c0]"
                                    >
                                        {shipment.user.phone}
                                    </a>
                                </p>
                            ) : (
                                <span className="text-xs text-[#3a6b66] italic">No phone on file</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 4. Transit Corridor & Route Specifications */}
                <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-3">
                    <span className="text-[10px] text-[#3a6b66] font-bold uppercase block">
                        Transit Corridor & Route
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Origin Facility</span>
                            <p className="text-xs font-semibold text-[#e0faf5] flex items-center gap-1.5">
                                <MapPin size={13} className="text-[#00c9a7] shrink-0" />
                                <span>{shipment.origin}</span>
                            </p>
                        </div>
                        <div>
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Destination Hub</span>
                            <p className="text-xs font-semibold text-[#e0faf5] flex items-center gap-1.5">
                                <MapPin size={13} className="text-[#00b4d8] shrink-0" />
                                <span>{shipment.destination}</span>
                            </p>
                        </div>
                    </div>

                    {shipment.description && (
                        <div className="pt-2 border-t border-[#1a4a4a]">
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5 flex items-center gap-1">
                                <FileText size={11} className="text-[#3a6b66]" />
                                <span>Cargo Description</span>
                            </span>
                            <p className="text-xs text-[#e0faf5] leading-relaxed">{shipment.description}</p>
                        </div>
                    )}
                </div>

                {/* 5. Assigned Agent & Dispatch Administration */}
                <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-[#3a6b66] font-bold uppercase block">
                            Road Agent Assignment & Dispatch Authority
                        </span>
                        {(shipment.status === "PENDING" || !shipment.assignedAgentId) && (
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onOpenAssignModal(shipment);
                                }}
                                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                                <UserPlus size={12} />
                                <span>Assign Agent</span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Carrier Road Agent */}
                        <div>
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Carrier Agent</span>
                            {shipment.assignedAgent ? (
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                                        <UserCheck size={13} className="text-[#00c9a7]" />
                                        <span>{shipment.assignedAgent.name}</span>
                                    </p>
                                    {shipment.assignedAgent.email && (
                                        <p className="text-[11px] text-[#7ecfc4]/90 font-mono">
                                            {shipment.assignedAgent.email}
                                        </p>
                                    )}
                                    {shipment.assignedAgent.phone && (
                                        <p className="text-[11px] text-[#7ecfc4]">
                                            <a
                                                href={`tel:${shipment.assignedAgent.phone}`}
                                                className="hover:underline hover:text-[#00e5c0]"
                                            >
                                                {shipment.assignedAgent.phone}
                                            </a>
                                        </p>
                                    )}
                                    {shipment.assignedAgent.assignedArea && (
                                        <p className="text-[10px] text-[#7ecfc4]/70">
                                            Assigned Area: {shipment.assignedAgent.assignedArea}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 inline-block">
                                    Waiting for Assignment
                                </span>
                            )}
                        </div>

                        {/* Assigned By (Admin Dispatcher) */}
                        <div>
                            <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Assigned By (Dispatcher)</span>
                            {shipment.assignedBy ? (
                                <div className="space-y-0.5">
                                    <p className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                                        <ShieldCheck size={13} className="text-[#00c9a7]" />
                                        <span>{shipment.assignedBy.name}</span>
                                    </p>
                                    <p className="text-[11px] text-[#7ecfc4]">
                                        {shipment.assignedBy.email}
                                    </p>
                                </div>
                            ) : (
                                <p className="text-xs text-[#3a6b66] italic">Not dispatched / Assigned automatically</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* 6. Cost Breakdown & Payment Details (if available) */}
                {shipment.cost && (
                    <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] text-[#3a6b66] font-bold uppercase block flex items-center gap-1">
                                <DollarSign size={12} className="text-[#00c9a7]" />
                                <span>Cost Breakdown & Financial Settlement</span>
                            </span>
                            <span className="text-xs font-bold text-[#00e5c0]">
                                Total: {shipment.cost.currency || "USD"} ${Number(shipment.cost.totalCost ?? 0).toFixed(2)}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                            {shipment.cost.oceanFreight > 0 && (
                                <div className="p-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a]/60">
                                    <span className="text-[10px] text-[#3a6b66] block">Ocean/Transit</span>
                                    <span className="font-semibold text-[#e0faf5]">${shipment.cost.oceanFreight}</span>
                                </div>
                            )}
                            {shipment.cost.customsDuty > 0 && (
                                <div className="p-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a]/60">
                                    <span className="text-[10px] text-[#3a6b66] block">Customs Duty</span>
                                    <span className="font-semibold text-[#e0faf5]">${shipment.cost.customsDuty}</span>
                                </div>
                            )}
                            {shipment.cost.lastMileDelivery > 0 && (
                                <div className="p-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a]/60">
                                    <span className="text-[10px] text-[#3a6b66] block">Last Mile</span>
                                    <span className="font-semibold text-[#e0faf5]">${shipment.cost.lastMileDelivery}</span>
                                </div>
                            )}
                            {shipment.cost.cargoInsurance > 0 && (
                                <div className="p-2.5 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a]/60">
                                    <span className="text-[10px] text-[#3a6b66] block">Insurance</span>
                                    <span className="font-semibold text-[#e0faf5]">${shipment.cost.cargoInsurance}</span>
                                </div>
                            )}
                        </div>

                        {shipment.stripePaymentIntentId && (
                            <div className="pt-2 border-t border-[#1a4a4a]/50 text-[11px] text-[#7ecfc4]/80 flex flex-wrap items-center justify-between gap-2 font-mono">
                                <span>Stripe Intent: {shipment.stripePaymentIntentId}</span>
                                {shipment.paidAt && (
                                    <span>Settled: {new Date(shipment.paidAt).toLocaleDateString()}</span>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* 7. Status Checkpoint Logs (Audit Trail) */}
                <div className="space-y-3">
                    <h4 className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                        <Clock size={14} className="text-[#00c9a7]" />
                        <span>Transit Checkpoint History (Audit Trail)</span>
                    </h4>

                    {shipment.statusLogs && shipment.statusLogs.length > 0 ? (
                        <div className="space-y-2 border-l-2 border-[#1a4a4a] pl-4 ml-2">
                            {shipment.statusLogs.map((log) => (
                                <div key={log.id} className="relative pb-2">
                                    <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#00c9a7]" />
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-[#e0faf5]">
                                            {log.status.replace(/_/g, " ")}
                                        </span>
                                        <span className="text-[10px] text-[#3a6b66]">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-[#7ecfc4]">
                                        {log.location}
                                        {log.note && <span className="text-[#e0faf5]/80"> — {log.note}</span>}
                                    </p>
                                    <p className="text-[10px] text-[#3a6b66] mt-0.5 flex items-center gap-1">
                                        <span>Logged by:</span>
                                        <span className="text-[#7ecfc4] font-medium">
                                            {log.updatedByUser
                                                ? `${log.updatedByUser.name} (${log.updatedByUser.role})`
                                                : "System"}
                                        </span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-[#3a6b66] italic">No intermediate checkpoints recorded yet.</p>
                    )}
                </div>

                {/* 8. Modal Footer Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#1a4a4a]">
                    <div className="flex items-center gap-2 flex-wrap">
                        <PermissionGate permission="shipments:update_status">
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onOpenStatusModal(shipment);
                                }}
                                className="px-3.5 py-2 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-xs font-bold transition-colors cursor-pointer"
                            >
                                Update Status
                            </button>
                        </PermissionGate>

                        {(shipment.status === "PENDING" || !shipment.assignedAgentId) && (
                            <PermissionGate permission="shipments:assign_agent">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onOpenAssignModal(shipment);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors cursor-pointer"
                                >
                                    Assign Agent
                                </button>
                            </PermissionGate>
                        )}

                        {isAdmin && onOpenDeleteModal && (
                            <PermissionGate permission="shipments:delete">
                                <button
                                    type="button"
                                    onClick={() => {
                                        onClose();
                                        onOpenDeleteModal(shipment);
                                    }}
                                    className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                                    title="Delete Consignment"
                                >
                                    <Trash2 size={12} />
                                    <span>Delete</span>
                                </button>
                            </PermissionGate>
                        )}
                    </div>

                    <Link
                        href={`/dashboard/customer/tracking?trackingId=${encodeURIComponent(shipment.trackingId)}`}
                        className="px-4 py-2 rounded-xl bg-[#112a2a] hover:bg-[#00c9a7]/15 text-[#00e5c0] border border-[#1a4a4a] text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                        <span>Open in Live Radar</span>
                        <ChevronRight size={13} />
                    </Link>
                </div>
            </div>
        </Modal>
    );
}

export default ShipmentDetailsModal;

