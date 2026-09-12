"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Check, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { IAdminUser, UserRole } from "@/app/types/admin.types";

interface UpdateRoleModalProps {
    isOpen: boolean;
    user: IAdminUser | null;
    updating?: boolean;
    currentAdminId?: string;
    onClose: () => void;
    onSaveRole: (role: UserRole) => void;
}

const ROLE_OPTIONS = [
    {
        role: "CUSTOMER",
        title: "Customer",
        desc: "Standard merchant shipper with parcel booking & tracking",
    },
    {
        role: "AGENT",
        title: "Freight Agent",
        desc: "Certified carrier capable of transporting cargo",
    },
    {
        role: "ADMIN",
        title: "Administrator",
        desc: "Full system oversight, role modifications, and analytics",
    },
] as const;

export default function UpdateRoleModal({
    isOpen,
    user,
    updating = false,
    currentAdminId,
    onClose,
    onSaveRole,
}: UpdateRoleModalProps) {
    const [selectedRole, setSelectedRole] = useState<UserRole>("CUSTOMER");

    useEffect(() => {
        if (user) {
            // Default selection to another role if possible
            setSelectedRole(user.role);
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const isSelf = currentAdminId ? user.id.trim() === currentAdminId.trim() : false;
    const isSameRole = selectedRole === user.role;

    const handleConfirm = () => {
        if (isSelf) {
            toast.error("You cannot modify your own administrative role.");
            onClose();
            return;
        }

        if (isSameRole) {
            toast.info("Please select a different role to update.");
            return;
        }

        onSaveRole(selectedRole);
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

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b]">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#e0faf5]">Change User Role</h3>
                            <p className="text-xs text-[#7ecfc4]">{user.email}</p>
                        </div>
                    </div>

                    {isSelf ? (
                        <div className="p-3.5 rounded-2xl bg-[#e11d48]/10 border border-[#e11d48]/30 flex items-start gap-2.5 text-xs text-[#f43f5e] mb-6">
                            <AlertCircle size={16} className="shrink-0 mt-0.5" />
                            <span>
                                You cannot change the role of your own Administrator account. Self-demotion is restricted for security.
                            </span>
                        </div>
                    ) : (
                        <p className="text-xs text-[#7ecfc4]/80 mb-4">
                            Select the target role for <strong className="text-[#e0faf5]">{user.name}</strong>. Updating the role will adjust the user&apos;s portal access and route permissions immediately.
                        </p>
                    )}

                    {/* Role Radio Group */}
                    <div className="space-y-2 mb-6">
                        {ROLE_OPTIONS.map((item) => {
                            const isCurrent = item.role === user.role;
                            const isSelected = selectedRole === item.role;

                            return (
                                <div
                                    key={item.role}
                                    onClick={() => {
                                        if (!isSelf && !isCurrent) {
                                            setSelectedRole(item.role);
                                        }
                                    }}
                                    className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                                        isCurrent
                                            ? "bg-[#0a1a1a]/60 border-[#1a4a4a] opacity-60 cursor-not-allowed text-[#7ecfc4]"
                                            : isSelected
                                            ? "bg-[#00c9a7]/10 border-[#00c9a7] text-[#e0faf5] cursor-pointer"
                                            : "bg-[#0a1a1a] border-[#1a4a4a] text-[#7ecfc4] hover:border-[#3a6b66] cursor-pointer"
                                    }`}
                                >
                                    <div className="flex items-start gap-3">
                                        <div
                                            className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center ${
                                                isSelected
                                                    ? "border-[#00c9a7] bg-[#00c9a7]"
                                                    : "border-[#3a6b66]"
                                            }`}
                                        >
                                            {isSelected && (
                                                <div className="w-1.5 h-1.5 rounded-full bg-[#0a0f0f]" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-bold block">{item.title}</span>
                                                {isCurrent && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#3a6b66]/30 text-[#7ecfc4] border border-[#3a6b66]/40">
                                                        Current Role
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[11px] text-[#7ecfc4]/70 block">{item.desc}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-end gap-2.5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl border border-[#1a4a4a] text-xs font-semibold text-[#7ecfc4] hover:bg-[#112a2a] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleConfirm}
                            disabled={updating || isSelf || isSameRole}
                            className="px-4 py-2 rounded-xl bg-[#00c9a7] text-[#0a0f0f] text-xs font-bold hover:bg-[#00e5c0] transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {updating ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                <>
                                    <Check size={14} />
                                    <span>Update Role</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
