"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, X, Check, Loader2 } from "lucide-react";
import { IAdminUser, UserRole } from "@/app/types/admin.types";

interface UpdateRoleModalProps {
    isOpen: boolean;
    user: IAdminUser | null;
    updating?: boolean;
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
        title: "Freigeht Agent",
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
    onClose,
    onSaveRole,
}: UpdateRoleModalProps) {
    const [selectedRole, setSelectedRole] = useState<UserRole>("CUSTOMER");

    useEffect(() => {
        if (user) {
            setSelectedRole(user.role);
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleConfirm = () => {
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

                    <p className="text-xs text-[#7ecfc4]/80 mb-4">
                        Select the target role for <strong>{user.name}</strong>. Updating the role will adjust the user&apos;s portal access and route permissions immediately.
                    </p>

                    {/* Role Radio Group */}
                    <div className="space-y-2 mb-6">
                        {ROLE_OPTIONS.map((item) => (
                            <div
                                key={item.role}
                                onClick={() => setSelectedRole(item.role)}
                                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${selectedRole === item.role
                                    ? "bg-[#00c9a7]/10 border-[#00c9a7] text-[#e0faf5]"
                                    : "bg-[#0a1a1a] border-[#1a4a4a] text-[#7ecfc4] hover:border-[#3a6b66]"
                                    }`}
                            >
                                <div
                                    className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center ${selectedRole === item.role
                                        ? "border-[#00c9a7] bg-[#00c9a7]"
                                        : "border-[#3a6b66]"
                                        }`}
                                >
                                    {selectedRole === item.role && (
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#0a0f0f]" />
                                    )}
                                </div>
                                <div>
                                    <span className="text-xs font-bold block">{item.title}</span>
                                    <span className="text-[11px] text-[#7ecfc4]/70 block">{item.desc}</span>
                                </div>
                            </div>
                        ))}
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
                            disabled={updating}
                            className="px-4 py-2 rounded-xl bg-[#00c9a7] text-[#0a0f0f] text-xs font-bold hover:bg-[#00e5c0] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
