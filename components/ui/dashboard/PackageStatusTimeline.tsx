"use client";

import { MoreHorizontal } from "lucide-react";

export default function PackageStatusTimeline() {
    const checkpoints = [
        {
            title: "Package Left Courier Facility",
            location: "Naperville, United State",
            timestamp: "04 October, 2023, 06.00",
            status: "completed",
        },
        {
            title: "Departure Point",
            location: "Celina, Delaware",
            timestamp: "05 October, 2023, 08.00",
            status: "completed",
        },
        {
            title: "Arrival Point",
            location: "Delaware, United State",
            timestamp: "10 October, 2023, 10.00",
            status: "upcoming",
        },
    ];

    return (
        <div className="bg-[#0d1f1f] rounded-3xl p-5 border border-[#1a4a4a] shadow-lg shadow-black/20 flex flex-col justify-between">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-[#e0faf5]">
                    Package Status
                </h3>
                <button
                    className="text-[#3a6b66] hover:text-[#7ecfc4] transition-colors p-1"
                    aria-label="More options"
                >
                    <MoreHorizontal size={18} />
                </button>
            </div>

            {/* Vertical Timeline */}
            <div className="relative pl-6 space-y-5">
                {/* Vertical connecting line */}
                <div className="absolute left-2.5 top-2.5 bottom-3.5 w-0.5 border-l-2 border-dashed border-[#1a4a4a]" />

                {checkpoints.map((cp, idx) => {
                    const isCompleted = cp.status === "completed";

                    return (
                        <div key={idx} className="relative flex items-start justify-between gap-3 text-xs">
                            {/* Checkpoint Dot */}
                            <span
                                className={`absolute -left-[20px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-[#0d1f1f] ${
                                    isCompleted
                                        ? "bg-[#00c9a7] shadow-sm shadow-[#00c9a7]"
                                        : "bg-[#1a4a4a]"
                                }`}
                            />

                            {/* Left Text */}
                            <div>
                                <p className={`font-bold leading-tight ${isCompleted ? "text-[#e0faf5]" : "text-[#7ecfc4]/70"}`}>
                                    {cp.title}
                                </p>
                                <p className="text-[11px] text-[#7ecfc4] mt-0.5">
                                    {cp.location}
                                </p>
                            </div>

                            {/* Timestamp Right */}
                            <span className="text-[11px] text-[#3a6b66] text-right whitespace-nowrap">
                                {cp.timestamp}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
