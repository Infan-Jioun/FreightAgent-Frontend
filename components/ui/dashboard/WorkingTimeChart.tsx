"use client";

import { useState } from "react";

export default function WorkingTimeChart() {
    const [activeTab, setActiveTab] = useState<"W" | "M" | "6M" | "Y">("W");

    // Sample data for days representing heights up to 8 hours
    const chartData = [
        { day: "Mon", hours: 6.2 },
        { day: "Tue", hours: 7.5 },
        { day: "Wed", hours: 5.8 },
        { day: "Thu", hours: 6.9 },
        { day: "Fri", hours: 7.8 },
        { day: "Sat", hours: 5.4 },
        { day: "Sun", hours: 6.6 },
    ];

    const maxHours = 8;

    return (
        <div className="bg-[#0d1f1f] rounded-3xl p-5 border border-[#1a4a4a] shadow-lg shadow-black/20 flex flex-col justify-between">
            {/* Header with Time Frame Filter Tabs */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#e0faf5]">
                    Working Time Per Day
                </h3>
                <div className="flex items-center gap-1.5 text-xs font-semibold">
                    {(["W", "M", "6M", "Y"] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`transition-all px-2 py-0.5 rounded-lg cursor-pointer ${
                                activeTab === tab
                                    ? "bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30 font-bold"
                                    : "text-[#3a6b66] hover:text-[#7ecfc4]"
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Vertical Bar Chart */}
            <div className="flex items-end gap-2.5 h-32 pt-2">
                {/* Y-Axis scale */}
                <div className="flex flex-col justify-between h-full text-[10px] text-[#3a6b66] font-medium pr-1.5 select-none">
                    <span>8</span>
                    <span>4</span>
                    <span>0</span>
                </div>

                {/* Bars Container */}
                <div className="flex-1 flex items-end justify-between gap-2 h-full border-b border-[#1a4a4a] pb-1">
                    {chartData.map((item, idx) => {
                        const heightPercentage = (item.hours / maxHours) * 100;

                        return (
                            <div
                                key={idx}
                                className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group"
                            >
                                <div
                                    style={{ height: `${heightPercentage}%` }}
                                    className="w-full max-w-[14px] bg-gradient-to-t from-[#00c9a7] to-[#00b4d8] group-hover:from-[#00e5c0] group-hover:to-[#00c9a7] rounded-full transition-all duration-300 relative shadow-sm shadow-[#00c9a7]/30"
                                    title={`${item.day}: ${item.hours} hrs`}
                                >
                                    {/* Hover Tooltip */}
                                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#0a1a1a] text-[#00e5c0] border border-[#1a4a4a] text-[9px] px-1.5 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap">
                                        {item.hours}h
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-5 text-[11px] text-[#7ecfc4] mt-4">
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#1a4a4a]" />
                    <span>Working Time</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#00c9a7] shadow-sm shadow-[#00c9a7]" />
                    <span>Average working time</span>
                </div>
            </div>
        </div>
    );
}
