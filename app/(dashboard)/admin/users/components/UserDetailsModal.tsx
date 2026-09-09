"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { IAdminUser } from "@/app/types/admin.types";

interface UserDetailsModalProps {
    isOpen: boolean;
    user: IAdminUser | null;
    onClose: () => void;
    onChangeRoleClick: (user: IAdminUser) => void;
}

export default function UserDetailsModal({
    isOpen,
    user,
    onClose,
    onChangeRoleClick,
}: UserDetailsModalProps) {
    if (!isOpen || !user) return null;

    const initials = (user.name || "U")
        .split(" ")
        .map((w) => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const getRoleBadge = (role: IAdminUser["role"]) => {
        switch (role) {
            case "ADMIN":
                return "bg-[#e11d48]/15 text-[#f43f5e] border-[#e11d48]/30";
            case "AGENT":
                return "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30";
            default:
                return "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30";
        }
    };

    const getStatusBadge = () => {
        if (user.status === "SUSPENDED") {
            return "bg-[#ff6b6b]/15 text-[#ff6b6b] border-[#ff6b6b]/40";
        }
        if (!user.emailVerified) {
            return "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40";
        }
        return "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/40";
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-lg rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] p-6 shadow-2xl shadow-black relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                        title="Close modal"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#00c9a7]/30 to-[#00b4d8]/30 border border-[#00c9a7]/40 flex items-center justify-center font-black text-sm text-[#00e5c0]">
                            {initials}
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#e0faf5]">{user.name}</h3>
                            <p className="text-xs text-[#7ecfc4]">{user.email}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
                        <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                            <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                Account Role
                            </span>
                            <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(
                                    user.role
                                )} inline-block`}
                            >
                                {user.role}
                            </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                            <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                Email Verification
                            </span>
                            <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge()} inline-flex items-center gap-1`}
                            >
                                {user.emailVerified ? (
                                    <CheckCircle2 size={11} />
                                ) : (
                                    <AlertCircle size={11} />
                                )}
                                {user.emailVerified ? "Verified" : "Unverified"}
                            </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                            <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                User ID
                            </span>
                            <span className="text-xs font-mono text-[#e0faf5] truncate block">
                                {user.id}
                            </span>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                            <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                Member Since
                            </span>
                            <span className="text-xs text-[#e0faf5]">
                                {user.createdAt
                                    ? new Date(user.createdAt).toLocaleDateString()
                                    : "N/A"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-[#1a4a4a]/60">
                        <a
                            href={`mailto:${user.email}`}
                            className="text-xs text-[#00c9a7] hover:underline flex items-center gap-1"
                        >
                            <Mail size={13} />
                            <span>Send Email</span>
                        </a>

                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    onChangeRoleClick(user);
                                    onClose();
                                }}
                                className="px-3 py-1.5 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 text-[#f59e0b] text-xs font-bold transition-colors cursor-pointer"
                            >
                                Change Role
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3.5 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-bold text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
