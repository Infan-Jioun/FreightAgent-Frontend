"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserX, UserCheck, X, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IAdminUser } from "@/app/types/admin.types";

interface SuspendUserModalProps {
    isOpen: boolean;
    user: IAdminUser | null;
    processing?: boolean;
    currentAdminId?: string;
    onClose: () => void;
    onConfirmStatus: (payload: { isBlocked: boolean; reason?: string }) => void;
}

const MAX_REASON_LENGTH = 255;

export default function SuspendUserModal({
    isOpen,
    user,
    processing = false,
    currentAdminId,
    onClose,
    onConfirmStatus,
}: SuspendUserModalProps) {
    const [reason, setReason] = useState("");
    const [error, setError] = useState<string | null>(null);

    const isCurrentlyBlocked = Boolean(user?.isBlocked || user?.status === "SUSPENDED");

    useEffect(() => {
        if (isOpen) {
            setReason("");
            setError(null);
        }
    }, [isOpen]);

    if (!isOpen || !user) return null;

    const isSelf = currentAdminId ? user.id.trim() === currentAdminId.trim() : false;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isSelf) {
            toast.error("You cannot suspend your own Administrator account.");
            onClose();
            return;
        }

        if (!isCurrentlyBlocked) {
            const trimmedReason = reason.trim();
            if (!trimmedReason) {
                setError("Please provide a reason for suspending this user.");
                return;
            }
            if (trimmedReason.length > MAX_REASON_LENGTH) {
                setError(`Reason must not exceed ${MAX_REASON_LENGTH} characters.`);
                return;
            }
            onConfirmStatus({
                isBlocked: true,
                reason: trimmedReason,
            });
        } else {
            // Reactivation
            onConfirmStatus({
                isBlocked: false,
            });
        }
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] p-6 shadow-2xl shadow-black relative"
                >
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-5 right-5 text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                        title="Close modal"
                    >
                        <X size={18} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                        <div
                            className={`w-10 h-10 rounded-2xl border flex items-center justify-center ${
                                isCurrentlyBlocked
                                    ? "bg-[#00c9a7]/15 border-[#00c9a7]/30 text-[#00e5c0]"
                                    : "bg-[#e11d48]/15 border-[#e11d48]/30 text-[#f43f5e]"
                            }`}
                        >
                            {isCurrentlyBlocked ? <UserCheck size={20} /> : <UserX size={20} />}
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#e0faf5]">
                                {isCurrentlyBlocked ? "Reactivate User Account" : "Suspend / Block User"}
                            </h3>
                            <p className="text-xs text-[#7ecfc4]">{user.email}</p>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {isCurrentlyBlocked ? (
                            /* Reactivation Mode */
                            <div className="space-y-4 mb-6">
                                <p className="text-xs text-[#7ecfc4]/90 leading-relaxed">
                                    Are you sure you want to reactivate the account for{" "}
                                    <strong className="text-[#e0faf5]">{user.name}</strong>?
                                </p>
                                <div className="p-3.5 rounded-2xl bg-[#00c9a7]/10 border border-[#00c9a7]/30 text-[#00e5c0] text-xs leading-relaxed">
                                    The user will immediately regain access to their portal, active shipments, and permissions.
                                </div>
                            </div>
                        ) : (
                            /* Suspension Mode */
                            <div className="space-y-4 mb-6">
                                <p className="text-xs text-[#7ecfc4]/90 leading-relaxed">
                                    You are about to suspend the account for{" "}
                                    <strong className="text-[#e0faf5]">{user.name}</strong>.
                                </p>

                                {/* Warning Callout */}
                                <div className="p-3.5 rounded-2xl bg-[#e11d48]/10 border border-[#e11d48]/30 flex items-start gap-2.5 text-xs text-[#f43f5e] leading-relaxed">
                                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                    <span>
                                        This will terminate all active sessions immediately and send an email notification to the user explaining the suspension.
                                    </span>
                                </div>

                                {/* Reason Input */}
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <label
                                            htmlFor="suspend-reason"
                                            className="text-xs font-bold text-[#e0faf5]"
                                        >
                                            Reason for Suspension <span className="text-[#f43f5e]">*</span>
                                        </label>
                                        <span className="text-[11px] text-[#7ecfc4]/70 font-mono">
                                            {reason.length}/{MAX_REASON_LENGTH}
                                        </span>
                                    </div>
                                    <textarea
                                        id="suspend-reason"
                                        rows={3}
                                        value={reason}
                                        onChange={(e) => {
                                            setReason(e.target.value.slice(0, MAX_REASON_LENGTH));
                                            if (error) setError(null);
                                        }}
                                        placeholder="e.g. Violation of merchant shipping guidelines, suspicious login activity, or unpaid carrier invoices..."
                                        className="w-full p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:border-[#e11d48] focus:outline-hidden transition-colors resize-none"
                                        disabled={processing}
                                        autoFocus
                                    />
                                    {error && (
                                        <p className="text-[11px] text-[#f43f5e] font-medium">{error}</p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-end gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={processing}
                                className="px-4 py-2 rounded-xl border border-[#1a4a4a] text-xs font-semibold text-[#7ecfc4] hover:bg-[#112a2a] transition-colors cursor-pointer disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={processing || (!isCurrentlyBlocked && !reason.trim())}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer ${
                                    isCurrentlyBlocked
                                        ? "bg-[#00c9a7] text-[#0a0f0f] hover:bg-[#00e5c0]"
                                        : "bg-[#e11d48] text-white hover:bg-[#f43f5e]"
                                }`}
                            >
                                {processing ? (
                                    <>
                                        <Loader2 size={13} className="animate-spin" />
                                        <span>{isCurrentlyBlocked ? "Reactivating..." : "Suspending..."}</span>
                                    </>
                                ) : isCurrentlyBlocked ? (
                                    <>
                                        <UserCheck size={14} />
                                        <span>Reactivate User</span>
                                    </>
                                ) : (
                                    <>
                                        <UserX size={14} />
                                        <span>Suspend User</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
