"use client";

import React, { useState, useMemo } from "react";
import {
    Compass,
    MapPin,
    Search,
    Plus,
    X,
    Check,
    Ship,
    Plane,
    Warehouse,
    Truck,
    ArrowRight,
    ArrowLeftRight,
    Loader2,
    CheckCircle2,
    Layers,
    Sparkles,
    RotateCcw,
    ChevronRight,
    HelpCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { ILocation, LocationType } from "@/app/types/location.types";

export interface IAgentRoute {
    id: string;
    origin: ILocation;
    destination: ILocation;
}

export interface CorridorRouteModalProps {
    isOpen: boolean;
    onClose: () => void;
    locations: ILocation[];
    loadingLocations: boolean;
    configuredRoutes: IAgentRoute[];
    onAddRoute: (route: IAgentRoute) => void;
    onRemoveRoute: (routeId: string) => void;
    onClearAll: () => void;
    maxRoutes?: number;
    isPendingGoogleAuth?: boolean;
    onApplyGoogleAuth?: () => void;
}

const TYPE_CONFIG: Record<
    LocationType | "ALL",
    { label: string; icon: React.ReactNode; color: string; bg: string }
> = {
    ALL: {
        label: "All Hubs",
        icon: <Layers size={13} />,
        color: "#00e5c0",
        bg: "rgba(0, 201, 167, 0.12)",
    },
    SEA_PORT: {
        label: "Sea Ports",
        icon: <Ship size={13} />,
        color: "#00b4d8",
        bg: "rgba(0, 180, 216, 0.12)",
    },
    AIR_PORT: {
        label: "Air Ports",
        icon: <Plane size={13} />,
        color: "#a855f7",
        bg: "rgba(168, 85, 247, 0.12)",
    },
    INLAND_PORT: {
        label: "Inland Depots",
        icon: <Warehouse size={13} />,
        color: "#f59e0b",
        bg: "rgba(245, 158, 11, 0.12)",
    },
    RAIL_TERMINAL: {
        label: "Rail Hubs",
        icon: <Warehouse size={13} />,
        color: "#ec4899",
        bg: "rgba(236, 72, 153, 0.12)",
    },
    ROAD_HUB: {
        label: "Road Hubs",
        icon: <Truck size={13} />,
        color: "#10b981",
        bg: "rgba(16, 185, 129, 0.12)",
    },
};

// Popular global trade lanes for instant 1-click staging
const POPULAR_CORRIDORS = [
    { originCode: "BDCGP", destCode: "SGSIN", label: "Chattogram ➔ Singapore" },
    { originCode: "BDCGP", destCode: "LKCMB", label: "Chattogram ➔ Colombo" },
    { originCode: "BDCGP", destCode: "MYPKG", label: "Chattogram ➔ Port Klang" },
    { originCode: "CNSHA", destCode: "NLRTM", label: "Shanghai ➔ Rotterdam" },
    { originCode: "AEDXB", destCode: "BDCGP", label: "Dubai ➔ Chattogram" },
];

export function CorridorRouteModal({
    isOpen,
    onClose,
    locations,
    loadingLocations,
    configuredRoutes,
    onAddRoute,
    onRemoveRoute,
    onClearAll,
    maxRoutes = 10,
    isPendingGoogleAuth = false,
    onApplyGoogleAuth,
}: CorridorRouteModalProps) {
    // Active Selection Stage: "origin" | "destination"
    const [activeTab, setActiveTab] = useState<"origin" | "destination">("origin");
    const [stagedOrigin, setStagedOrigin] = useState<ILocation | null>(null);
    const [stagedDestination, setStagedDestination] = useState<ILocation | null>(null);

    // Filters inside location box
    const [searchQuery, setSearchQuery] = useState("");
    const [typeFilter, setTypeFilter] = useState<LocationType | "ALL">("ALL");

    // Filtered locations
    const filteredLocations = useMemo(() => {
        const q = searchQuery.trim().toLowerCase();
        return locations.filter((loc) => {
            const matchesType = typeFilter === "ALL" || loc.type === typeFilter;
            const matchesSearch =
                !q ||
                loc.name.toLowerCase().includes(q) ||
                loc.code.toLowerCase().includes(q) ||
                loc.city.toLowerCase().includes(q) ||
                loc.country.toLowerCase().includes(q);

            return matchesType && matchesSearch;
        });
    }, [locations, typeFilter, searchQuery]);

    if (!isOpen) return null;

    const slotsRemaining = maxRoutes - configuredRoutes.length;

    // Handle clicking a location card in the large selection box
    const handleSelectLocation = (location: ILocation) => {
        if (activeTab === "origin") {
            // If already staged as destination, warn user
            if (stagedDestination && stagedDestination.code === location.code) {
                toast.warning("Cannot set Origin same as Destination.", {
                    description: "Please choose a different departure terminal.",
                });
                return;
            }
            setStagedOrigin(location);
            // Seamless auto-advance to Destination tab for effortless UX
            setActiveTab("destination");
            toast.info(`Origin: ${location.code} (${location.city || location.name})`, {
                description: "Now click any arrival hub below to complete the route.",
            });
        } else {
            // Picking Destination
            if (stagedOrigin && stagedOrigin.code === location.code) {
                toast.error("Destination cannot be identical to Origin.", {
                    description: "Please pick a different arrival discharge port.",
                });
                return;
            }
            setStagedDestination(location);
            toast.success(`Destination: ${location.code} (${location.city || location.name})`, {
                description: "Route ready! Click 'Add Corridor Route' to save.",
            });
        }
    };

    // Swap Origin and Destination
    const handleSwapTerminals = () => {
        if (!stagedOrigin && !stagedDestination) return;
        const prevOrigin = stagedOrigin;
        setStagedOrigin(stagedDestination);
        setStagedDestination(prevOrigin);
        toast.info("Terminals swapped", {
            description: `Route inverted: ${stagedDestination?.code || "Unset"} ➔ ${prevOrigin?.code || "Unset"}`,
        });
    };

    // Apply quick popular trade lane
    const handleApplyPreset = (preset: typeof POPULAR_CORRIDORS[0]) => {
        const orig = locations.find((l) => l.code === preset.originCode);
        const dest = locations.find((l) => l.code === preset.destCode);

        if (orig && dest) {
            setStagedOrigin(orig);
            setStagedDestination(dest);
            toast.success(`Loaded preset: ${preset.label}`, {
                description: "Ready! Click '+ Add Corridor Route' to save.",
            });
        } else {
            // If exact code not found, pre-fill search
            setSearchQuery(preset.destCode);
            toast.info(`Preset filter set: ${preset.label}`);
        }
    };

    // Add current staged route to agent list
    const handleAddCurrentRoute = () => {
        if (!stagedOrigin || !stagedDestination) {
            toast.error("Please pick both an Origin departure and Destination arrival hub.");
            return;
        }

        if (stagedOrigin.id === stagedDestination.id || stagedOrigin.code === stagedDestination.code) {
            toast.error("Origin and Destination cannot be the same terminal.", {
                description: "Please pick a distinct discharge location.",
            });
            return;
        }

        if (configuredRoutes.length >= maxRoutes) {
            toast.error(`Maximum limit of ${maxRoutes} trade routes reached.`);
            return;
        }

        const routeId = `${stagedOrigin.code}-${stagedDestination.code}`;
        const exists = configuredRoutes.some(
            (r) => r.origin.code === stagedOrigin.code && r.destination.code === stagedDestination.code
        );

        if (exists) {
            toast.warning("This corridor route is already added to your active list.");
            return;
        }

        const newRoute: IAgentRoute = {
            id: routeId,
            origin: stagedOrigin,
            destination: stagedDestination,
        };

        onAddRoute(newRoute);
        toast.success(`Route added: ${stagedOrigin.code} ➔ ${stagedDestination.code}`, {
            description: `${configuredRoutes.length + 1} of ${maxRoutes} corridors configured.`,
        });

        // Clear destination so user can quickly add another destination for the same origin
        setStagedDestination(null);
        setActiveTab("destination");
    };

    const handleDone = () => {
        if (isPendingGoogleAuth && onApplyGoogleAuth) {
            onApplyGoogleAuth();
            return;
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs">
            <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 10 }}
                transition={{ duration: 0.22, ease: "easeOut" }}
                className="w-full max-w-4xl rounded-3xl overflow-hidden border border-[#1a4a4a] bg-[#0c1b1b] shadow-2xl p-4 sm:p-6 flex flex-col gap-3.5 max-h-[94vh]"
            >
                {/* 1. Modal Header & 10-Route Segment Visualizer */}
                <div className="flex flex-col gap-2 pb-3 border-b border-[#1a4a4a]">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0] shrink-0 shadow-md shadow-[#00c9a7]/10">
                                <Compass size={20} />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-base font-bold text-white tracking-tight">
                                        Trade Corridor Route Builder
                                    </h2>
                                    <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30">
                                        {configuredRoutes.length} / {maxRoutes} Routes
                                    </span>
                                </div>
                                <p className="text-xs text-[#7ecfc4]/80 mt-0.5">
                                    Pair origin dispatch terminals and destination discharge hubs (add up to 10 routes).
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={onClose}
                            className="p-2 rounded-xl bg-[#112a2a] hover:bg-[#1a4a4a] text-[#7ecfc4] hover:text-white border border-[#1a4a4a] transition-colors cursor-pointer"
                            aria-label="Close modal"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* 10-Slot Visual Progress Strip */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5 flex-1 overflow-x-auto custom-modal-scrollbar py-0.5">
                            {Array.from({ length: maxRoutes }).map((_, idx) => {
                                const route = configuredRoutes[idx];
                                return (
                                    <div
                                        key={idx}
                                        title={
                                            route
                                                ? `Route #${idx + 1}: ${route.origin.code} ➔ ${route.destination.code}`
                                                : `Slot #${idx + 1} (Empty)`
                                        }
                                        className={`h-2 rounded-full flex-1 min-w-[18px] transition-all ${
                                            route
                                                ? "bg-[#00c9a7] shadow-xs shadow-[#00c9a7]/40"
                                                : "bg-[#112a2a] border border-[#1a4a4a]"
                                        }`}
                                    />
                                );
                            })}
                        </div>
                        <span className="text-[11px] font-mono text-[#7ecfc4] shrink-0 font-semibold">
                            {slotsRemaining > 0 ? `${slotsRemaining} slot(s) left` : "Limit reached"}
                        </span>
                    </div>
                </div>

                {/* 2. Top Interactive Route Builder Console (Excalidraw Matched) */}
                <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-2.5 items-center">
                    {/* ORIGIN CARD */}
                    <div
                        onClick={() => setActiveTab("origin")}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                            activeTab === "origin"
                                ? "bg-[#00c9a7]/15 border-[#00c9a7] shadow-lg shadow-[#00c9a7]/15 ring-3 ring-[#00c9a7]/40"
                                : "bg-[#0a1a1a] border-[#1a4a4a] hover:border-[#00c9a7]/50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00c9a7] flex items-center gap-1.5">
                                <Compass size={13} />
                                <span>1. Origin Terminal (Departure)</span>
                            </span>
                            {stagedOrigin ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setStagedOrigin(null);
                                        setActiveTab("origin");
                                    }}
                                    className="text-[10px] text-gray-400 hover:text-rose-400 font-semibold underline cursor-pointer"
                                >
                                    Clear
                                </button>
                            ) : (
                                <span className="text-[10px] font-mono text-[#00c9a7] font-semibold animate-pulse">
                                    {activeTab === "origin" ? "Selecting..." : "Click to select"}
                                </span>
                            )}
                        </div>

                        {stagedOrigin ? (
                            <div className="flex items-center justify-between min-w-0 pt-0.5">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/40">
                                            {stagedOrigin.code}
                                        </span>
                                        <span className="text-xs font-bold text-white truncate">
                                            {stagedOrigin.name}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-[#7ecfc4]/80 block truncate mt-0.5">
                                        {stagedOrigin.city ? `${stagedOrigin.city}, ` : ""}{stagedOrigin.country}
                                    </span>
                                </div>
                                <span className="shrink-0 w-6 h-6 rounded-full bg-[#00c9a7]/20 text-[#00e5c0] flex items-center justify-center border border-[#00c9a7]/40 ml-2">
                                    <Check size={13} strokeWidth={3} />
                                </span>
                            </div>
                        ) : (
                            <div className="py-2 text-center flex flex-col items-center justify-center">
                                <span className="text-xs font-semibold text-[#7ecfc4]">
                                    {activeTab === "origin"
                                        ? "👇 Click any terminal from the catalog below"
                                        : "Click here to choose Origin terminal"}
                                </span>
                            </div>
                        )}
                    </div>

                    {/* INTERACTIVE CONNECTOR & SWAP BUTTON */}
                    <div className="flex md:flex-col items-center justify-center gap-1.5 py-1">
                        <button
                            type="button"
                            disabled={!stagedOrigin && !stagedDestination}
                            onClick={handleSwapTerminals}
                            className="p-2 rounded-xl bg-[#112a2a] hover:bg-[#1a4a4a] text-[#7ecfc4] hover:text-[#00e5c0] border border-[#1a4a4a] transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                            title="Swap Origin and Destination"
                        >
                            <ArrowLeftRight size={15} />
                        </button>
                        <span className="text-[10px] text-[#7ecfc4]/60 font-mono hidden md:inline">
                            ➔
                        </span>
                    </div>

                    {/* DESTINATION CARD */}
                    <div
                        onClick={() => setActiveTab("destination")}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-1.5 relative ${
                            activeTab === "destination"
                                ? "bg-[#00b4d8]/15 border-[#00b4d8] shadow-lg shadow-[#00b4d8]/15 ring-3 ring-[#00b4d8]/40"
                                : "bg-[#0a1a1a] border-[#1a4a4a] hover:border-[#00b4d8]/50"
                        }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00b4d8] flex items-center gap-1.5">
                                <MapPin size={13} />
                                <span>2. Destination Hub (Arrival)</span>
                            </span>
                            {stagedDestination ? (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setStagedDestination(null);
                                        setActiveTab("destination");
                                    }}
                                    className="text-[10px] text-gray-400 hover:text-rose-400 font-semibold underline cursor-pointer"
                                >
                                    Clear
                                </button>
                            ) : (
                                <span className="text-[10px] font-mono text-[#00b4d8] font-semibold animate-pulse">
                                    {activeTab === "destination" ? "Selecting..." : "Click to select"}
                                </span>
                            )}
                        </div>

                        {stagedDestination ? (
                            <div className="flex items-center justify-between min-w-0 pt-0.5">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-[#00b4d8]/20 text-[#00b4d8] border border-[#00b4d8]/40">
                                            {stagedDestination.code}
                                        </span>
                                        <span className="text-xs font-bold text-white truncate">
                                            {stagedDestination.name}
                                        </span>
                                    </div>
                                    <span className="text-[11px] text-[#7ecfc4]/80 block truncate mt-0.5">
                                        {stagedDestination.city ? `${stagedDestination.city}, ` : ""}{stagedDestination.country}
                                    </span>
                                </div>
                                <span className="shrink-0 w-6 h-6 rounded-full bg-[#00b4d8]/20 text-[#00b4d8] flex items-center justify-center border border-[#00b4d8]/40 ml-2">
                                    <Check size={13} strokeWidth={3} />
                                </span>
                            </div>
                        ) : (
                            <div className="py-2 text-center flex flex-col items-center justify-center">
                                <span className="text-xs font-semibold text-[#7ecfc4]">
                                    {activeTab === "destination"
                                        ? "👇 Click any arrival hub from the catalog below"
                                        : "Click here to choose Destination"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* 3. Action & Guidance Bar (Ultra User-Friendly CTA) */}
                <div className="p-3 rounded-2xl bg-[#091717] border border-[#1a4a4a] flex flex-col sm:flex-row items-center justify-between gap-2.5">
                    {/* Guidance status */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="w-2 h-2 rounded-full bg-[#00c9a7] animate-ping shrink-0" />
                        <span className="text-xs text-gray-200 truncate">
                            {!stagedOrigin ? (
                                <span className="text-[#00e5c0] font-medium">
                                    Step 1: Select your Origin departure hub below
                                </span>
                            ) : !stagedDestination ? (
                                <span className="text-[#00b4d8] font-medium">
                                    Step 2: Now select your Destination arrival hub below
                                </span>
                            ) : (
                                <span className="text-emerald-300 font-bold flex items-center gap-1.5">
                                    <CheckCircle2 size={13} />
                                    Corridor ready: {stagedOrigin.code} ➔ {stagedDestination.code}
                                </span>
                            )}
                        </span>
                    </div>

                    {/* Add Route Button */}
                    <button
                        type="button"
                        disabled={!stagedOrigin || !stagedDestination || configuredRoutes.length >= maxRoutes}
                        onClick={handleAddCurrentRoute}
                        className={`w-full sm:w-auto px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer ${
                            stagedOrigin && stagedDestination && configuredRoutes.length < maxRoutes
                                ? "bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] shadow-lg shadow-[#00c9a7]/30 hover:scale-[1.02] active:scale-[0.98]"
                                : "bg-[#112a2a] text-gray-400 border border-[#1a4a4a] opacity-60 cursor-not-allowed"
                        }`}
                    >
                        <Plus size={14} />
                        <span>
                            {configuredRoutes.length >= maxRoutes
                                ? "Max Routes Reached (10/10)"
                                : stagedOrigin && stagedDestination
                                ? `+ Add Corridor Route (${configuredRoutes.length + 1}/${maxRoutes})`
                                : `Select Both to Add Route (${configuredRoutes.length}/${maxRoutes})`}
                        </span>
                    </button>
                </div>

                {/* 4. Quick Popular Trade Lanes (1-Click Presets) */}
                <div className="flex items-center gap-2 overflow-x-auto custom-modal-scrollbar py-0.5">
                    <span className="text-[10px] uppercase font-bold text-[#7ecfc4]/70 tracking-wider flex items-center gap-1 shrink-0">
                        <Sparkles size={11} className="text-amber-400" />
                        Quick Presets:
                    </span>
                    {POPULAR_CORRIDORS.map((preset) => (
                        <button
                            key={preset.label}
                            type="button"
                            onClick={() => handleApplyPreset(preset)}
                            className="text-[11px] px-2.5 py-1 rounded-lg bg-[#112a2a] hover:bg-[#1a4a4a] text-[#e0faf5] hover:text-[#00e5c0] border border-[#1a4a4a] transition-all whitespace-nowrap cursor-pointer shrink-0 font-medium"
                        >
                            {preset.label}
                        </button>
                    ))}
                </div>

                {/* 5. The Large Location Catalog Box (The Box from Excalidraw) */}
                <div className="rounded-2xl border border-[#1a4a4a] bg-[#0a1818] p-3.5 space-y-3 flex-1 flex flex-col min-h-0">
                    {/* Header with active picking tab indicator & filters */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                        {/* Tab Switcher & Indicator */}
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#061212] border border-[#1a4a4a] shrink-0">
                            <button
                                type="button"
                                onClick={() => setActiveTab("origin")}
                                className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    activeTab === "origin"
                                        ? "bg-[#00c9a7] text-[#0a0f0f] shadow-sm"
                                        : "text-[#7ecfc4] hover:text-white"
                                }`}
                            >
                                <Compass size={13} />
                                <span>1. Origin</span>
                                {stagedOrigin && <Check size={11} strokeWidth={3} />}
                            </button>
                            <button
                                type="button"
                                onClick={() => setActiveTab("destination")}
                                className={`text-xs px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                                    activeTab === "destination"
                                        ? "bg-[#00b4d8] text-[#0a0f0f] shadow-sm"
                                        : "text-[#7ecfc4] hover:text-white"
                                }`}
                            >
                                <MapPin size={13} />
                                <span>2. Destination</span>
                                {stagedDestination && <Check size={11} strokeWidth={3} />}
                            </button>
                        </div>

                        {/* Search Input */}
                        <div className="flex-1 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#112a2a] border border-[#1a4a4a]">
                            <Search size={14} className="text-[#7ecfc4] shrink-0" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder={`Search ${activeTab === "origin" ? "origin departure" : "destination arrival"} hubs by name, country, or code...`}
                                className="flex-1 bg-transparent text-xs outline-hidden text-[#e0faf5] placeholder:text-[#7ecfc4]/50"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="text-[#7ecfc4] hover:text-white cursor-pointer"
                                >
                                    <X size={13} />
                                </button>
                            )}
                        </div>

                        {/* Type Filters */}
                        <div className="flex items-center gap-1 overflow-x-auto custom-modal-scrollbar pb-0.5 sm:pb-0 shrink-0">
                            {(["ALL", "SEA_PORT", "AIR_PORT", "INLAND_PORT"] as const).map((t) => {
                                const conf = TYPE_CONFIG[t];
                                const isSelected = typeFilter === t;
                                return (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTypeFilter(t)}
                                        className={`px-2 py-1 rounded-lg text-[10px] font-semibold flex items-center gap-1 transition-all border whitespace-nowrap cursor-pointer ${
                                            isSelected
                                                ? "bg-[#00c9a7]/20 text-[#00e5c0] border-[#00c9a7]"
                                                : "bg-[#112a2a] text-[#7ecfc4] border-[#1a4a4a] hover:border-[#7ecfc4]/40"
                                        }`}
                                    >
                                        {conf.icon}
                                        <span>{conf.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Locations Grid with High Visibility Cards */}
                    <div className="flex-1 overflow-y-auto max-h-[260px] pr-1.5 custom-modal-scrollbar">
                        {loadingLocations ? (
                            <div className="py-12 text-center flex flex-col items-center justify-center gap-2">
                                <Loader2 size={24} className="animate-spin text-[#00c9a7]" />
                                <span className="text-xs text-[#7ecfc4]">Loading global hubs from database...</span>
                            </div>
                        ) : filteredLocations.length === 0 ? (
                            <div className="py-12 text-center flex flex-col items-center justify-center">
                                <Search size={26} className="text-[#3a6b66] mb-1.5" />
                                <p className="text-xs font-bold text-white">No hubs found matching &quot;{searchQuery}&quot;</p>
                                <p className="text-[11px] text-[#7ecfc4]/70 mt-0.5">Search using city, country name, or UN/LOCODE (e.g. BDCGP, SGSIN)</p>
                                <button
                                    type="button"
                                    onClick={() => setSearchQuery("")}
                                    className="mt-3 px-3 py-1 rounded-lg bg-[#112a2a] hover:bg-[#1a4a4a] text-xs text-[#00e5c0] border border-[#1a4a4a] cursor-pointer"
                                >
                                    Reset Search
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {filteredLocations.map((loc) => {
                                    const isStagedOrigin = stagedOrigin?.code === loc.code;
                                    const isStagedDestination = stagedDestination?.code === loc.code;
                                    const isSelectedForCurrentTab =
                                        activeTab === "origin" ? isStagedOrigin : isStagedDestination;
                                    const isOppositeStaged =
                                        activeTab === "origin" ? isStagedDestination : isStagedOrigin;

                                    const typeMeta = TYPE_CONFIG[loc.type] || TYPE_CONFIG.SEA_PORT;

                                    return (
                                        <button
                                            key={loc.id || loc.code}
                                            type="button"
                                            onClick={() => handleSelectLocation(loc)}
                                            className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 group ${
                                                isSelectedForCurrentTab
                                                    ? activeTab === "origin"
                                                        ? "bg-[#00c9a7]/20 border-[#00c9a7] text-white shadow-sm shadow-[#00c9a7]/20 ring-2 ring-[#00c9a7]/40"
                                                        : "bg-[#00b4d8]/20 border-[#00b4d8] text-white shadow-sm shadow-[#00b4d8]/20 ring-2 ring-[#00b4d8]/40"
                                                    : isOppositeStaged
                                                    ? "bg-[#0e2222]/60 border-[#1a4a4a] opacity-70 hover:opacity-100"
                                                    : "bg-[#0d1f1f] hover:bg-[#112a2a] border-[#1a4a4a] hover:border-[#00c9a7]/40"
                                            }`}
                                        >
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-black/50 text-[#00e5c0] border border-[#1a4a4a]">
                                                        {loc.code}
                                                    </span>
                                                    <span className="text-xs font-bold text-gray-100 truncate group-hover:text-white">
                                                        {loc.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] text-[#7ecfc4]/80 mt-0.5">
                                                    <span className="truncate">
                                                        {loc.city ? `${loc.city}, ` : ""}{loc.country}
                                                    </span>
                                                    <span>·</span>
                                                    <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                                                        {typeMeta.icon}
                                                        {typeMeta.label}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="shrink-0 flex items-center gap-1">
                                                {isStagedOrigin && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30">
                                                        Origin
                                                    </span>
                                                )}
                                                {isStagedDestination && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00b4d8]/20 text-[#00b4d8] border border-[#00b4d8]/30">
                                                        Dest
                                                    </span>
                                                )}
                                                <div
                                                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                                                        isSelectedForCurrentTab
                                                            ? activeTab === "origin"
                                                                ? "bg-[#00c9a7] border-[#00c9a7] text-black"
                                                                : "bg-[#00b4d8] border-[#00b4d8] text-black"
                                                            : "border-[#1a4a4a] bg-black/40 group-hover:border-[#00c9a7]/50 text-transparent"
                                                    }`}
                                                >
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>

                {/* 6. Active Configured Routes Summary Tray (0 to 10 routes) */}
                {configuredRoutes.length > 0 && (
                    <div className="p-3 rounded-2xl bg-[#091717] border border-[#1a4a4a] space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#00c9a7] flex items-center gap-1.5">
                                <CheckCircle2 size={12} />
                                <span>Configured Routes in Portfolio ({configuredRoutes.length} of {maxRoutes})</span>
                            </span>
                            <button
                                type="button"
                                onClick={onClearAll}
                                className="text-[11px] text-gray-400 hover:text-rose-400 transition-colors underline cursor-pointer"
                            >
                                Clear all routes
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 max-h-20 overflow-y-auto custom-modal-scrollbar pr-1">
                            {configuredRoutes.map((route, idx) => (
                                <span
                                    key={route.id}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#112a2a] text-white border border-[#1a4a4a] text-xs"
                                >
                                    <span className="text-[10px] font-mono text-[#00c9a7] font-bold">
                                        #{idx + 1}
                                    </span>
                                    <span className="font-mono font-bold text-[#00e5c0] text-[11px]">
                                        {route.origin.code}
                                    </span>
                                    <span className="text-gray-500 text-[10px]">➔</span>
                                    <span className="font-mono font-bold text-[#00b4d8] text-[11px]">
                                        {route.destination.code}
                                    </span>
                                    <span className="text-gray-400 text-[10px] truncate max-w-[130px] hidden sm:inline">
                                        ({route.origin.city || route.origin.name} to {route.destination.city || route.destination.name})
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => onRemoveRoute(route.id)}
                                        className="text-gray-400 hover:text-rose-400 transition-colors ml-1 cursor-pointer"
                                        title="Remove route"
                                    >
                                        <X size={12} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 7. Modal Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-[#1a4a4a]">
                    <span className="text-xs text-[#7ecfc4] font-mono">
                        {configuredRoutes.length} of {maxRoutes} routes configured
                    </span>

                    <button
                        type="button"
                        onClick={handleDone}
                        className="px-6 py-2.5 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-[#0a0f0f] text-xs font-bold transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-md shadow-[#00c9a7]/20"
                    >
                        {isPendingGoogleAuth
                            ? `Apply & Continue with Google (${configuredRoutes.length} Routes)`
                            : `Done & Apply (${configuredRoutes.length} Routes)`}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

export default CorridorRouteModal;
