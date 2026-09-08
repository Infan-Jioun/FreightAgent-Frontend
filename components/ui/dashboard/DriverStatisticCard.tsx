"use client";

import { MoreHorizontal } from "lucide-react";

export default function DriverStatisticCard() {
    return (
        <div className="bg-[#0d1f1f] rounded-3xl p-5 border border-[#1a4a4a] shadow-lg shadow-black/20 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-[#e0faf5]">
                    Driver Statistic
                </h3>
                <button
                    className="text-[#3a6b66] hover:text-[#7ecfc4] transition-colors p-1"
                    aria-label="More options"
                >
                    <MoreHorizontal size={18} />
                </button>
            </div>

            {/* Segmented Horizontal Bar */}
            <div className="w-full flex h-10 rounded-xl overflow-hidden p-1 bg-[#0a1a1a] border border-[#1a4a4a] gap-1 my-2">
                {/* 1. On The way (Teal/Cyan gradient bar) */}
                <div
                    style={{ width: "55%" }}
                    className="h-full bg-gradient-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] rounded-lg flex items-center justify-center text-xs font-bold shadow-sm px-2 truncate"
                >
                    67.86%
                </div>

                {/* 2. Unloading (Amber bar) */}
                <div
                    style={{ width: "27%" }}
                    className="h-full bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 rounded-lg flex items-center justify-center text-xs font-bold px-1.5 truncate"
                >
                    28.32%
                </div>

                {/* 3. Waiting (Slate bar) */}
                <div
                    style={{ width: "18%" }}
                    className="h-full bg-[#1a4a4a] text-[#7ecfc4] rounded-lg flex items-center justify-center text-xs font-bold px-1 truncate"
                >
                    17.67%
                </div>
            </div>

            {/* Labels under the segmented bar */}
            <div className="flex items-center justify-between text-[11px] font-medium text-[#7ecfc4] mt-1 px-1">
                <span className="text-left w-1/3">On The way</span>
                <span className="text-center w-1/3">Unloading</span>
                <span className="text-right w-1/3">Waiting</span>
            </div>
        </div>
    );
}
