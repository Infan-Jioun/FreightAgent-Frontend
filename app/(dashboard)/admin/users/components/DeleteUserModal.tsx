"use client";

import React from "react";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { IAdminUser } from "@/app/types/admin.types";
import { Modal } from "@/components/ui/Modal";

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
}: DeleteUserModalProps): React.JSX.Element | null {
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
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="md"
            className="border-[#e11d48]/40"
            icon={<Trash2 size={20} className="text-[#f43f5e]" />}
            title="Confirm Deletion"
            description={<span className="text-[#f43f5e]">Permanent Action</span>}
            footer={
                <>
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
                </>
            }
        >
            <p className="text-xs text-[#7ecfc4]/90 py-2">
                Are you sure you want to permanently delete the account for{" "}
                <strong className="text-[#e0faf5]">{user.name}</strong> ({user.email})?
                This operation will call the server deletion API and cannot be undone.
            </p>
        </Modal>
    );
}
