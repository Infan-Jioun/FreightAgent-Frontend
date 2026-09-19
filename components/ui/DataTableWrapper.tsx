"use client";

import React from "react";

export interface DataTableWrapperProps {
    children: React.ReactNode;
    className?: string;
}

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
