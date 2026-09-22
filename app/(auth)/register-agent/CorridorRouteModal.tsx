"use client";

import React, { useState, useMemo } from "react";
import {
    Compass,
    MapPin,
    Search,
    Plus,
    X,
    Check,
    ArrowRight,
    ArrowLeftRight,
    Trash2,
    Ship,
    Plane,
    Warehouse,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import type { ILocation, IAgentRoute, CorridorRouteModalProps } from "@/app/types/interface";
import { Modal } from "@/components/ui/Modal";

export type { IAgentRoute, CorridorRouteModalProps };

export function CorridorRouteModal({
    isOpen,
    onClose,
    locations,
    loadingLocations = false,
    configuredRoutes,
    onAddRoute,
    onRemoveRoute,
    onClearAll,
    maxRoutes = 10,
    isPendingGoogleAuth = false,
    onApplyGoogleAuth,
    onRefreshLocations,
}: CorridorRouteModalProps) {
    // Current route building state
    const [activeTarget, setActiveTarget] = useState<"origin" | "destination">("origin");
    const [stagedOrigin, setStagedOrigin] = useState<ILocation | null>(null);
    const [stagedDestination, setStagedDestination] = useState<ILocation | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<"ALL" | "SEA_PORT" | "AIR_PORT" | "INLAND_PORT">("ALL");

    // Auto-fetch locations when modal opens if locations list is empty
    React.useEffect(() => {
        if (isOpen && (!locations || locations.length === 0)) {
            onRefreshLocations?.();
        }
    }, [isOpen, locations, onRefreshLocations]);

    // Counts per facility category
    const categoryCounts = useMemo(() => {
        let sea = 0;
        let air = 0;
        let inland = 0;
        (locations || []).forEach((loc) => {
            if (loc.type === "AIR_PORT") air++;
            else if (loc.type === "INLAND_PORT" || loc.type === "ROAD_HUB" || loc.type === "RAIL_TERMINAL") inland++;
            else sea++;
        });
        return { all: (locations || []).length, sea, air, inland };
    }, [locations]);

    // Filter available locations by user search and facility type
    const filteredLocations = useMemo(() => {
        if (!locations || locations.length === 0) return [];
        const q = searchQuery.trim().toLowerCase();
        return locations.filter((loc) => {
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
            const name = (loc.name || "").toLowerCase();
            const code = (loc.code || "").toLowerCase();
            const city = (loc.city || "").toLowerCase();
            const country = (loc.country || "").toLowerCase();
            const region = (loc.region || "").toLowerCase();
            return (
                name.includes(q) ||
                code.includes(q) ||
                city.includes(q) ||
                country.includes(q) ||
                region.includes(q)
            );
        });
    }, [locations, searchQuery, typeFilter]);

    if (!isOpen) return null;

    // Select a hub from the list
    const handleSelectLocation = (loc: ILocation) => {
        if (activeTarget === "origin") {
            if (stagedDestination && stagedDestination.code === loc.code) {
                toast.error("Origin cannot be the same as Destination.");
                return;
            }
            setStagedOrigin(loc);
            // Smart auto-advance to picking Destination
            setActiveTarget("destination");
            toast.info(`Origin set: ${loc.code} (${loc.city || loc.name})`);
        } else {
            if (stagedOrigin && stagedOrigin.code === loc.code) {
                toast.error("Destination cannot be the same as Origin.");
                return;
            }
            setStagedDestination(loc);
            toast.success(`Destination set: ${loc.code} (${loc.city || loc.name})`);
        }
    };

    // Swap Origin and Destination
    const handleSwap = () => {
        const temp = stagedOrigin;
        setStagedOrigin(stagedDestination);
        setStagedDestination(temp);
    };

    // Add currently staged route to list
    const handleAddRoute = () => {
        if (!stagedOrigin || !stagedDestination) {
            toast.error("Please pick both an Origin and Destination hub.");
            return;
        }

        if (stagedOrigin.code === stagedDestination.code) {
            toast.error("Origin and Destination cannot be identical.");
            return;
        }

        if (configuredRoutes.length >= maxRoutes) {
            toast.error(`Maximum limit of ${maxRoutes} routes reached.`);
            return;
        }

        const isDuplicate = configuredRoutes.some(
            (r) =>
                r.origin.code === stagedOrigin.code &&
                r.destination.code === stagedDestination.code
        );

        if (isDuplicate) {
            toast.warning("This corridor route is already added.");
            return;
        }

        const newRoute: IAgentRoute = {
            id: `${stagedOrigin.code}-${stagedDestination.code}-${Date.now()}`,
            origin: stagedOrigin,
            destination: stagedDestination,
        };

        onAddRoute(newRoute);
        toast.success(`Added route: ${stagedOrigin.code} ➔ ${stagedDestination.code}`);

        // Reset staged selection for next route
        setStagedOrigin(null);
        setStagedDestination(null);
        setActiveTarget("origin");
    };

    const isReadyToAdd =
        stagedOrigin &&
        stagedDestination &&
        stagedOrigin.code !== stagedDestination.code &&
        configuredRoutes.length < maxRoutes;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="2xl"
            showCloseButton={false}
            className="p-0 overflow-hidden h-[650px] max-h-[92vh] bg-[#0a1818] gap-0 space-y-0"
            contentClassName="flex flex-col h-full overflow-hidden p-0"
        >
            <div className="flex flex-col h-full overflow-hidden">
                {/* 1. Header (Fixed Height) */}
                <div className="px-5 py-3.5 border-b border-[#1a4a4a] flex items-center justify-between bg-[#081414] shrink-0">
                    <div>
                        <h2 className="text-base font-bold text-white flex items-center gap-2">
                            <Compass size={18} className="text-[#00c9a7]" />
                            <span>Add Trade Corridors</span>
                        </h2>
                        <p className="text-xs text-[#7ecfc4]/70 mt-0.5">
                            Pair origin dispatch terminals with arrival discharge hubs.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-full bg-[#00c9a7]/10 text-[#00e5c0] border border-[#00c9a7]/30">
                            {configuredRoutes.length} / {maxRoutes} Added
                        </span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#112a2a] transition-colors cursor-pointer"
                            aria-label="Close"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* 2. Route Builder (Origin ➔ Destination) (Fixed Height) */}
                <div className="p-3.5 bg-[#0d1f1f] border-b border-[#1a4a4a] flex flex-col gap-2 shrink-0">
                    <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto,1fr] items-center gap-2">
                        {/* Origin Picker Box */}
                        <div
                            onClick={() => setActiveTarget("origin")}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                                activeTarget === "origin"
                                    ? "border-[#00c9a7] bg-[#00c9a7]/10 shadow-xs shadow-[#00c9a7]/20"
                                    : stagedOrigin
                                    ? "border-[#1a4a4a] bg-[#112a2a]"
                                    : "border-dashed border-[#1a4a4a] bg-[#112a2a]/40 hover:border-[#00c9a7]/50"
                            }`}
                        >
                            <div className="w-7 h-7 rounded-lg bg-[#00c9a7]/20 text-[#00e5c0] flex items-center justify-center shrink-0">
                                <Compass size={15} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] uppercase font-bold text-[#7ecfc4] block">
                                    1. Origin Hub {activeTarget === "origin" && "(Active)"}
                                </span>
                                {stagedOrigin ? (
                                    <div className="truncate">
                                        <span className="font-mono text-xs font-bold text-white mr-1.5">
                                            {stagedOrigin.code}
                                        </span>
                                        <span className="text-xs text-gray-300">
                                            {stagedOrigin.city || stagedOrigin.name}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        Click a hub below...
                                    </span>
                                )}
                            </div>
                            {stagedOrigin && (
                                <Check size={14} className="text-[#00c9a7] shrink-0" />
                            )}
                        </div>

                        {/* Swap Button */}
                        <button
                            type="button"
                            onClick={handleSwap}
                            disabled={!stagedOrigin && !stagedDestination}
                            className="w-8 h-8 mx-auto rounded-lg bg-[#112a2a] hover:bg-[#1a4a4a] text-[#7ecfc4] hover:text-white border border-[#1a4a4a] flex items-center justify-center cursor-pointer transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                            title="Swap Origin and Destination"
                        >
                            <ArrowLeftRight size={14} />
                        </button>

                        {/* Destination Picker Box */}
                        <div
                            onClick={() => setActiveTarget("destination")}
                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                                activeTarget === "destination"
                                    ? "border-[#00b4d8] bg-[#00b4d8]/10 shadow-xs shadow-[#00b4d8]/20"
                                    : stagedDestination
                                    ? "border-[#1a4a4a] bg-[#112a2a]"
                                    : "border-dashed border-[#1a4a4a] bg-[#112a2a]/40 hover:border-[#00b4d8]/50"
                            }`}
                        >
                            <div className="w-7 h-7 rounded-lg bg-[#00b4d8]/20 text-[#00b4d8] flex items-center justify-center shrink-0">
                                <MapPin size={15} />
                            </div>
                            <div className="min-w-0 flex-1">
                                <span className="text-[10px] uppercase font-bold text-[#00b4d8] block">
                                    2. Destination {activeTarget === "destination" && "(Active)"}
                                </span>
                                {stagedDestination ? (
                                    <div className="truncate">
                                        <span className="font-mono text-xs font-bold text-white mr-1.5">
                                            {stagedDestination.code}
                                        </span>
                                        <span className="text-xs text-gray-300">
                                            {stagedDestination.city || stagedDestination.name}
                                        </span>
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400">
                                        Click a hub below...
                                    </span>
                                )}
                            </div>
                            {stagedDestination && (
                                <Check size={14} className="text-[#00b4d8] shrink-0" />
                            )}
                        </div>
                    </div>
                </div>

                {/* 3. Search & Location Hubs Catalog (Expands to fill exact height, NEVER shrinks on search) */}
                <div className="p-3.5 flex-1 min-h-0 flex flex-col overflow-hidden">
                    {/* Search & Filter Bar */}
                    <div className="flex flex-col gap-2 mb-2.5 shrink-0">
                        {/* Search Input */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#112a2a] border border-[#1a4a4a]">
                            <Search size={14} className="text-[#7ecfc4] shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Search ${locations.length > 0 ? `${locations.length} hubs` : "trade hubs"} (e.g. Chittagong, Singapore, Dubai, Rotterdam)...`}
                                className="flex-1 bg-transparent text-xs outline-hidden text-gray-100 placeholder:text-gray-500"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="text-gray-400 hover:text-white cursor-pointer"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Facility Quick Filter Tabs & Counter */}
                        <div className="flex items-center justify-between gap-1.5 overflow-x-auto pb-0.5 custom-modal-scrollbar">
                            <div className="flex items-center gap-1.5 text-xs">
                                <button
                                    type="button"
                                    onClick={() => setTypeFilter("ALL")}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                                        typeFilter === "ALL"
                                            ? "bg-[#00c9a7] text-[#0a1818] font-bold shadow-xs"
                                            : "bg-[#112a2a] text-[#7ecfc4]/80 hover:text-white border border-[#1a4a4a]"
                                    }`}
                                >
                                    All ({categoryCounts.all})
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTypeFilter("SEA_PORT")}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                                        typeFilter === "SEA_PORT"
                                            ? "bg-[#00c9a7] text-[#0a1818] font-bold shadow-xs"
                                            : "bg-[#112a2a] text-[#7ecfc4]/80 hover:text-white border border-[#1a4a4a]"
                                    }`}
                                >
                                    <Ship size={11} />
                                    <span>Seaports ({categoryCounts.sea})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTypeFilter("AIR_PORT")}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                                        typeFilter === "AIR_PORT"
                                            ? "bg-[#00b4d8] text-[#0a1818] font-bold shadow-xs"
                                            : "bg-[#112a2a] text-[#7ecfc4]/80 hover:text-white border border-[#1a4a4a]"
                                    }`}
                                >
                                    <Plane size={11} />
                                    <span>Airports ({categoryCounts.air})</span>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTypeFilter("INLAND_PORT")}
                                    className={`px-2 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer flex items-center gap-1 ${
                                        typeFilter === "INLAND_PORT"
                                            ? "bg-[#f59e0b] text-[#0a1818] font-bold shadow-xs"
                                            : "bg-[#112a2a] text-[#7ecfc4]/80 hover:text-white border border-[#1a4a4a]"
                                    }`}
                                >
                                    <Warehouse size={11} />
                                    <span>Inland ({categoryCounts.inland})</span>
                                </button>
                            </div>

                            <span className="text-[10px] font-mono text-[#7ecfc4]/70 shrink-0 hidden sm:inline-block">
                                {filteredLocations.length} hubs visible
                            </span>
                        </div>
                    </div>

                    {/* Locations Grid - Scrollable area that maintains exact locked height */}
                    <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-1.5 custom-modal-scrollbar">
                        {/* High-fidelity Skeleton Loader when loading or waiting for hubs */}
                        {loadingLocations || (locations.length === 0 && !searchQuery) ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {Array.from({ length: 8 }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="p-2.5 rounded-xl border border-[#1a4a4a]/50 bg-[#0c1a1a]/90 flex items-center justify-between gap-2 animate-pulse"
                                    >
                                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                            <div className="w-7 h-7 rounded-lg bg-[#1a4a4a]/60 shrink-0" />
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <div className="w-12 h-3.5 rounded-sm bg-[#1a4a4a]/80" />
                                                    <div className="w-16 h-3 rounded-sm bg-[#1a4a4a]/40" />
                                                </div>
                                                <div className="w-28 h-3 rounded-sm bg-[#1a4a4a]/30" />
                                            </div>
                                        </div>
                                        <div className="w-16 h-5.5 rounded-md bg-[#1a4a4a]/50 shrink-0" />
                                    </div>
                                ))}
                            </div>
                        ) : filteredLocations.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-xs text-gray-400 py-10 text-center">
                                <Search size={22} className="text-gray-600 mb-2" />
                                <p className="font-semibold text-gray-200">No hubs match your search or filter</p>
                                <p className="text-[11px] text-gray-500 mt-1 max-w-xs">
                                    {searchQuery ? `No hubs match "${searchQuery}".` : "Try selecting a different facility category filter."}
                                </p>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setSearchQuery("");
                                        setTypeFilter("ALL");
                                    }}
                                    className="mt-3 px-3.5 py-1.5 rounded-lg bg-[#112a2a] hover:bg-[#1a4a4a] text-[#00e5c0] border border-[#1a4a4a] text-xs font-semibold cursor-pointer transition-colors"
                                >
                                    Reset Filters
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {filteredLocations.map((loc) => {
                                    const isOrigin = stagedOrigin?.code === loc.code;
                                    const isDest = stagedDestination?.code === loc.code;

                                    return (
                                        <div
                                            key={loc.code || loc.id}
                                            onClick={() => handleSelectLocation(loc)}
                                            className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                                                isOrigin
                                                    ? "bg-[#00c9a7]/15 border-[#00c9a7]"
                                                    : isDest
                                                    ? "bg-[#00b4d8]/15 border-[#00b4d8]"
                                                    : "bg-[#0c1a1a] hover:bg-[#112a2a] border-[#1a4a4a] hover:border-[#7ecfc4]/40"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="w-7 h-7 rounded-lg bg-black/40 border border-[#1a4a4a] flex items-center justify-center shrink-0">
                                                    {loc.type === "AIR_PORT" ? (
                                                        <Plane size={13} className="text-[#a855f7]" />
                                                    ) : loc.type === "INLAND_PORT" ? (
                                                        <Warehouse size={13} className="text-[#f59e0b]" />
                                                    ) : (
                                                        <Ship size={13} className="text-[#00c9a7]" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-mono text-xs font-bold text-white">
                                                            {loc.code}
                                                        </span>
                                                        <span className="text-[10px] text-[#7ecfc4] truncate">
                                                            {loc.country}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-300 truncate">
                                                        {loc.city || loc.name}
                                                    </p>
                                                </div>
                                            </div>

                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                                                    isOrigin
                                                        ? "bg-[#00c9a7] text-[#0a0f0f]"
                                                        : isDest
                                                        ? "bg-[#00b4d8] text-[#0a0f0f]"
                                                        : "bg-[#112a2a] text-gray-400"
                                                }`}
                                            >
                                                {isOrigin
                                                    ? "Origin"
                                                    : isDest
                                                    ? "Dest"
                                                    : activeTarget === "origin"
                                                    ? "Pick Origin"
                                                    : "Pick Dest"}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Add Route Action Button (Fixed Height) */}
                <div className="px-4 py-2.5 bg-[#091717] border-t border-[#1a4a4a] shrink-0">
                    <button
                        type="button"
                        onClick={handleAddRoute}
                        disabled={!isReadyToAdd}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isReadyToAdd
                                ? "bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] shadow-md shadow-[#00c9a7]/20"
                                : "bg-[#112a2a] text-gray-500 cursor-not-allowed border border-[#1a4a4a]"
                        }`}
                    >
                        <Plus size={14} />
                        <span>
                            {!stagedOrigin
                                ? "Select Origin Hub Above"
                                : !stagedDestination
                                ? "Select Destination Hub Above"
                                : stagedOrigin.code === stagedDestination.code
                                ? "Origin & Destination Cannot Be Equal"
                                : "+ Add Corridor Route"}
                        </span>
                    </button>
                </div>

                {/* 5. Added Corridors Summary List (Compact, Fixed Max Height) */}
                {configuredRoutes.length > 0 && (
                    <div className="px-4 py-2 bg-[#081414] border-t border-[#1a4a4a] shrink-0">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-[10px] font-bold text-[#7ecfc4] uppercase tracking-wider font-mono">
                                Configured Routes ({configuredRoutes.length}/{maxRoutes})
                            </span>
                            {onClearAll && configuredRoutes.length > 0 && (
                                <button
                                    type="button"
                                    onClick={onClearAll}
                                    className="text-[10px] text-gray-400 hover:text-rose-400 underline cursor-pointer"
                                >
                                    Clear All
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto custom-modal-scrollbar">
                            {configuredRoutes.map((r, idx) => (
                                <div
                                    key={r.id}
                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#0d1f1f] border border-[#1a4a4a] text-xs"
                                >
                                    <span className="font-mono text-[10px] text-gray-400">
                                        #{idx + 1}
                                    </span>
                                    <span className="font-mono font-bold text-[#00e5c0]">
                                        {r.origin.code}
                                    </span>
                                    <ArrowRight size={11} className="text-gray-400" />
                                    <span className="font-mono font-bold text-[#00b4d8]">
                                        {r.destination.code}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveRoute(r.id)}
                                        className="text-gray-500 hover:text-rose-400 ml-1 cursor-pointer"
                                        title="Remove route"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 6. Footer (Fixed Height) */}
                <div className="p-3 bg-[#061010] border-t border-[#1a4a4a] flex items-center justify-between shrink-0">
                    <span className="text-xs text-gray-400">
                        {configuredRoutes.length === 0
                            ? "Please add at least 1 corridor route"
                            : `${configuredRoutes.length} route(s) configured`}
                    </span>
                    <button
                        type="button"
                        onClick={() => {
                            if (isPendingGoogleAuth && onApplyGoogleAuth) {
                                onApplyGoogleAuth();
                            } else {
                                onClose();
                            }
                        }}
                        className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] transition-all cursor-pointer shadow-sm"
                    >
                        {isPendingGoogleAuth
                            ? `Continue with Google (${configuredRoutes.length} Corridors)`
                            : "Done & Close"}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
