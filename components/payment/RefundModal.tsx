"use client";

import React, { useState } from "react";
import { RotateCcw, AlertTriangle, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IShipment } from "@/app/types/shipment.types";
import { paymentService } from "@/app/services/payment.service";
import { AppError } from "@/app/errorHelper/appError";

interface RefundModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    shipment: IShipment | null;
}

export function RefundModal({
    isOpen,
    onClose,
    onSuccess,
    shipment,
}: RefundModalProps) {
    const [reason, setReason] = useState("");
    const [isRefunding, setIsRefunding] = useState(false);

    if (!isOpen || !shipment) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reason.trim()) {
            toast.error("Please enter an administrative reason for this refund.");
            return;
        }

        setIsRefunding(true);
        try {
            const res = await paymentService.refundPayment(shipment.id, reason.trim());
            toast.success(
                `Refund of $${res.amountUSD.toFixed(2)} USD processed successfully (ID: ${res.refundId.slice(0, 12)}...)`
            );
            onSuccess();
            onClose();
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to process Stripe refund");
        } finally {
            setIsRefunding(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-[#0d1f1f] border border-amber-500/40 rounded-3xl shadow-2xl p-6 space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#1a4a4a] pb-3">
                    <div className="flex items-center gap-3 text-amber-400">
                        <div className="p-2.5 rounded-2xl bg-amber-500/15 border border-amber-500/30">
                            <RotateCcw size={18} />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono uppercase tracking-wider block">
                                Stripe Gateway Refund
                            </span>
                            <h3 className="text-base font-extrabold text-[#e0faf5]">
                                Reverse Settlement
                            </h3>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Consignment Info */}
                <div className="p-3.5 rounded-2xl bg-[#071313] border border-[#1a4a4a] space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-[#7ecfc4]">Tracking Number:</span>
                        <span className="font-mono font-bold text-[#e0faf5]">{shipment.trackingId}</span>
                    </div>
                    <div className="flex items-center justify-between border-t border-[#1a4a4a]/60 pt-2">
                        <span className="text-[#7ecfc4]">Route:</span>
                        <span className="font-semibold text-[#e0faf5]">
                            {shipment.origin} &rarr; {shipment.destination}
                        </span>
                    </div>
                    {shipment.user?.name && (
                        <div className="flex items-center justify-between border-t border-[#1a4a4a]/60 pt-2">
                            <span className="text-[#7ecfc4]">Customer:</span>
                            <span className="font-semibold text-[#e0faf5]">{shipment.user.name}</span>
                        </div>
                    )}
                </div>

                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                    <AlertTriangle size={15} className="shrink-0 mt-0.5" />
                    <span>
                        This will issue a direct refund to the customer&apos;s original payment method and update the consignment status to <strong>REFUNDED</strong>.
                    </span>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-semibold text-[#7ecfc4] block mb-1.5">
                            Refund Reason / Audit Note *
                        </label>
                        <textarea
                            rows={3}
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g. Customer cancelled shipment prior to departure; approved by admin."
                            className="w-full bg-[#071313] rounded-xl px-3.5 py-2.5 border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-amber-400 resize-none"
                            required
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a4a4a]">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isRefunding}
                            className="px-4 py-2 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer disabled:opacity-50"
                        >
                            Dismiss
                        </button>
                        <button
                            type="submit"
                            disabled={isRefunding || !reason.trim()}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-xs font-black text-[#0a0f0f] transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            {isRefunding && <Loader2 size={13} className="animate-spin" />}
                            <span>{isRefunding ? "Processing Refund..." : "Authorize Refund"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
