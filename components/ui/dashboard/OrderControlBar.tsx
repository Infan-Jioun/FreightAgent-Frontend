"use client";

import Link from "next/link";
import { Database, Download, Plus, ChevronDown } from "lucide-react";
import { ROUTES } from "@/app/constants/routes";
import { toast } from "sonner";

interface OrderControlBarProps {
    pendingCount?: number;
    selectedFilter?: string;
    onFilterChange?: (filter: string) => void;
}

export default function OrderControlBar({
    pendingCount = 5,
}: OrderControlBarProps) {
    const handleDownloadReport = () => {
        toast.success("Downloading shipment report...", {
            description: "CSV summary for October 2023 generated.",
        });
    };

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3">
            {/* Left: Order List Database Icon & Label */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0a1a1a] border border-[#1a4a4a] text-[#00c9a7] flex items-center justify-center flex-shrink-0 shadow-sm shadow-[#00c9a7]/10">
                    <Database size={18} />
                </div>
                <div>
                    <h2 className="text-sm font-bold text-[#e0faf5] leading-tight">
                        Order List Database
                    </h2>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Tuesday, 10 October 2023
                    </p>
                </div>
            </div>

            {/* Right: Actions & Buttons */}
            <div className="flex items-center flex-wrap gap-2.5">
                {/* Pending Filter Dropdown */}
                <button
                    onClick={() => toast.info(`Viewing ${pendingCount} pending shipments`)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#f59e0b]/15 hover:bg-[#f59e0b]/25 text-[#f59e0b] border border-[#f59e0b]/30 text-xs font-semibold transition-colors cursor-pointer"
                >
                    <span>Pending Shipment ({pendingCount})</span>
                    <ChevronDown size={14} />
                </button>

                {/* Download Report Button */}
                <button
                    onClick={handleDownloadReport}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#0d1f1f] hover:bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] text-xs font-semibold shadow-sm transition-colors cursor-pointer"
                >
                    <Download size={14} />
                    <span>Download Report</span>
                </button>

                {/* Create Shipment Button */}
                <Link
                    href={ROUTES.SHIPMENT_CREATE}
                    className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] hover:opacity-90 text-[#0a0f0f] text-xs font-bold shadow-lg shadow-[#00c9a7]/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                    <Plus size={15} strokeWidth={2.5} />
                    <span>Create Shipment</span>
                </Link>
            </div>
        </div>
    );
}
