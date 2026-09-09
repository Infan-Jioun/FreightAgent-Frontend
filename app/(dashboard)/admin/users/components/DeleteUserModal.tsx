"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IAdminUser } from "@/app/types/admin.types";

interface DeleteUserModalProps {
    isOpen: boolean;
    user: IAdminUser | null;
    deleting?: boolean;
    currentAdminId?: string;
    onClose: () => void;
    onConfirmDelete: () => void;
}

export default function DeleteUserModal({
    isOpen,
    user,
    deleting = false,
    currentAdminId,
    onClose,
    onConfirmDelete,
}: DeleteUserModalProps) {
    if (!isOpen || !user) return null;

    const targetId = user.id.trim();

    const handleConfirm = () => {
        // Prevent self-deletion
        if (currentAdminId && targetId === currentAdminId) {
            toast.error("You cannot delete your own Administrator account.");
            onClose();
            return;
        }

        onConfirmDelete();
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-md rounded-3xl bg-[#0d1f1f] border border-[#e11d48]/40 p-6 shadow-2xl shadow-black relative"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-5 right-5 text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                        title="Close modal"
                    >
                        <X size={18} />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-2xl bg-[#e11d48]/15 border border-[#e11d48]/30 flex items-center justify-center text-[#f43f5e]">
                            <Trash2 size={20} />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-[#e0faf5]">Confirm Deletion</h3>
                            <p className="text-xs text-[#f43f5e]">Permanent Action</p>
                        </div>
                    </div>

                    <p className="text-xs text-[#7ecfc4]/90 mb-6">
                        Are you sure you want to permanently delete the account for{" "}
                        <strong className="text-[#e0faf5]">{user.name}</strong> ({user.email})?
                        This operation will call the server deletion API and cannot be undone.
                    </p>

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
                            disabled={deleting}
                            className="px-4 py-2 rounded-xl bg-[#e11d48] text-white text-xs font-bold hover:bg-[#f43f5e] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                        >
                            {deleting ? (
                                <>
                                    <Loader2 size={13} className="animate-spin" />
                                    <span>Deleting...</span>
                                </>
                            ) : (
                                <>
                                    <Trash2 size={14} />
                                    <span>Delete User</span>
                                </>
                            )}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
