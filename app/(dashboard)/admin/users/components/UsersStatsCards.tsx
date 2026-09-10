"use client";

import { Users, Truck, CheckCircle2, Shield } from "lucide-react";
import { IAdminUser } from "@/app/types/admin.types";

interface UsersStatsCardsProps {
    users: IAdminUser[];
}

export default function UsersStatsCards({ users }: UsersStatsCardsProps) {
    const totalCount = users.length;
    const verifiedCount = users.filter((u) => u.emailVerified).length;
    const agentCount = users.filter((u) => u.role === "AGENT").length;
    const pendingAgentCount = users.filter((u) => u.role === "AGENT" && !u.emailVerified).length;
    const customerCount = users.filter((u) => u.role === "CUSTOMER").length;
    const adminCount = users.filter((u) => u.role === "ADMIN").length;

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* Total Accounts */}
            <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-sm">
                <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Total Accounts</span>
                    <Users size={16} className="text-[#00c9a7]" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{totalCount}</p>
                <span className="text-[10px] text-[#00e5c0] font-semibold mt-0.5 block">
                    {verifiedCount} verified accounts
                </span>
            </div>

            {/* Freigeht Agents */}
            <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-sm">
                <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Freigeht Agents</span>
                    <Truck size={16} className="text-[#f59e0b]" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{agentCount}</p>
                <span className="text-[10px] text-[#f59e0b] font-semibold mt-0.5 block">
                    {pendingAgentCount} awaiting verification
                </span>
            </div>

            {/* Customers */}
            <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-sm">
                <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Customers</span>
                    <CheckCircle2 size={16} className="text-[#00b4d8]" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{customerCount}</p>
                <span className="text-[10px] text-[#7ecfc4] font-semibold mt-0.5 block">
                    Active shippers
                </span>
            </div>

            {/* Platform Admins */}
            <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-sm">
                <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider">Platform Admins</span>
                    <Shield size={16} className="text-[#f43f5e]" />
                </div>
                <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{adminCount}</p>
                <span className="text-[10px] text-[#f43f5e] font-semibold mt-0.5 block">
                    Full privilege access
                </span>
            </div>
        </div>
    );
}
