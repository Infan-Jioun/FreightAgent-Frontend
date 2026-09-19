"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { IShipment, ShipmentStatus } from "@/app/types/shipment.types";

export interface UpdateStatusModalProps {
    shipment: IShipment | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (payload: { status: ShipmentStatus; location: string; note?: string }) => Promise<void>;
    loading: boolean;
}

export function UpdateStatusModal({
    shipment,
    isOpen,
    onClose,
    onSubmit,
    loading,
}: UpdateStatusModalProps) {
    const [newStatus, setNewStatus] = useState<ShipmentStatus>("IN_TRANSIT");
    const [statusLocation, setStatusLocation] = useState("");
    const [statusNote, setStatusNote] = useState("");

    useEffect(() => {
        if (shipment) {
            setNewStatus(shipment.status);
            setStatusLocation(shipment.destination || "");
            setStatusNote("");
        }
    }, [shipment]);

    if (!isOpen || !shipment) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            status: newStatus,
            location: statusLocation.trim(),
            note: statusNote.trim() || undefined,
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="w-full max-w-md bg-[#0d1f1f] border border-[#1a4a4a] rounded-3xl shadow-2xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-[#1a4a4a] pb-3">
                    <div>
                        <span className="text-[10px] font-mono text-[#00c9a7] uppercase tracking-wider block">
                            Update Checkpoint
                        </span>
                        <h3 className="text-base font-extrabold text-[#e0faf5]">
                            {shipment.trackingId}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                        title="Close Modal"
                    >
                        <X size={15} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                            New Status State
                        </label>
                        <select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                            className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                        >
                            <option value="PENDING">PENDING</option>
                            <option value="PICKED_UP">PICKED_UP</option>
                            <option value="IN_TRANSIT">IN_TRANSIT</option>
                            <option value="AT_CUSTOMS">AT_CUSTOMS</option>
                            <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                            <option value="DELIVERED">DELIVERED</option>
                            <option value="CANCELLED">CANCELLED</option>
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                            Checkpoint Location *
                        </label>
                        <input
                            type="text"
                            required
                            value={statusLocation}
                            onChange={(e) => setStatusLocation(e.target.value)}
                            placeholder="e.g. Chicago Cargo Hub Gate 4"
                            className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                        />
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                            Checkpoint Note (Optional)
                        </label>
                        <textarea
                            rows={2}
                            value={statusNote}
                            onChange={(e) => setStatusNote(e.target.value)}
                            placeholder="e.g. Scanned into interstate transit container"
                            className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] resize-none transition-colors"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a4a4a]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-xs font-bold text-[#0a0f0f] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                            {loading && <Loader2 size={13} className="animate-spin" />}
                            <span>{loading ? "Updating..." : "Commit Checkpoint"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default UpdateStatusModal;
