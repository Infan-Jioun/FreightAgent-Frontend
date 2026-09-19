"use client";

import React from "react";

export interface PaginationBtnProps {
    children: React.ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    active?: boolean;
    title?: string;
}

export function PaginationBtn({
    children,
    onClick,
    disabled = false,
    active = false,
    title,
}: PaginationBtnProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={title}
            className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none ${
                active
                    ? "bg-[#00c9a7] text-[#0a0f0f] border border-[#00c9a7] shadow-xs"
                    : "bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]"
            }`}
        >
            {children}
        </button>
    );
}