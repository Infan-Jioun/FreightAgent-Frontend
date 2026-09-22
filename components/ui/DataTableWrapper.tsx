"use client";

import React from "react";
import type { DataTableWrapperProps } from "@/app/types/interface";

export type { DataTableWrapperProps };

export function DataTableWrapper({ children, className = "" }: DataTableWrapperProps) {
    return (
        <div className={`rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden ${className}`}>
            <div className="overflow-x-auto custom-modal-scrollbar">
                {children}
            </div>
        </div>
    );
}

export default DataTableWrapper;
