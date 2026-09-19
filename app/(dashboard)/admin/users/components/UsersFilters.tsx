"use client";

import { Filter } from "lucide-react";
import { UserRole } from "@/app/types/admin.types";
import { SearchBar } from "@/components/ui/SearchBar";
import { FilterSelect } from "@/components/ui/FilterSelect";

interface UsersFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    roleFilter: "ALL" | UserRole;
    onRoleFilterChange: (role: "ALL" | UserRole) => void;
    statusFilter: "ALL" | "ACTIVE" | "SUSPENDED";
    onStatusFilterChange: (status: "ALL" | "ACTIVE" | "SUSPENDED") => void;
    pageSize: number;
    onPageSizeChange: (size: number) => void;
}

const ROLE_TABS = [
    { key: "ALL", label: "All Roles" },
    { key: "ADMIN", label: "Admins" },
    { key: "AGENT", label: "Agents" },
    { key: "CUSTOMER", label: "Customers" },
] as const;

const STATUS_OPTIONS = [
    { label: "All Statuses", value: "ALL" },
    { label: "Active Only", value: "ACTIVE" },
    { label: "Suspended Only", value: "SUSPENDED" },
];

const PAGE_SIZE_OPTIONS = [
    { label: "10 / page", value: 10 },
    { label: "20 / page", value: 20 },
    { label: "50 / page", value: 50 },
];

export default function UsersFilters({
    searchQuery,
    onSearchChange,
    roleFilter,
    onRoleFilterChange,
    statusFilter,
    onStatusFilterChange,
    pageSize,
    onPageSizeChange,
}: UsersFiltersProps) {
    const hasActiveFilters =
        Boolean(searchQuery) || roleFilter !== "ALL" || statusFilter !== "ALL";

    const handleClearFilters = () => {
        onSearchChange("");
        onRoleFilterChange("ALL");
        onStatusFilterChange("ALL");
    };

    return (
        <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col lg:flex-row items-center justify-between gap-4 shadow-lg shadow-black/20">
            {/* Left: Role Selection Tabs */}
            <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] w-full lg:w-auto overflow-x-auto">
                {ROLE_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        type="button"
                        onClick={() => onRoleFilterChange(tab.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap cursor-pointer ${
                            roleFilter === tab.key
                                ? "bg-[#00c9a7] text-[#0a0f0f] shadow-xs"
                                : "text-[#7ecfc4] hover:text-[#e0faf5]"
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Right: Reusable SearchBar, FilterSelect & Reset */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
                {/* Reusable SearchBar */}
                <SearchBar
                    value={searchQuery}
                    onChange={onSearchChange}
                    placeholder="Search name, email, or ID..."
                />

                {/* Reusable FilterSelect for Status */}
                <FilterSelect
                    value={statusFilter}
                    onChange={(val) => onStatusFilterChange(val as "ALL" | "ACTIVE" | "SUSPENDED")}
                    options={STATUS_OPTIONS}
                    title="Filter by account status"
                />

                {/* Reusable FilterSelect for Page Size */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#7ecfc4]/70 hidden sm:inline">Show:</span>
                    <FilterSelect
                        value={pageSize}
                        onChange={(val) => onPageSizeChange(Number(val))}
                        options={PAGE_SIZE_OPTIONS}
                        title="Users per page"
                    />
                </div>

                {/* Clear All Filters Button */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={handleClearFilters}
                        className="px-2.5 py-1.5 rounded-xl border border-[#1a4a4a] bg-[#0a1a1a] hover:bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Reset all filters"
                    >
                        <Filter size={12} />
                        <span>Reset</span>
                    </button>
                )}
            </div>
        </div>
    );
}
