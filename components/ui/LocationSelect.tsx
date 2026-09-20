"use client";

import React, {
    useState,
    useRef,
    useEffect,
    useMemo,
    forwardRef,
    useImperativeHandle,
} from "react";
import {
    MapPin,
    Search,
    X,
    Check,
    ChevronDown,
    Ship,
    Plane,
    Warehouse,
    Loader2,
} from "lucide-react";
import type { ILocation, ILocationOption } from "@/app/types/location.types";
import { useLocationStore } from "@/app/store/locationStore";

export interface LocationSelectProps {
    name?: string;
    value?: string;
    defaultValue?: string;
    onChange?: (value: string) => void;
    onBlur?: () => void;
    locations?: ILocation[];
    loading?: boolean;
    placeholder?: string;
    excludeValue?: string;
    error?: string;
    disabled?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

/**
 * Reusable Searchable LocationSelect Component
 * Integrated with useLocationStore (app/store/locationStore.ts)
 * Includes an internal live search bar, facility type quick filters, port code badges,
 * and keyboard / click-outside dismissal.
 */
export const LocationSelect = forwardRef<HTMLInputElement, LocationSelectProps>(
    (
        {
            name,
            value: controlledValue,
            defaultValue = "",
            onChange,
            onBlur,
            locations: propsLocations,
            loading: propsLoading = false,
            placeholder = "-- Select Port / Terminal Facility --",
            excludeValue,
            error,
            disabled = false,
            className = "",
            icon,
        },
        ref
    ) => {
        const { fetchLocations, searchLocations, locations: storeLocations, isLoading: storeLoading } = useLocationStore();

        const [isOpen, setIsOpen] = useState(false);
        const [searchQuery, setSearchQuery] = useState("");
        const [typeFilter, setTypeFilter] = useState<"ALL" | "SEA_PORT" | "AIR_PORT" | "INLAND_PORT">("ALL");
        const [internalValue, setInternalValue] = useState(
            controlledValue !== undefined ? controlledValue : defaultValue
        );

        // Dynamic locations fetched directly from store
        const [apiLocations, setApiLocations] = useState<ILocation[]>(
            propsLocations && propsLocations.length > 0 ? propsLocations : storeLocations
        );
        const [fetchingFromApi, setFetchingFromApi] = useState(false);

        const containerRef = useRef<HTMLDivElement>(null);
        const searchInputRef = useRef<HTMLInputElement>(null);
        const hiddenInputRef = useRef<HTMLInputElement>(null);

        useImperativeHandle(ref, () => hiddenInputRef.current as HTMLInputElement);

        // Keep internal state synced when controlled from outside (e.g. React Hook Form watch)
        useEffect(() => {
            if (controlledValue !== undefined) {
                setInternalValue(controlledValue);
            }
        }, [controlledValue]);

        // Sync when propsLocations or storeLocations change
        useEffect(() => {
            if (propsLocations && propsLocations.length > 0) {
                setApiLocations(propsLocations);
            } else if (storeLocations && storeLocations.length > 0) {
                setApiLocations(storeLocations);
            }
        }, [propsLocations, storeLocations]);

        // Fetch from useLocationStore on mount if propsLocations not provided or empty
        useEffect(() => {
            if (propsLocations && propsLocations.length > 0) return;

            let isCancelled = false;
            const loadFromApi = async () => {
                setFetchingFromApi(true);
                try {
                    const res = await fetchLocations({
                        page: 1,
                        limit: 500,
                        isDeleted: false,
                        sortBy: "name",
                        sortOrder: "asc",
                    }, true);
                    if (isCancelled) return;
                    const list = res?.data ?? storeLocations;

                    if (list && list.length > 0) {
                        const uniqueMap = new Map<string, ILocation>();
                        list.filter((l) => !l.isBlocked && !l.isDeleted).forEach((l) => {
                            const key = (l.code || l.id || "").toUpperCase();
                            if (key && !uniqueMap.has(key)) uniqueMap.set(key, l);
                        });

                        const sorted = Array.from(uniqueMap.values()).sort((a, b) =>
                            (a.name || "").localeCompare(b.name || "")
                        );
                        setApiLocations(sorted);
                    }
                } catch (err) {
                    console.error("Failed to load locations from store:", err);
                } finally {
                    if (!isCancelled) setFetchingFromApi(false);
                }
            };

            loadFromApi();
            return () => {
                isCancelled = true;
            };
        }, [propsLocations, fetchLocations]);

        // Live search via useLocationStore when typing in the search bar
        useEffect(() => {
            const q = searchQuery.trim();
            if (q.length < 2) return;

            const timer = setTimeout(async () => {
                try {
                    const searchResults = await searchLocations(q, 25);
                    if (Array.isArray(searchResults) && searchResults.length > 0) {
                        setApiLocations((prev) => {
                            const existingMap = new Map<string, ILocation>();
                            prev.forEach((loc) => {
                                const key = (loc.code || loc.id || "").toUpperCase();
                                if (key) existingMap.set(key, loc);
                            });

                            let addedAny = false;
                            searchResults.forEach((item: ILocationOption) => {
                                const codeKey = (item.code || item.id || "").toUpperCase();
                                if (codeKey && !existingMap.has(codeKey)) {
                                    existingMap.set(codeKey, {
                                        id: item.id || `search-${codeKey}`,
                                        name: item.name,
                                        code: item.code,
                                        city: item.city || "",
                                        country: item.country || "",
                                        countryCode: item.countryCode || "",
                                        region: "Global",
                                        type: item.type || "SEA_PORT",
                                        latitude: item.latitude || 0,
                                        longitude: item.longitude || 0,
                                        isBlocked: false,
                                        blockedReason: null,
                                        createdAt: new Date().toISOString(),
                                        updatedAt: new Date().toISOString(),
                                    });
                                    addedAny = true;
                                }
                            });

                            if (!addedAny) return prev;
                            return Array.from(existingMap.values()).sort((a, b) =>
                                (a.name || "").localeCompare(b.name || "")
                            );
                        });
                    }
                } catch {
                    // Ignore backend search errors, local filtering takes care of client
                }
            }, 300);

            return () => clearTimeout(timer);
        }, [searchQuery]);

        const activeLocations = propsLocations && propsLocations.length > 0 ? propsLocations : apiLocations;
        const isLoading = propsLoading || fetchingFromApi;

        // Auto-focus the search bar when dropdown opens
        useEffect(() => {
            if (isOpen) {
                setTimeout(() => {
                    searchInputRef.current?.focus();
                }, 50);
            } else {
                setSearchQuery("");
                setTypeFilter("ALL");
                if (onBlur) onBlur();
            }
        }, [isOpen, onBlur]);

        // Dismiss dropdown on outside click or Escape key
        useEffect(() => {
            const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
                if (
                    containerRef.current &&
                    !containerRef.current.contains(e.target as Node)
                ) {
                    setIsOpen(false);
                }
            };

            const handleKeyDown = (e: KeyboardEvent) => {
                if (e.key === "Escape") {
                    setIsOpen(false);
                }
            };

            if (isOpen) {
                document.addEventListener("mousedown", handleOutsideClick);
                document.addEventListener("touchstart", handleOutsideClick);
                document.addEventListener("keydown", handleKeyDown);
            }

            return () => {
                document.removeEventListener("mousedown", handleOutsideClick);
                document.removeEventListener("touchstart", handleOutsideClick);
                document.removeEventListener("keydown", handleKeyDown);
            };
        }, [isOpen]);

        // Count items per category across active locations
        const categoryCounts = useMemo(() => {
            let seaCount = 0;
            let airCount = 0;
            let inlandCount = 0;

            activeLocations.forEach((loc) => {
                if (loc.isBlocked) return;
                if (loc.type === "AIR_PORT") {
                    airCount++;
                } else if (
                    loc.type === "INLAND_PORT" ||
                    loc.type === "ROAD_HUB" ||
                    loc.type === "RAIL_TERMINAL"
                ) {
                    inlandCount++;
                } else {
                    seaCount++;
                }
            });

            return {
                all: seaCount + airCount + inlandCount,
                sea: seaCount,
                air: airCount,
                inland: inlandCount,
            };
        }, [activeLocations]);

        // Filter locations based on live search query and facility type tab
        const filteredLocations = useMemo(() => {
            const q = searchQuery.trim().toLowerCase();

            return activeLocations.filter((loc) => {
                if (loc.isBlocked) return false;

                // Check type filter
                if (typeFilter === "SEA_PORT" && loc.type !== "SEA_PORT") return false;
                if (typeFilter === "AIR_PORT" && loc.type !== "AIR_PORT") return false;
                if (
                    typeFilter === "INLAND_PORT" &&
                    loc.type !== "INLAND_PORT" &&
                    loc.type !== "ROAD_HUB" &&
                    loc.type !== "RAIL_TERMINAL"
                ) {
                    return false;
                }

                if (!q) return true;

                const nameStr = (loc.name || "").toLowerCase();
                const codeStr = (loc.code || "").toLowerCase();
                const cityStr = (loc.city || "").toLowerCase();
                const countryStr = (loc.country || "").toLowerCase();
                const regionStr = (loc.region || "").toLowerCase();
                const typeStr = (loc.type || "").toLowerCase();
                return (
                    nameStr.includes(q) ||
                    codeStr.includes(q) ||
                    cityStr.includes(q) ||
                    countryStr.includes(q) ||
                    regionStr.includes(q) ||
                    typeStr.includes(q)
                );
            });
        }, [activeLocations, searchQuery, typeFilter]);

        // Group filtered locations by Country / Region
        const groupedLocations = useMemo(() => {
            const map: Record<string, ILocation[]> = {};
            filteredLocations.forEach((loc) => {
                const countryKey = loc.country || loc.region || "Global Maritime Hubs";
                if (!map[countryKey]) {
                    map[countryKey] = [];
                }
                map[countryKey].push(loc);
            });

            // Sort countries alphabetically
            const sortedKeys = Object.keys(map).sort((a, b) => a.localeCompare(b));
            const result: Record<string, ILocation[]> = {};
            sortedKeys.forEach((k) => {
                result[k] = map[k].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
            });
            return result;
        }, [filteredLocations]);

        const totalFilteredCount = filteredLocations.length;

        // Handler when user picks a location
        const handleSelect = (loc: ILocation) => {
            const formattedValue = `${loc.name} (${loc.code}), ${loc.country}`;
            setInternalValue(formattedValue);
            setIsOpen(false);
            setSearchQuery("");

            if (onChange) {
                onChange(formattedValue);
            }

            // Sync hidden input for native form dispatch
            if (hiddenInputRef.current) {
                hiddenInputRef.current.value = formattedValue;
                const event = new Event("change", { bubbles: true });
                hiddenInputRef.current.dispatchEvent(event);
            }
        };

        const handleClear = (e: React.MouseEvent) => {
            e.stopPropagation();
            setInternalValue("");
            if (onChange) onChange("");
            if (hiddenInputRef.current) {
                hiddenInputRef.current.value = "";
                const event = new Event("change", { bubbles: true });
                hiddenInputRef.current.dispatchEvent(event);
            }
        };

        // Render appropriate icon based on location type
        const getLocationIcon = (type?: string) => {
            switch (type) {
                case "AIR_PORT":
                    return <Plane size={13} className="text-sky-400 shrink-0" />;
                case "INLAND_PORT":
                case "ROAD_HUB":
                case "RAIL_TERMINAL":
                    return <Warehouse size={13} className="text-amber-400 shrink-0" />;
                case "SEA_PORT":
                default:
                    return <Ship size={13} className="text-[#00c9a7] shrink-0" />;
            }
        };

        // Keyboard handler on the search input: select first available on Enter
        const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
                e.preventDefault(); // Never submit the parent form on Enter
                const firstAvailable = filteredLocations.find(
                    (loc) => !excludeValue || `${loc.name} (${loc.code}), ${loc.country}` !== excludeValue
                );
                if (firstAvailable) {
                    handleSelect(firstAvailable);
                }
            } else if (e.key === "Escape") {
                e.preventDefault();
                setIsOpen(false);
            }
        };

        return (
            <div ref={containerRef} className={`relative w-full ${isOpen ? "z-50" : "z-10"}`}>
                {/* Hidden input to maintain native React Hook Form ref registration */}
                <input
                    type="hidden"
                    name={name}
                    ref={hiddenInputRef}
                    value={internalValue}
                />

                {/* Main Select Trigger Button */}
                <button
                    type="button"
                    disabled={disabled || isLoading}
                    onClick={() => setIsOpen((prev) => !prev)}
                    className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer shadow-xs ${
                        disabled || isLoading
                            ? "bg-[#0a1a1a]/60 border-[#1a4a4a] text-gray-500 cursor-not-allowed opacity-60"
                            : isOpen
                            ? "bg-[#0d1f1f] border-[#00c9a7] ring-3 ring-[#00c9a7]/20"
                            : error
                            ? "bg-[#0a1a1a] border-[#e11d48] text-[#e0faf5]"
                            : "bg-[#0a1a1a] border-[#1a4a4a] hover:border-[#00c9a7]/60 text-[#e0faf5]"
                    } ${className}`}
                >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                        {isLoading ? (
                            <Loader2 size={14} className="animate-spin text-[#00c9a7] shrink-0" />
                        ) : icon ? (
                            icon
                        ) : (
                            <MapPin size={14} className="text-[#00c9a7] shrink-0" />
                        )}

                        {internalValue ? (
                            <span className="truncate font-medium text-[#e0faf5]">
                                {internalValue}
                            </span>
                        ) : (
                            <span className="text-[#7ecfc4]/40 truncate">
                                {isLoading ? "Loading network locations..." : placeholder}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                        {internalValue && !disabled && (
                            <span
                                role="button"
                                tabIndex={0}
                                onClick={handleClear}
                                title="Clear selection"
                                className="p-1 rounded-md text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            >
                                <X size={12} />
                            </span>
                        )}
                        <ChevronDown
                            size={14}
                            className={`text-[#7ecfc4] transition-transform duration-200 ${
                                isOpen ? "rotate-180 text-[#00c9a7]" : ""
                            }`}
                        />
                    </div>
                </button>

                {/* Dropdown Floating Popover */}
                {isOpen && (
                    <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[380px] animate-in fade-in zoom-in-95 duration-150">
                        {/* Search Bar Input & Filter Header (Sticky Top) */}
                        <div className="p-2.5 border-b border-[#1a4a4a] bg-[#0a1a1a]/95 backdrop-blur-xs shrink-0 space-y-2">
                            {/* Search Input */}
                            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0d1f1f] border border-[#1a4a4a] focus-within:border-[#00c9a7] focus-within:ring-2 focus-within:ring-[#00c9a7]/20 transition-all">
                                <Search size={14} className="text-[#00c9a7] shrink-0" />
                                <input
                                    ref={searchInputRef}
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyDown={handleSearchKeyDown}
                                    placeholder="Search by facility, port, city, code (e.g. Dubai, BDCGP, DAC)..."
                                    className="flex-1 bg-transparent text-xs outline-hidden text-[#e0faf5] placeholder:text-gray-500"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="text-gray-400 hover:text-white transition-colors cursor-pointer"
                                        title="Clear search"
                                    >
                                        <X size={12} />
                                    </button>
                                )}
                            </div>

                            {/* Facility Type Quick Filter Tabs */}
                            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 custom-modal-scrollbar text-[11px]">
                                <button
                                    type="button"
                                    onClick={() => setTypeFilter("ALL")}
                                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                                        typeFilter === "ALL"
                                            ? "bg-[#00c9a7] text-[#0a1a1a] font-bold shadow-xs"
                                            : "bg-[#0d1f1f] text-[#7ecfc4]/80 hover:text-[#e0faf5] border border-[#1a4a4a]"
                                    }`}
                                >
                                    <span>All Hubs</span>
                                    <span className="text-[10px] opacity-75 font-mono">({categoryCounts.all})</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTypeFilter("SEA_PORT")}
                                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                                        typeFilter === "SEA_PORT"
                                            ? "bg-[#00c9a7] text-[#0a1a1a] font-bold shadow-xs"
                                            : "bg-[#0d1f1f] text-[#7ecfc4]/80 hover:text-[#e0faf5] border border-[#1a4a4a]"
                                    }`}
                                >
                                    <Ship size={11} />
                                    <span>Sea Ports</span>
                                    <span className="text-[10px] opacity-75 font-mono">({categoryCounts.sea})</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTypeFilter("AIR_PORT")}
                                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                                        typeFilter === "AIR_PORT"
                                            ? "bg-sky-400 text-[#0a1a1a] font-bold shadow-xs"
                                            : "bg-[#0d1f1f] text-[#7ecfc4]/80 hover:text-[#e0faf5] border border-[#1a4a4a]"
                                    }`}
                                >
                                    <Plane size={11} />
                                    <span>Airports</span>
                                    <span className="text-[10px] opacity-75 font-mono">({categoryCounts.air})</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setTypeFilter("INLAND_PORT")}
                                    className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-all cursor-pointer flex items-center gap-1 ${
                                        typeFilter === "INLAND_PORT"
                                            ? "bg-amber-400 text-[#0a1a1a] font-bold shadow-xs"
                                            : "bg-[#0d1f1f] text-[#7ecfc4]/80 hover:text-[#e0faf5] border border-[#1a4a4a]"
                                    }`}
                                >
                                    <Warehouse size={11} />
                                    <span>Inland Depots</span>
                                    <span className="text-[10px] opacity-75 font-mono">({categoryCounts.inland})</span>
                                </button>
                            </div>

                            {/* Live Result Counter */}
                            <div className="flex items-center justify-between text-[10px] text-[#7ecfc4]/70 px-1 font-mono">
                                <span>
                                    {totalFilteredCount} {totalFilteredCount === 1 ? "facility" : "facilities"} available
                                </span>
                                {searchQuery && (
                                    <span className="text-teal-400/80">
                                        Filtering &quot;{searchQuery}&quot;
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Scrollable Locations Hub Catalog */}
                        <div className="flex-1 overflow-y-auto p-1.5 space-y-2 custom-modal-scrollbar">
                            {totalFilteredCount === 0 ? (
                                <div className="py-8 px-4 text-center">
                                    <Search size={22} className="mx-auto text-gray-600 mb-2" />
                                    <p className="text-xs font-semibold text-gray-300">
                                        No facilities found
                                    </p>
                                    <p className="text-[11px] text-gray-500 mt-0.5">
                                        No hubs match &quot;{searchQuery}&quot; in the selected filter.
                                    </p>
                                    {(searchQuery || typeFilter !== "ALL") && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSearchQuery("");
                                                setTypeFilter("ALL");
                                            }}
                                            className="mt-2.5 text-xs text-[#00c9a7] hover:underline font-semibold cursor-pointer"
                                        >
                                            Reset filters & show all locations
                                        </button>
                                    )}
                                </div>
                            ) : (
                                Object.entries(groupedLocations).map(([country, locList]) => (
                                    <div key={country} className="space-y-1">
                                        {/* Country Header */}
                                        <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7ecfc4] bg-[#0a1a1a]/60 rounded-lg flex items-center justify-between">
                                            <span>{country}</span>
                                            <span className="text-[9px] font-mono opacity-70">
                                                {locList.length}
                                            </span>
                                        </div>

                                        {/* Facility List under Country */}
                                        <div className="space-y-0.5">
                                            {locList.map((loc) => {
                                                const formattedValue = `${loc.name} (${loc.code}), ${loc.country}`;
                                                const isSelected =
                                                    internalValue === formattedValue ||
                                                    internalValue === loc.code ||
                                                    Boolean(loc.code && internalValue.includes(`(${loc.code})`));
                                                const isExcluded =
                                                    excludeValue &&
                                                    (formattedValue === excludeValue ||
                                                        loc.code === excludeValue ||
                                                        Boolean(loc.code && excludeValue.includes(`(${loc.code})`)));

                                                return (
                                                    <button
                                                        key={loc.id || loc.code}
                                                        type="button"
                                                        disabled={Boolean(isExcluded)}
                                                        onClick={() => handleSelect(loc)}
                                                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 rounded-xl text-xs text-left transition-all ${
                                                            isExcluded
                                                                ? "opacity-35 cursor-not-allowed bg-transparent"
                                                                : isSelected
                                                                ? "bg-[#00c9a7]/15 border border-[#00c9a7]/40 text-[#00e5c0]"
                                                                : "hover:bg-[#112a2a] text-[#e0faf5] hover:text-white cursor-pointer"
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                            <div className="w-6 h-6 rounded-lg bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-center shrink-0">
                                                                {getLocationIcon(loc.type)}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-semibold text-xs truncate">
                                                                        {loc.name}
                                                                    </span>
                                                                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-sm bg-[#00c9a7]/10 text-[#00c9a7] border border-[#00c9a7]/30 shrink-0">
                                                                        {loc.code}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[10px] text-gray-400 truncate block">
                                                                    {loc.city ? `${loc.city}, ` : ""}
                                                                    {loc.country} •{" "}
                                                                    {loc.type
                                                                        ? loc.type.replace(/_/g, " ")
                                                                        : "PORT"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {isSelected ? (
                                                            <Check
                                                                size={14}
                                                                className="text-[#00c9a7] shrink-0"
                                                            />
                                                        ) : isExcluded ? (
                                                            <span className="text-[9px] font-medium text-amber-400/80 shrink-0">
                                                                Selected as Origin
                                                            </span>
                                                        ) : null}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>
        );
    }
);

LocationSelect.displayName = "LocationSelect";
export default LocationSelect;
