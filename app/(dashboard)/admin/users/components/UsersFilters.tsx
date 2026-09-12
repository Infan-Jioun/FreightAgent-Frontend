"use client";

import { useState, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { UserRole } from "@/app/types/admin.types";

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

const PAGE_SIZE_OPTIONS = [10, 20, 50];

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
    const [localSearch, setLocalSearch] = useState(searchQuery);

    // Synchronize local input if prop is cleared externally
    useEffect(() => {
        setLocalSearch(searchQuery);
    }, [searchQuery]);

    // Debounced search (350ms)
    useEffect(() => {
        const handler = setTimeout(() => {
            if (localSearch !== searchQuery) {
                onSearchChange(localSearch);
            }
        }, 350);

        return () => clearTimeout(handler);
    }, [localSearch, searchQuery, onSearchChange]);

    const hasActiveFilters =
        Boolean(searchQuery) || roleFilter !== "ALL" || statusFilter !== "ALL";

    const handleClearFilters = () => {
        setLocalSearch("");
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

            {/* Right: Search, Status Dropdown, Page Size & Clear Filter */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-start lg:justify-end">
                {/* Search Input with Clear Button */}
                <div className="relative flex-1 sm:w-64 min-w-[200px]">
                    <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66] pointer-events-none"
                    />
                    <input
                        type="text"
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                        placeholder="Search name, email, or ID..."
                        className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:border-[#00c9a7] focus:outline-hidden transition-colors"
                    />
                    {localSearch && (
                        <button
                            type="button"
                            onClick={() => {
                                setLocalSearch("");
                                onSearchChange("");
                            }}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7ecfc4] hover:text-[#e0faf5] cursor-pointer"
                            title="Clear search"
                        >
                            <X size={13} />
                        </button>
                    )}
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                    <select
                        value={statusFilter}
                        onChange={(e) =>
                            onStatusFilterChange(
                                e.target.value as "ALL" | "ACTIVE" | "SUSPENDED"
                            )
                        }
                        className="px-3 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00c9a7] focus:outline-hidden cursor-pointer"
                        title="Filter by account status"
                    >
                        <option value="ALL">All Statuses</option>
                        <option value="ACTIVE">Active Only</option>
                        <option value="SUSPENDED">Suspended Only</option>
                    </select>
                </div>

                {/* Page Size Selector */}
                <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-[#7ecfc4]/70 hidden sm:inline">Show:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => onPageSizeChange(Number(e.target.value))}
                        className="px-2.5 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] focus:border-[#00c9a7] focus:outline-hidden cursor-pointer"
                        title="Users per page"
                    >
                        {PAGE_SIZE_OPTIONS.map((size) => (
                            <option key={size} value={size}>
                                {size} / page
                            </option>
                        ))}
                    </select>
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
