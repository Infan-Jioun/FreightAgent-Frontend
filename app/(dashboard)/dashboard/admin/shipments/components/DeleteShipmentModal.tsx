"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { IShipment } from "@/app/types/shipment.types";

export interface DeleteShipmentModalProps {
    shipment: IShipment | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    isDeleting: boolean;
}

export function DeleteShipmentModal({
    shipment,
    isOpen,
    onClose,
    onConfirm,
    isDeleting,
}: DeleteShipmentModalProps) {
    if (!isOpen || !shipment) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="w-full max-w-sm bg-[#0d1f1f] border border-[#ff6b6b]/40 rounded-3xl shadow-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-[#ff6b6b]">
                    <div className="p-2.5 rounded-2xl bg-[#ff6b6b]/15 border border-[#ff6b6b]/30">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <h3 className="text-sm font-black text-[#e0faf5]">Delete Consignment?</h3>
                        <p className="text-[11px] text-[#ff6b6b]">This action is irreversible</p>
                    </div>
                </div>

                <p className="text-xs text-[#7ecfc4]">
                    Are you sure you want to delete consignment{" "}
                    <span className="font-mono font-bold text-[#e0faf5]">{shipment.trackingId}</span>? All checkpoint logs will be permanently purged.
                </p>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a4a4a]">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                    >
                        Keep
                    </button>
                    <button
                        type="button"
                        disabled={isDeleting}
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-xl bg-[#ff6b6b] hover:bg-[#ff5252] text-xs font-bold text-white transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {isDeleting && <Loader2 size={13} className="animate-spin" />}
                        <span>{isDeleting ? "Deleting..." : "Delete Consignment"}</span>
                    </button>
                </div>
            </div>
        </div>
    );
}

export default DeleteShipmentModal;
