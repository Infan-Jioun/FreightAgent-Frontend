"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationBarProps } from "@/app/types/interface";

export type { PaginationBarProps };

export function PaginationBar({
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    itemName = "items",
    onPageChange,
    className = "",
}: PaginationBarProps) {
    if (totalPages <= 1 && (!totalCount || totalCount <= 0)) {
        return null;
    }

    const startItem = pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
    const endItem = pageSize && totalCount ? Math.min(currentPage * pageSize, totalCount) : undefined;

    return (
        <div className={`p-3.5 border-t border-[#1a4a4a] bg-[#0a1a1a]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7ecfc4] ${className}`}>
            <span>
                {startItem && endItem && totalCount ? (
                    <>
                        Showing {startItem} to {endItem} of {totalCount} {itemName}
                    </>
                ) : (
                    <>
                        Page {currentPage} of {totalPages}
                        {typeof totalCount === "number" ? ` (${totalCount} total ${itemName})` : ""}
                    </>
                )}
            </span>

            {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                        className="min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]"
                        title="Previous page"
                    >
                        <ChevronLeft size={14} />
                    </button>

                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const p = i + 1;
                        const active = p === currentPage;
                        return (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPageChange(p)}
                                className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer ${
                                    active
                                        ? "bg-[#00c9a7] text-[#0a0f0f] border border-[#00c9a7] shadow-xs"
                                        : "bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]"
                                }`}
                            >
                                {p}
                            </button>
                        );
                    })}

                    <button
                        type="button"
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                        className="min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]"
                        title="Next page"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}

export default PaginationBar;
