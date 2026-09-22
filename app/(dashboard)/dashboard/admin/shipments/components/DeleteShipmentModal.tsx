"use client";

import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { IShipment } from "@/app/types/shipment.types";
import { Modal } from "@/components/ui/Modal";

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
}: DeleteShipmentModalProps): React.JSX.Element | null {
    if (!isOpen || !shipment) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="sm"
            className="border-[#ff6b6b]/40"
            icon={<AlertTriangle size={20} className="text-[#ff6b6b]" />}
            title="Delete Consignment?"
            description={<span className="text-[#ff6b6b]">This action is irreversible</span>}
            footer={
                <>
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
                </>
            }
        >
            <p className="text-xs text-[#7ecfc4] py-2">
                Are you sure you want to delete consignment{" "}
                <span className="font-mono font-bold text-[#e0faf5]">{shipment.trackingId}</span>? All checkpoint logs will be permanently purged.
            </p>
        </Modal>
    );
}

export default DeleteShipmentModal;
