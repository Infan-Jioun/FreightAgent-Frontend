"use client";

import React from "react";
import Link from "next/link";
import { ShieldAlert, ArrowLeft } from "lucide-react";

export function AdminShipmentsUnauthorized() {
    return (
        <div className="min-h-[60vh] flex items-center justify-center p-4">
            <div className="w-full max-w-md p-8 rounded-3xl bg-[#0d1f1f] border border-rose-500/30 text-center space-y-5 shadow-2xl">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                    <ShieldAlert size={28} />
                </div>

                <div className="space-y-2">
                    <h2 className="text-xl font-black text-[#e0faf5] tracking-tight">
                        Admin Authorization Required
                    </h2>
                    <p className="text-xs text-[#7ecfc4] leading-relaxed">
                        Access to the Central Freight & Consignment Manifest is restricted to verified platform administrators only.
                    </p>
                </div>

                <div className="pt-2">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] text-xs font-black transition-colors"
                    >
                        <ArrowLeft size={14} />
                        <span>Return to Main Dashboard</span>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default AdminShipmentsUnauthorized;
