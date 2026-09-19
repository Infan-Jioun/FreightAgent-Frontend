"use client";

import React from "react";

export interface ActionBtnProps {
    icon: React.ReactNode;
    label: string;
    onClick: () => void;
    color?: string;
    variant?: "primary" | "info" | "warning" | "danger" | "success" | "default";
    disabled?: boolean;
    className?: string;
}

const VARIANT_STYLES: Record<string, string> = {
    primary: "border-[#00c9a7]/30 text-[#00e5c0] hover:bg-[#00c9a7]/10 hover:border-[#00c9a7]/50",
    info: "border-[#00b4d8]/30 text-[#00b4d8] hover:bg-[#00b4d8]/10 hover:border-[#00b4d8]/50",
    warning: "border-[#f59e0b]/30 text-[#f59e0b] hover:bg-[#f59e0b]/10 hover:border-[#f59e0b]/50",
    danger: "border-[#ff6b6b]/30 text-[#ff6b6b] hover:bg-[#ff6b6b]/10 hover:border-[#ff6b6b]/50",
    success: "border-[#00e5c0]/30 text-[#00e5c0] hover:bg-[#00e5c0]/10 hover:border-[#00e5c0]/50",
    default: "border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:border-[#00c9a7]/40 hover:bg-[#112a2a]",
};

export function ActionBtn({
    icon,
    label,
    onClick,
    color,
    variant,
    disabled = false,
    className = "",
}: ActionBtnProps) {
    const variantClass = variant
        ? VARIANT_STYLES[variant]
        : color
        ? ""
        : VARIANT_STYLES.default;

    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            title={label}
            className={`p-1.5 rounded-lg bg-[#0a1a1a] border transition-all cursor-pointer disabled:opacity-30 disabled:pointer-events-none flex items-center justify-center ${variantClass} ${className}`}
            style={
                color && !variant
                    ? {
                          color,
                          borderColor: `${color}44`,
                      }
                    : undefined
            }
        >
            {icon}
        </button>
    );
}

export default ActionBtn;
