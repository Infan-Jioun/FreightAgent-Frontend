"use client";

/**
 * PaginatedDataTable.tsx
 * 
 * Production-grade, high-performance, reusable Data Table composite with:
 * - FilterTabs with real-time record count badges
 * - Debounced search bar with instant clear action
 * - Flexible toolbar actions & custom filter injection slots
 * - Sortable columns with visual state indicators
 * - Memoized row rendering (React.memo) to prevent unnecessary re-renders in heavy datasets
 * - Skeleton loading rows & customizable empty state
 * - Smart sliding-window pagination bar with dynamic page size selection
 * 
 * Tailwind CSS Target: v4.x Production Standard
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    ChevronLeft,
    ChevronRight,
    Search,
    X,
    Filter,
    Inbox,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── TYPE DEFINITIONS ─────────────────────────────────────────────────────────

export type SortDirection = "asc" | "desc";

export interface DataTableSortConfig {
    sortBy?: string;
    sortDirection?: SortDirection;
    onSortChange?: (columnKey: string, direction: SortDirection) => void;
}

export interface FilterTabOption<TTab extends string | number = string> {
    key: TTab;
    label: string;
    count?: number;
    icon?: React.ComponentType<{ className?: string; size?: number }>;
    disabled?: boolean;
}

export interface DataTableColumn<T> {
    id?: string;
    header: React.ReactNode | ((context: { data: T[]; sortDirection?: SortDirection | null }) => React.ReactNode);
    accessorKey?: keyof T;
    cell?: (item: T, index: number) => React.ReactNode;
    headerClassName?: string;
    className?: string;
    align?: "left" | "center" | "right";
    width?: string | number;
    sortable?: boolean;
    sortKey?: string;
}

export interface DataTableSearchConfig {
    value: string;
    onChange: (query: string) => void;
    placeholder?: string;
    debounceMs?: number;
    className?: string;
}

export interface DataTablePaginationConfig {
    currentPage: number;
    totalPages: number;
    totalCount?: number;
    pageSize?: number;
    itemName?: string;
    onPageChange: (page: number) => void;
    onPageSizeChange?: (size: number) => void;
    pageSizeOptions?: number[];
    className?: string;
}

export interface DataTableEmptyStateConfig {
    icon?: React.ComponentType<{ className?: string; size?: number }>;
    title?: string;
    description?: string;
    action?: React.ReactNode;
}

// ─── 1. FILTER TABS COMPONENT ──────────────────────────────────────────────────

export interface FilterTabsProps<TTab extends string | number = string> {
    tabs: FilterTabOption<TTab>[];
    activeTab: TTab;
    onTabChange: (tab: TTab) => void;
    title?: string;
    showFilterIcon?: boolean;
    className?: string;
}

export function FilterTabs<TTab extends string | number = string>({
    tabs,
    activeTab,
    onTabChange,
    title,
    showFilterIcon = false,
    className = "",
}: FilterTabsProps<TTab>): React.JSX.Element {
    return (
        <div
            role="tablist"
            aria-label={title || "Data filter tabs"}
            className={cn(
                "flex items-center gap-1.5 p-1 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] overflow-x-auto custom-modal-scrollbar shrink-0",
                className
            )}
        >
            {(title || showFilterIcon) && (
                <span className="text-[11px] font-bold text-[#7ecfc4] uppercase px-2 flex items-center gap-1 shrink-0 select-none">
                    {showFilterIcon && <Filter size={12} className="text-[#00c9a7]" />}
                    {title}
                </span>
            )}
            {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                const IconComponent = tab.icon;

                return (
                    <button
                        key={String(tab.key)}
                        role="tab"
                        type="button"
                        aria-selected={isActive}
                        disabled={tab.disabled}
                        onClick={() => onTabChange(tab.key)}
                        className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:pointer-events-none",
                            isActive
                                ? "bg-[#00c9a7] text-[#0a0f0f] shadow-xs"
                                : "text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]/60"
                        )}
                    >
                        {IconComponent && <IconComponent size={13} className="shrink-0" />}
                        <span>{tab.label}</span>
                        {typeof tab.count === "number" && (
                            <span
                                className={cn(
                                    "px-1.5 py-0.5 rounded-md text-[10px] font-mono leading-none transition-colors",
                                    isActive
                                        ? "bg-[#0a0f0f]/25 text-[#0a0f0f]"
                                        : "bg-[#112a2a] text-[#7ecfc4]"
                                )}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ─── 2. TOOLBAR COMPONENT (SEARCH + TABS + FILTERS + ACTIONS) ─────────────────

export interface DataTableToolbarProps<TTab extends string | number = string> {
    tabs?: FilterTabOption<TTab>[];
    activeTab?: TTab;
    onTabChange?: (tab: TTab) => void;
    tabsTitle?: string;
    showFilterIcon?: boolean;
    search?: DataTableSearchConfig;
    filters?: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

export function DataTableToolbar<TTab extends string | number = string>({
    tabs,
    activeTab,
    onTabChange,
    tabsTitle,
    showFilterIcon,
    search,
    filters,
    actions,
    className = "",
}: DataTableToolbarProps<TTab>): React.JSX.Element | null {
    const [localSearch, setLocalSearch] = useState(search?.value ?? "");
    const searchOnChangeRef = useRef(search?.onChange);
    searchOnChangeRef.current = search?.onChange;

    // Sync external prop changes into local input state
    useEffect(() => {
        if (search) {
            setLocalSearch(search.value);
        }
    }, [search?.value]);

    // Stable debounce logic avoiding rapid renders or unnecessary trigger loops
    useEffect(() => {
        if (!search) return;
        const debounceMs = search.debounceMs ?? 350;

        const timeout = setTimeout(() => {
            if (localSearch !== search.value) {
                searchOnChangeRef.current?.(localSearch);
            }
        }, debounceMs);

        return () => clearTimeout(timeout);
    }, [localSearch, search?.value, search?.debounceMs]);

    if (!tabs && !search && !filters && !actions) {
        return null;
    }

    return (
        <section
            aria-label="Table filters and actions toolbar"
            className={cn(
                "p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-lg shadow-black/20",
                className
            )}
        >
            {/* Left: Filter Tabs Row */}
            {tabs && activeTab !== undefined && onTabChange && (
                <FilterTabs
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    title={tabsTitle}
                    showFilterIcon={showFilterIcon}
                />
            )}

            {/* Right: Search, Custom Filter Selectors & Actions */}
            <div className="flex flex-wrap items-center gap-2.5 grow md:grow-0 justify-start md:justify-end">
                {/* Search Bar */}
                {search && (
                    <div className={cn("relative flex-1 md:w-72 min-w-[200px]", search.className)}>
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66] pointer-events-none flex items-center">
                            <Search size={14} />
                        </span>
                        <input
                            type="text"
                            value={localSearch}
                            onChange={(e) => setLocalSearch(e.target.value)}
                            placeholder={search.placeholder ?? "Search records..."}
                            className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:border-[#00c9a7] focus:outline-hidden transition-colors"
                        />
                        {localSearch && (
                            <button
                                type="button"
                                onClick={() => {
                                    setLocalSearch("");
                                    searchOnChangeRef.current?.("");
                                }}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#7ecfc4] hover:text-[#e0faf5] cursor-pointer transition-colors"
                                title="Clear search"
                            >
                                <X size={13} />
                            </button>
                        )}
                    </div>
                )}

                {/* Extra Filter Slots (Dropdowns, Datepickers) */}
                {filters && <div className="flex items-center gap-2">{filters}</div>}

                {/* Custom Action Buttons */}
                {actions && <div className="flex items-center gap-2">{actions}</div>}
            </div>
        </section>
    );
}

// ─── 3. PAGINATION COMPONENT ──────────────────────────────────────────────────

export function DataTablePagination({
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    itemName = "records",
    onPageChange,
    onPageSizeChange,
    pageSizeOptions = [10, 20, 50],
    className = "",
}: DataTablePaginationConfig): React.JSX.Element | null {
    if (totalPages <= 1 && (!totalCount || totalCount <= 0)) {
        return null;
    }

    const startItem = pageSize ? (currentPage - 1) * pageSize + 1 : undefined;
    const endItem = pageSize && totalCount ? Math.min(currentPage * pageSize, totalCount) : undefined;

    // Sliding page numbers window logic
    const pageNumbers = useMemo((): (number | "ellipsis")[] => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        const pages: (number | "ellipsis")[] = [];
        pages.push(1);

        if (currentPage > 3) {
            pages.push("ellipsis");
        }

        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        if (currentPage < totalPages - 2) {
            pages.push("ellipsis");
        }

        pages.push(totalPages);
        return pages;
    }, [currentPage, totalPages]);

    return (
        <div
            className={cn(
                "p-3.5 border-t border-[#1a4a4a] bg-[#0a1a1a]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7ecfc4]",
                className
            )}
        >
            {/* Record range indicator */}
            <div className="flex items-center gap-3">
                <span>
                    {startItem && endItem && typeof totalCount === "number" ? (
                        <>
                            Showing <span className="font-semibold text-[#e0faf5]">{startItem}</span> to{" "}
                            <span className="font-semibold text-[#e0faf5]">{endItem}</span> of{" "}
                            <span className="font-semibold text-[#e0faf5]">{totalCount}</span> {itemName}
                        </>
                    ) : (
                        <>
                            Page <span className="font-semibold text-[#e0faf5]">{currentPage}</span> of{" "}
                            <span className="font-semibold text-[#e0faf5]">{totalPages}</span>
                            {typeof totalCount === "number" && ` (${totalCount} total ${itemName})`}
                        </>
                    )}
                </span>

                {/* Optional Page Size Selector */}
                {onPageSizeChange && (
                    <div className="hidden sm:flex items-center gap-1.5 ml-2 border-l border-[#1a4a4a] pl-3">
                        <span className="text-[11px] text-[#7ecfc4]/70">Show:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => onPageSizeChange(Number(e.target.value))}
                            className="bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] rounded-lg px-2 py-1 focus:border-[#00c9a7] focus:outline-hidden cursor-pointer"
                        >
                            {pageSizeOptions.map((opt) => (
                                <option key={opt} value={opt}>
                                    {opt} / page
                                </option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Page Buttons */}
            {totalPages > 1 && (
                <div className="flex items-center gap-1.5">
                    {/* Previous Button */}
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage <= 1}
                        className="min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]"
                        title="Previous page"
                    >
                        <ChevronLeft size={14} />
                    </button>

                    {/* Page Numbers */}
                    {pageNumbers.map((p, idx) => {
                        if (p === "ellipsis") {
                            return (
                                <span
                                    key={`ellipsis-${idx}`}
                                    className="min-w-8 h-8 flex items-center justify-center text-xs text-[#3a6b66] select-none font-bold"
                                >
                                    …
                                </span>
                            );
                        }

                        const isActive = p === currentPage;
                        return (
                            <button
                                key={p}
                                type="button"
                                onClick={() => onPageChange(p)}
                                className={cn(
                                    "min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer",
                                    isActive
                                        ? "bg-[#00c9a7] text-[#0a0f0f] border border-[#00c9a7] shadow-xs"
                                        : "bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]"
                                )}
                            >
                                {p}
                            </button>
                        );
                    })}

                    {/* Next Button */}
                    <button
                        type="button"
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage >= totalPages}
                        className="min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-colors flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:pointer-events-none bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]"
                        title="Next page"
                    >
                        <ChevronRight size={14} />
                    </button>
                </div>
            )}
        </div>
    );
}

// ─── 4. MEMOIZED ROW COMPONENT (PERFORMANCE RULE 6) ───────────────────────────

interface DataTableRowProps<T> {
    item: T;
    index: number;
    columns: DataTableColumn<T>[];
    onRowClick?: (item: T) => void;
    rowClassName?: string | ((item: T, index: number) => string);
}

function DataTableRowInternal<T>({
    item,
    index,
    columns,
    onRowClick,
    rowClassName,
}: DataTableRowProps<T>): React.JSX.Element {
    const customRowClass =
        typeof rowClassName === "function"
            ? rowClassName(item, index)
            : rowClassName;

    const handleClick = useCallback(() => {
        onRowClick?.(item);
    }, [onRowClick, item]);

    return (
        <tr
            onClick={onRowClick ? handleClick : undefined}
            className={cn(
                "transition-colors",
                onRowClick
                    ? "hover:bg-[#112a2a]/40 cursor-pointer"
                    : "hover:bg-[#112a2a]/20",
                customRowClass
            )}
        >
            {columns.map((col, cIdx) => {
                const alignClass =
                    col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left";

                let cellContent: React.ReactNode = null;
                if (col.cell) {
                    cellContent = col.cell(item, index);
                } else if (col.accessorKey) {
                    const val = item[col.accessorKey];
                    cellContent = val !== undefined && val !== null ? String(val) : "—";
                }

                return (
                    <td
                        key={col.id || String(col.accessorKey) || cIdx}
                        className={cn("py-3.5 px-4 align-middle", alignClass, col.className)}
                    >
                        {cellContent}
                    </td>
                );
            })}
        </tr>
    );
}

// Type assertion for generic React.memo component
export const DataTableRow = React.memo(DataTableRowInternal) as typeof DataTableRowInternal;

// ─── 5. BASE DATA TABLE COMPONENT ─────────────────────────────────────────────

export interface DataTableProps<T> {
    data: T[];
    columns: DataTableColumn<T>[];
    rowKey: (item: T, index: number) => string | number;
    loading?: boolean;
    loadingRowCount?: number;
    emptyState?: DataTableEmptyStateConfig;
    onRowClick?: (item: T) => void;
    rowClassName?: string | ((item: T, index: number) => string);
    tableClassName?: string;
    containerClassName?: string;
    sortConfig?: DataTableSortConfig;
}

export function DataTable<T>({
    data,
    columns,
    rowKey,
    loading = false,
    loadingRowCount = 5,
    emptyState,
    onRowClick,
    rowClassName,
    tableClassName = "",
    containerClassName = "",
    sortConfig,
}: DataTableProps<T>): React.JSX.Element {
    const EmptyIcon = emptyState?.icon || Inbox;

    const handleHeaderClick = useCallback(
        (col: DataTableColumn<T>) => {
            if (!col.sortable || !sortConfig?.onSortChange) return;
            const key = col.sortKey || col.id || String(col.accessorKey);
            if (!key) return;

            const isCurrent = sortConfig.sortBy === key;
            const nextDirection: SortDirection =
                isCurrent && sortConfig.sortDirection === "asc" ? "desc" : "asc";

            sortConfig.onSortChange(key, nextDirection);
        },
        [sortConfig]
    );

    return (
        <div
            className={cn(
                "rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden",
                containerClassName
            )}
        >
            <div className="overflow-x-auto custom-modal-scrollbar">
                <table className={cn("w-full text-left text-xs border-collapse", tableClassName)}>
                    <thead>
                        <tr className="border-b border-[#1a4a4a] bg-[#0a1a1a]/50 text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider">
                            {columns.map((col, idx) => {
                                const alignClass =
                                    col.align === "right"
                                        ? "text-right"
                                        : col.align === "center"
                                        ? "text-center"
                                        : "text-left";

                                const sortKey = col.sortKey || col.id || String(col.accessorKey);
                                const isSorted = sortConfig?.sortBy === sortKey;
                                const sortDirection = isSorted ? sortConfig.sortDirection : null;

                                return (
                                    <th
                                        key={col.id || String(col.accessorKey) || idx}
                                        style={col.width ? { width: col.width } : undefined}
                                        onClick={() => handleHeaderClick(col)}
                                        className={cn(
                                            "py-3.5 px-4 font-bold select-none",
                                            alignClass,
                                            col.sortable && "cursor-pointer hover:text-[#7ecfc4] transition-colors",
                                            col.headerClassName
                                        )}
                                    >
                                        <div
                                            className={cn(
                                                "inline-flex items-center gap-1.5",
                                                col.align === "right" && "justify-end",
                                                col.align === "center" && "justify-center"
                                            )}
                                        >
                                            <span>
                                                {typeof col.header === "function"
                                                    ? col.header({ data, sortDirection })
                                                    : col.header}
                                            </span>

                                            {col.sortable && (
                                                <span className="shrink-0 text-[#7ecfc4]">
                                                    {sortDirection === "asc" ? (
                                                        <ArrowUp size={12} className="text-[#00c9a7]" />
                                                    ) : sortDirection === "desc" ? (
                                                        <ArrowDown size={12} className="text-[#00c9a7]" />
                                                    ) : (
                                                        <ArrowUpDown size={12} className="opacity-40" />
                                                    )}
                                                </span>
                                            )}
                                        </div>
                                    </th>
                                );
                            })}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a4a4a]/40">
                        {loading ? (
                            Array.from({ length: loadingRowCount }).map((_, rIdx) => (
                                <tr key={`skeleton-row-${rIdx}`} className="animate-pulse">
                                    {columns.map((col, cIdx) => (
                                        <td
                                            key={`skeleton-cell-${rIdx}-${cIdx}`}
                                            className="py-3.5 px-4 align-middle"
                                        >
                                            <div
                                                className={cn(
                                                    "h-4 rounded-md bg-[#112a2a]",
                                                    col.align === "right"
                                                        ? "ml-auto w-16"
                                                        : col.align === "center"
                                                        ? "mx-auto w-20"
                                                        : "w-3/4 max-w-[180px]"
                                                )}
                                            />
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="py-16 px-4 text-center">
                                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                                        <div className="w-12 h-12 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-center text-[#7ecfc4]/50 mb-1">
                                            <EmptyIcon size={24} />
                                        </div>
                                        <h3 className="text-sm font-bold text-[#e0faf5]">
                                            {emptyState?.title ?? "No records found"}
                                        </h3>
                                        <p className="text-xs text-[#7ecfc4]/80">
                                            {emptyState?.description ??
                                                "No data matched your criteria or none has been created yet."}
                                        </p>
                                        {emptyState?.action && (
                                            <div className="mt-3">{emptyState.action}</div>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            data.map((item, index) => {
                                const key = rowKey(item, index);
                                return (
                                    <DataTableRow
                                        key={key}
                                        item={item}
                                        index={index}
                                        columns={columns}
                                        onRowClick={onRowClick}
                                        rowClassName={rowClassName}
                                    />
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ─── 6. ALL-IN-ONE COMPOSITE: PAGINATED DATA TABLE ─────────────────────────────

export interface PaginatedDataTableProps<T, TTab extends string | number = string> {
    // Data & Columns
    data: T[];
    columns: DataTableColumn<T>[];
    rowKey: (item: T, index: number) => string | number;

    // Optional Filter Tabs
    tabs?: FilterTabOption<TTab>[];
    activeTab?: TTab;
    onTabChange?: (tab: TTab) => void;
    tabsTitle?: string;
    showFilterIcon?: boolean;

    // Optional Search Toolbar & Filter Slots
    search?: DataTableSearchConfig;
    toolbarFilters?: React.ReactNode;
    toolbarActions?: React.ReactNode;
    toolbarClassName?: string;

    // Optional Sorting Configuration
    sortConfig?: DataTableSortConfig;

    // Optional Pagination
    pagination?: DataTablePaginationConfig;

    // Table States & Customizations
    loading?: boolean;
    loadingRowCount?: number;
    emptyState?: DataTableEmptyStateConfig;
    onRowClick?: (item: T) => void;
    rowClassName?: string | ((item: T, index: number) => string);
    tableClassName?: string;
    containerClassName?: string;
    className?: string;
}

export function PaginatedDataTable<T, TTab extends string | number = string>({
    data,
    columns,
    rowKey,
    tabs,
    activeTab,
    onTabChange,
    tabsTitle,
    showFilterIcon,
    search,
    toolbarFilters,
    toolbarActions,
    toolbarClassName,
    sortConfig,
    pagination,
    loading = false,
    loadingRowCount = 5,
    emptyState,
    onRowClick,
    rowClassName,
    tableClassName,
    containerClassName,
    className = "space-y-4",
}: PaginatedDataTableProps<T, TTab>): React.JSX.Element {
    const hasToolbar = Boolean(tabs || search || toolbarFilters || toolbarActions);

    return (
        <div className={cn("w-full", className)}>
            {/* Top Toolbar */}
            {hasToolbar && (
                <DataTableToolbar
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    tabsTitle={tabsTitle}
                    showFilterIcon={showFilterIcon}
                    search={search}
                    filters={toolbarFilters}
                    actions={toolbarActions}
                    className={toolbarClassName}
                />
            )}

            {/* Core Table Container */}
            <div
                className={cn(
                    "rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden",
                    containerClassName
                )}
            >
                <DataTable
                    data={data}
                    columns={columns}
                    rowKey={rowKey}
                    loading={loading}
                    loadingRowCount={loadingRowCount}
                    emptyState={emptyState}
                    onRowClick={onRowClick}
                    rowClassName={rowClassName}
                    tableClassName={tableClassName}
                    sortConfig={sortConfig}
                    containerClassName="border-0 rounded-none shadow-none"
                />

                {/* Bottom Pagination Bar */}
                {pagination && <DataTablePagination {...pagination} />}
            </div>
        </div>
    );
}

export default PaginatedDataTable;
