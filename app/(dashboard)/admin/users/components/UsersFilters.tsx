"use client";

import { Search } from "lucide-react";
import { UserRole } from "@/app/types/admin.types";

interface UsersFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    roleFilter: "ALL" | UserRole;
    onRoleFilterChange: (role: "ALL" | UserRole) => void;
    verifiedFilter: "ALL" | "VERIFIED" | "UNVERIFIED";
    onVerifiedFilterChange: (verified: "ALL" | "VERIFIED" | "UNVERIFIED") => void;
}

const ROLE_TABS = [
    { key: "ALL", label: "All Roles" },
    { key: "ADMIN", label: "Admins" },
    { key: "AGENT", label: "Agents" },
    { key: "CUSTOMER", label: "Customers" },
] as const;

export default function UsersFilters({
    searchQuery,
    onSearchChange,
    roleFilter,
    onRoleFilterChange,
    verifiedFilter,
    onVerifiedFilterChange,
}: UsersFiltersProps) {
    return (
        <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg shadow-black/20">
            {/* Role Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] w-full md:w-auto overflow-x-auto">
                {ROLE_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onRoleFilterChange(tab.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                            roleFilter === tab.key
                                ? "bg-[#00c9a7] text-[#0a0f0f] shadow-sm"
                                : "text-[#7ecfc4] hover:text-[#e0faf5]"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Verification Status Filter + Search Input */}
            <div className="flex items-center gap-2.5 w-full md:w-auto">
                <select
                    value={verifiedFilter}
                    onChange={(e) => onVerifiedFilterChange(e.target.value as any)}
                    className="px-3 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-none focus:border-[#00c9a7] cursor-pointer"
                >
                    <option value="ALL">All Status</option>
                    <option value="VERIFIED">Verified Only</option>
                    <option value="UNVERIFIED">Unverified Only</option>
                </select>

                <div className="relative w-full md:w-64">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search name, email, ID..."
                        className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-none focus:border-[#00c9a7]"
                    >
                    </input>
                </div>
            </div>
        </div>
    );
}
