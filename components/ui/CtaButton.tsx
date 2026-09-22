"use client";

import React from "react";
import { Loader2 } from "lucide-react";
import type { CtaButtonProps } from "@/app/types/interface";

export type { CtaButtonProps };

const VARIANT_CLASSES = {
    primary:
        "bg-linear-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] shadow-md shadow-[#00c9a7]/20 hover:opacity-95",
    secondary:
        "bg-[#0d1f1f] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]",
    danger:
        "bg-[#e11d48]/15 border border-[#e11d48]/30 text-[#f43f5e] hover:bg-[#e11d48]/25",
};

export function CtaButton({
    children,
    onClick,
    icon,
    disabled = false,
    loading = false,
    type = "button",
    className = "",
    variant = "primary",
}: CtaButtonProps) {
    const renderIcon = () => {
        if (!icon) return null;
        if (React.isValidElement(icon)) return icon;
        if (
            typeof icon === "function" ||
            (typeof icon === "object" && icon !== null && "$$typeof" in icon)
        ) {
            const IconComponent = icon as unknown as React.ComponentType<{
                size?: number;
                className?: string;
            }>;
            return <IconComponent size={15} />;
        }
        if (typeof icon === "string" || typeof icon === "number") return icon;
        return null;
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled || loading}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:pointer-events-none ${VARIANT_CLASSES[variant]} ${className}`}
        >
            {loading ? (
                <Loader2 size={15} className="animate-spin" />
            ) : (
                renderIcon()
            )}
            <span>{children}</span>
        </button>
    );
}

export default CtaButton;
