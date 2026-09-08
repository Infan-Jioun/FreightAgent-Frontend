"use client";

import { Package, MapPin, Truck } from "lucide-react";

export default function StatCardsRow() {
    return (
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
            {/* Left: Heading & Date Pill */}
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#e0faf5] tracking-tight">
                    Tracking Order Summary
                </h1>
                <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] text-[11px] font-medium shadow-sm">
                    <span>Tue, 10 October 2023</span>
                </div>
            </div>

            {/* Right: 3 Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 xl:gap-5">
                {/* Metric 1: Total Shipments */}
                <div className="flex items-center gap-4 bg-[#0d1f1f] rounded-2xl p-4 sm:p-5 border border-[#1a4a4a] hover:border-[#00c9a7]/50 shadow-lg shadow-black/20 hover:shadow-[#00c9a7]/5 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0] flex-shrink-0">
                        <Package size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-[#7ecfc4]">
                            Total Shipments
                        </p>
                        <div className="flex items-baseline gap-2.5 mt-0.5">
                            <span className="text-2xl font-bold text-[#e0faf5]">
                                876
                            </span>
                            <span className="text-[11px] font-semibold text-[#00e5c0] flex items-center">
                                +3.45% ↗
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metric 2: Package Tracking */}
                <div className="flex items-center gap-4 bg-[#0d1f1f] rounded-2xl p-4 sm:p-5 border border-[#1a4a4a] hover:border-[#00b4d8]/50 shadow-lg shadow-black/20 hover:shadow-[#00b4d8]/5 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-[#00b4d8]/15 border border-[#00b4d8]/30 flex items-center justify-center text-[#00b4d8] flex-shrink-0">
                        <MapPin size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-[#7ecfc4]">
                            Package Tracking
                        </p>
                        <div className="flex items-baseline gap-2.5 mt-0.5">
                            <span className="text-2xl font-bold text-[#e0faf5]">
                                241
                            </span>
                            <span className="text-[11px] font-semibold text-[#ff6b6b] flex items-center">
                                -2.95% ↗
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metric 3: Total Delivered */}
                <div className="flex items-center gap-4 bg-[#0d1f1f] rounded-2xl p-4 sm:p-5 border border-[#1a4a4a] hover:border-[#f59e0b]/50 shadow-lg shadow-black/20 hover:shadow-[#f59e0b]/5 transition-all">
                    <div className="w-12 h-12 rounded-2xl bg-[#f59e0b]/15 border border-[#f59e0b]/30 flex items-center justify-center text-[#f59e0b] flex-shrink-0">
                        <Truck size={22} strokeWidth={2.2} />
                    </div>
                    <div>
                        <p className="text-xs font-medium text-[#7ecfc4]">
                            Total Delivered
                        </p>
                        <div className="flex items-baseline gap-2.5 mt-0.5">
                            <span className="text-2xl font-bold text-[#e0faf5]">
                                1.245
                            </span>
                            <span className="text-[11px] font-semibold text-[#00e5c0] flex items-center">
                                +1.47% ↗
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
