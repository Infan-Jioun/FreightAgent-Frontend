"use client";

import React from "react";

export function ModalActions({
    onCancel,
    onConfirm,
    loading,
    confirmLabel,
    confirmColor,
}: {
    onCancel: () => void;
    onConfirm: () => void;
    loading: boolean;
    confirmLabel: string;
    confirmColor?: string;
}) {
    return (
        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-[#1a4a4a]">
            <button
                type="button"
                onClick={onCancel}
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-semibold text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer disabled:opacity-50"
            >
                Cancel
            </button>
            <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-xs font-bold text-[#0a0f0f] transition-opacity cursor-pointer disabled:opacity-60 flex items-center gap-1.5 shadow-md"
                style={{
                    backgroundColor: confirmColor || "var(--accent-primary)",
                }}
            >
                {loading ? "Please wait…" : confirmLabel}
            </button>
        </div>
    );
}