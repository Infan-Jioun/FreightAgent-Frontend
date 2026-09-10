"use client";

import Link from "next/link";
import { Database, Download, Plus, ChevronDown } from "lucide-react";
import { ROUTES } from "@/app/constants/routes";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

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
                <Button
                    variant="warning"
                    shape="pill"
                    size="sm"
                    onClick={() => toast.info(`Viewing ${pendingCount} pending shipments`)}
                    rightIcon={<ChevronDown size={14} />}
                >
                    Pending Shipment ({pendingCount})
                </Button>

                {/* Download Report Button */}
                <Button
                    variant="secondary"
                    shape="pill"
                    size="sm"
                    onClick={handleDownloadReport}
                    leftIcon={<Download size={14} />}
                >
                    Download Report
                </Button>

                {/* Create Shipment Button */}
                <Button
                    asChild
                    variant="gradient"
                    shape="pill"
                    size="default"
                    leftIcon={<Plus size={15} strokeWidth={2.5} />}
                >
                    <Link href={ROUTES.SHIPMENT_CREATE}>
                        Create Shipment
                    </Link>
                </Button>
            </div>
        </div>
    );
}
