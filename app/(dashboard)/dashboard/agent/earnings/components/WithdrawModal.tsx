"use client";

import React, { useState } from "react";
import {
    X,
    DollarSign,
    Building2,
    FileText,
    Loader2,
    CheckCircle2,
    Download,
    ExternalLink,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { paymentService } from "@/app/services/payment.service";
import { IAgentWithdrawResult } from "@/app/types/payment.types";
import { AppError } from "@/app/errorHelper/appError";

interface WithdrawModalProps {
    isOpen: boolean;
    availableBalanceUSD: number;
    onClose: () => void;
    onSuccess: () => void;
}

export function WithdrawModal({
    isOpen,
    availableBalanceUSD,
    onClose,
    onSuccess,
}: WithdrawModalProps) {
    const [amount, setAmount] = useState("");
    const [bankInfo, setBankInfo] = useState("");
    const [note, setNote] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successResult, setSuccessResult] = useState<IAgentWithdrawResult | null>(null);

    if (!isOpen) return null;

    const handleClose = () => {
        if (successResult) {
            onSuccess();
        }
        setSuccessResult(null);
        setAmount("");
        setBankInfo("");
        setNote("");
        onClose();
    };

    const parsedAmount = parseFloat(amount);
    const isValidAmount =
        !isNaN(parsedAmount) && parsedAmount > 0 && parsedAmount <= availableBalanceUSD;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!isValidAmount) {
            toast.error(
                `Please enter a valid withdrawal amount up to $${Number(availableBalanceUSD ?? 0).toFixed(2)} USD`
            );
            return;
        }

        if (!bankInfo.trim()) {
            toast.error("Please provide your bank or payout account information");
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await paymentService.withdrawAgentFunds({
                amount: parsedAmount,
                bankInfo: bankInfo.trim(),
                note: note.trim() || undefined,
            });

            setSuccessResult(result);
            toast.success(
                `Withdrawal of $${Number(parsedAmount ?? 0).toFixed(2)} USD completed successfully!`
            );
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to process fund withdrawal");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-lg bg-[#0d1f1f] border border-[#1a4a4a] rounded-3xl shadow-2xl p-6 space-y-5 max-h-[92vh] overflow-y-auto">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b border-[#1a4a4a] pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 text-[#00e5c0]">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-mono text-[#00c9a7] uppercase tracking-wider block font-bold">
                                Carrier Commission Wallet
                            </span>
                            <h3 className="text-lg font-black text-[#e0faf5] tracking-tight">
                                {successResult ? "Withdrawal Completed" : "Withdraw Carrier Funds"}
                            </h3>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1.5 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] transition-colors cursor-pointer"
                        title="Close"
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* Success State View */}
                {successResult ? (
                    <div className="space-y-5 py-2 text-center">
                        <div className="w-16 h-16 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 animate-in zoom-in-75 duration-300">
                            <CheckCircle2 size={36} />
                        </div>

                        <div className="space-y-1.5">
                            <h4 className="text-base font-extrabold text-[#e0faf5]">
                                Withdrawal Successful!
                            </h4>
                            <p className="text-xs text-[#7ecfc4] max-w-sm mx-auto leading-relaxed">
                                Withdrawal of{" "}
                                <strong className="text-[#00e5c0] font-mono">
                                    ${Number(successResult.withdrawal?.amount ?? 0).toFixed(2)} USD
                                </strong>{" "}
                                was processed. Your official corporate withdrawal slip voucher has been
                                generated.
                            </p>
                        </div>

                        {/* Voucher Metadata Card */}
                        <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-left space-y-2.5 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-[#7ecfc4]/70 font-semibold">Voucher Number:</span>
                                <span className="font-mono font-bold text-[#e0faf5] bg-[#112a2a] px-2 py-0.5 rounded-md border border-[#1a4a4a]">
                                    {successResult.withdrawal?.voucherNumber || "PENDING"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#7ecfc4]/70 font-semibold">Remaining Balance:</span>
                                <span className="font-mono font-bold text-[#00e5c0]">
                                    ${Number(successResult.remainingBalance ?? 0).toFixed(2)} USD
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-[#7ecfc4]/70 font-semibold">Bank / Payout Account:</span>
                                <span className="font-medium text-[#e0faf5] truncate max-w-[200px]" title={successResult.withdrawal?.bankInfo}>
                                    {successResult.withdrawal?.bankInfo || "Standard Account"}
                                </span>
                            </div>
                        </div>

                        {/* Download Slip Button */}
                        {successResult.receiptUrl ? (
                            <a
                                href={successResult.receiptUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] font-black text-xs transition-all shadow-md cursor-pointer"
                            >
                                <Download size={15} />
                                <span>📄 View / Download Withdrawal Slip PDF</span>
                                <ExternalLink size={13} />
                            </a>
                        ) : (
                            <div className="p-3 rounded-xl bg-[#112a2a] text-xs text-[#7ecfc4]">
                                Withdrawal recorded. Receipt URL will be accessible in your history shortly.
                            </div>
                        )}

                        <button
                            type="button"
                            onClick={handleClose}
                            className="w-full py-2.5 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] transition-colors cursor-pointer"
                        >
                            Back to Wallet
                        </button>
                    </div>
                ) : (
                    /* Withdrawal Form */
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Available Balance Banner */}
                        <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-between">
                            <div>
                                <span className="text-[10px] uppercase font-bold text-[#7ecfc4]/70 tracking-wider block">
                                    Current Available Balance
                                </span>
                                <span className="text-xl font-black text-[#00e5c0] font-mono">
                                    ${Number(availableBalanceUSD ?? 0).toFixed(2)}{" "}
                                    <span className="text-xs font-semibold text-[#7ecfc4]">USD</span>
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAmount(availableBalanceUSD.toString())}
                                className="px-2.5 py-1 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-[11px] font-bold transition-colors cursor-pointer"
                            >
                                Withdraw All
                            </button>
                        </div>

                        {/* Amount Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                                <DollarSign size={13} className="text-[#00c9a7]" />
                                <span>Withdrawal Amount (USD) *</span>
                            </label>
                            <div className="relative">
                                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-[#7ecfc4]">
                                    $
                                </span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="1"
                                    max={availableBalanceUSD}
                                    required
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-sm font-mono text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] focus:ring-3 focus:ring-[#00c9a7]/20 transition-all"
                                />
                            </div>
                            {amount && !isValidAmount && (
                                <p className="text-[11px] text-rose-400 flex items-center gap-1 pt-0.5">
                                    <AlertCircle size={12} />
                                    <span>Amount must be greater than $0 and cannot exceed available balance.</span>
                                </p>
                            )}
                        </div>

                        {/* Bank Account Info */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                                <Building2 size={13} className="text-[#00c9a7]" />
                                <span>Bank / Payout Account Details *</span>
                            </label>
                            <textarea
                                rows={3}
                                required
                                value={bankInfo}
                                onChange={(e) => setBankInfo(e.target.value)}
                                placeholder="Bank Name: City Bank PLC&#10;Account Name: John Doe&#10;Account / IBAN: 1234567890&#10;Routing / SWIFT: CIBLBDDH"
                                className="w-full p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] focus:ring-3 focus:ring-[#00c9a7]/20 transition-all resize-none font-mono"
                            />
                        </div>

                        {/* Note */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                                <FileText size={13} className="text-[#00c9a7]" />
                                <span>Internal Notes / Reference (Optional)</span>
                            </label>
                            <input
                                type="text"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="e.g. Monthly carrier dispatch settlement"
                                className="w-full px-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] focus:ring-3 focus:ring-[#00c9a7]/20 transition-all"
                            />
                        </div>

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#1a4a4a]">
                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="px-4 py-2.5 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting || !isValidAmount || !bankInfo.trim()}
                                className="px-5 py-2.5 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] text-xs font-black transition-all flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                                {isSubmitting && <Loader2 size={13} className="animate-spin" />}
                                <span>
                                    {isSubmitting
                                        ? "Processing Payout..."
                                        : `Confirm Withdrawal ${parsedAmount > 0 ? `($${Number(parsedAmount ?? 0).toFixed(2)})` : ""}`}
                                </span>
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
