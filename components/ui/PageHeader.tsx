"use client";

import React from "react";
import type { PageHeaderProps } from "@/app/types/interface";

export type { PageHeaderProps };

const BADGE_COLOR_MAP = {
    red: "bg-[#e11d48]/15 text-[#f43f5e] border-[#e11d48]/30",
    teal: "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30",
    blue: "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/30",
    amber: "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30",
    emerald: "bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30",  
    purple: "bg-[#8b5cf6]/15 text-[#8b5cf6] border-[#8b5cf6]/30", 
};

export function PageHeader({
    title,
    subtitle,
    badge,
    badgeColor = "red",
    actions,
    className = "",
}: PageHeaderProps) {
    return (
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${className}`}>
            <div>
                <div className="flex items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] tracking-tight">
                        {title}
                    </h1>
                    {badge && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${BADGE_COLOR_MAP[badgeColor]}`}>
                            {badge}
                        </span>
                    )}
                </div>
                {subtitle && (
                    <p className="text-xs text-[#7ecfc4] mt-1">
                        {subtitle}
                    </p>
                )}
            </div>

            {actions && (
                <div className="flex items-center gap-2">
                    {actions}
                </div>
            )}
        </div>
    );
}

export default PageHeader;
