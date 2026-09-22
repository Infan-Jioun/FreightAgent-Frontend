"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, Loader2, UserCheck, Search, RotateCw, CheckCircle2, ShieldCheck, Truck } from "lucide-react";
import { IShipment, IRoadAgent } from "@/app/types/shipment.types";
import { Modal } from "@/components/ui/Modal";

export interface AssignAgentModalProps {
    shipment: IShipment | null;
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (agentId: string, note?: string) => Promise<void>;
    availableAgents: IRoadAgent[];
    loadingAgents: boolean;
    filterAllAreas: boolean;
    onToggleFilterAllAreas: () => void;
    isAssigning: boolean;
    onRefreshAgents?: () => void;
}

/**
 * Extracts corridor keywords and hub codes from shipment origin/destination
 * e.g. "Port of Chittagong (Chattogram) (BDCGP), Bangladesh" -> ["bdcgp", "chittagong", "chattogram", "bangladesh"]
 */
function extractCorridorTokens(origin: string, destination?: string): string[] {
    const combined = `${origin} ${destination || ""}`;
    const tokens = new Set<string>();

    // 1. Bracketed codes like (BDCGP), (CGP), (BAH)
    const parenMatches = combined.match(/\(([^)]+)\)/g);
    if (parenMatches) {
        parenMatches.forEach((m) => {
            const clean = m.replace(/[()]/g, "").trim().toLowerCase();
            if (clean.length >= 2) tokens.add(clean);
        });
    }

    // 2. Keyword tokens with 3+ letters, excluding generic stop-words
    const words = combined
        .replace(/[^a-zA-Z0-9\s]/g, " ")
        .split(/\s+/)
        .map((w) => w.trim().toLowerCase())
        .filter(
            (w) =>
                w.length >= 3 &&
                !["port", "airport", "cargo", "terminal", "international", "and", "the", "for", "hub"].includes(w)
        );

    words.forEach((w) => tokens.add(w));
    return Array.from(tokens);
}

/**
 * Checks if an agent's assigned area/corridor matches the shipment route
 */
function doesAgentMatchCorridor(agent: IRoadAgent, origin: string, destination?: string): boolean {
    if (!agent.assignedArea) return false;
    const areaLower = agent.assignedArea.toLowerCase();
    const originLower = origin.toLowerCase();

    // Direct substring match
    if (originLower.includes(areaLower) || areaLower.includes(originLower)) return true;

    // Token match
    const tokens = extractCorridorTokens(origin, destination);
    return tokens.some((token) => areaLower.includes(token));
}

export function AssignAgentModal({
    shipment,
    isOpen,
    onClose,
    onSubmit,
    availableAgents,
    loadingAgents,
    filterAllAreas,
    onToggleFilterAllAreas,
    isAssigning,
    onRefreshAgents,
}: AssignAgentModalProps) {
    const [selectedAgentId, setSelectedAgentId] = useState("");
    const [assignNote, setAssignNote] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    // Identify corridor-matching agents
    const corridorAgents = useMemo(() => {
        if (!shipment || !availableAgents) return [];
        return availableAgents.filter((a) =>
            doesAgentMatchCorridor(a, shipment.origin, shipment.destination)
        );
    }, [availableAgents, shipment]);

    // Active candidate agents pool based on filter mode and intelligent fallback
    const displayedAgents = useMemo(() => {
        let baseList: IRoadAgent[];
        // If filtering by corridor and matching agents exist, prioritize them
        if (!filterAllAreas && corridorAgents.length > 0) {
            baseList = corridorAgents;
        } else {
            // Sort corridor-matched agents to the top, then by least active loads
            baseList = [...availableAgents].sort((a, b) => {
                const aMatches = doesAgentMatchCorridor(a, shipment?.origin || "", shipment?.destination);
                const bMatches = doesAgentMatchCorridor(b, shipment?.origin || "", shipment?.destination);
                if (aMatches && !bMatches) return -1;
                if (!aMatches && bMatches) return 1;
                return (a.activeShipmentsCount ?? 0) - (b.activeShipmentsCount ?? 0);
            });
        }

        // Apply local search filter
        const q = searchQuery.trim().toLowerCase();
        if (!q) return baseList;
        return baseList.filter(
            (a) =>
                a.name.toLowerCase().includes(q) ||
                a.email.toLowerCase().includes(q) ||
                (a.phone && a.phone.includes(q)) ||
                (a.assignedArea && a.assignedArea.toLowerCase().includes(q))
        );
    }, [availableAgents, corridorAgents, filterAllAreas, searchQuery, shipment]);

    // Synchronize default selected agent whenever displayed pool changes
    useEffect(() => {
        if (displayedAgents.length > 0) {
            if (!selectedAgentId || !displayedAgents.some((a) => a.id === selectedAgentId)) {
                setSelectedAgentId(displayedAgents[0].id);
            }
        } else {
            setSelectedAgentId("");
        }
    }, [displayedAgents, selectedAgentId]);

    // Reset notes and search when modal opens for a new shipment
    useEffect(() => {
        if (shipment) {
            setAssignNote("");
            setSearchQuery("");
        }
    }, [shipment]);

    if (!isOpen || !shipment) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgentId) return;
        await onSubmit(selectedAgentId, assignNote.trim() || undefined);
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="xl"
            headerRight={
                onRefreshAgents && (
                    <button
                        type="button"
                        onClick={onRefreshAgents}
                        disabled={loadingAgents}
                        className="p-1.5 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer disabled:opacity-50"
                        title="Refresh Agent List"
                    >
                        <RotateCw size={14} className={loadingAgents ? "animate-spin" : ""} />
                    </button>
                )
            }
            icon={<Truck size={17} className="text-[#00c9a7]" />}
            title={
                <div>
                    <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block font-bold">
                        Dispatch Assignment
                    </span>
                    <span>Assign Road Agent — {shipment.trackingId}</span>
                </div>
            }
        >
            <div className="space-y-4">

                {/* Shipment Route Summary */}
                <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-between text-xs shrink-0">
                    <div className="min-w-0 flex-1 pr-2">
                        <span className="text-[10px] text-[#7ecfc4] block font-semibold">Route Corridor:</span>
                        <span className="font-bold text-[#e0faf5] block truncate">
                            {shipment.origin} → {shipment.destination}
                        </span>
                    </div>
                    <div className="text-right shrink-0">
                        <span className="text-[10px] text-[#7ecfc4] block font-semibold">Weight:</span>
                        <span className="font-bold text-[#00e5c0] font-mono">{shipment.weight} kg</span>
                    </div>
                </div>

                {/* Filter Area Bar & Quick Toggle */}
                <div className="space-y-2 shrink-0">
                    <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[#7ecfc4] text-[11px]">
                                {filterAllAreas
                                    ? `Showing all available fleet (${availableAgents.length} agents)`
                                    : corridorAgents.length > 0
                                    ? `Matching corridor: ${corridorAgents.length} agent(s)`
                                    : `All network agents (${availableAgents.length} ready)`}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={onToggleFilterAllAreas}
                            className="text-[11px] font-bold text-[#00e5c0] hover:underline cursor-pointer"
                        >
                            {filterAllAreas
                                ? corridorAgents.length > 0
                                    ? "Filter by origin corridor only"
                                    : "Corridor filter (0 match)"
                                : "Show all available agents"}
                        </button>
                    </div>

                    {/* Notice when corridor filter has 0 agents */}
                    {!filterAllAreas && corridorAgents.length === 0 && availableAgents.length > 0 && (
                        <div className="px-3 py-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-300 flex items-center gap-2">
                            <ShieldCheck size={14} className="shrink-0 text-amber-400" />
                            <span>
                                No agents specifically assigned to this exact corridor. Displaying all available network agents so dispatch is not blocked.
                            </span>
                        </div>
                    )}

                    {/* Quick Search Input */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a]">
                        <Search size={13} className="text-[#7ecfc4] shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search agents by name, email, corridor..."
                            className="flex-1 bg-transparent text-xs outline-hidden text-[#e0faf5] placeholder:text-[#3a6b66]"
                        />
                        {searchQuery && (
                            <button
                                type="button"
                                onClick={() => setSearchQuery("")}
                                className="text-gray-400 hover:text-white cursor-pointer"
                            >
                                <X size={12} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Candidate Road Agents List (Scrollable) */}
                <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col justify-between space-y-3">
                    <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2 custom-modal-scrollbar">
                        {loadingAgents ? (
                            <div className="space-y-2">
                                {Array.from({ length: 3 }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className="p-3.5 rounded-2xl border border-[#1a4a4a]/60 bg-[#0a1a1a]/80 flex items-center justify-between gap-3 animate-pulse"
                                    >
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="w-8 h-8 rounded-xl bg-[#1a4a4a]/60 shrink-0" />
                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-28 h-3.5 rounded-md bg-[#1a4a4a]/70" />
                                                    <div className="w-16 h-3 rounded-md bg-[#1a4a4a]/40" />
                                                </div>
                                                <div className="w-40 h-2.5 rounded-md bg-[#1a4a4a]/30" />
                                            </div>
                                        </div>
                                        <div className="w-16 h-5 rounded-md bg-[#1a4a4a]/40 shrink-0" />
                                    </div>
                                ))}
                            </div>
                        ) : displayedAgents.length === 0 ? (
                            <div className="p-6 text-center bg-[#0a1a1a] rounded-2xl border border-[#1a4a4a] space-y-2">
                                <UserCheck size={28} className="mx-auto text-[#3a6b66]" />
                                <p className="text-xs font-bold text-[#e0faf5]">
                                    {searchQuery ? `No agents match "${searchQuery}"` : "No road agents available"}
                                </p>
                                <p className="text-[11px] text-[#7ecfc4]/70">
                                    {searchQuery
                                        ? "Try clearing your search query above."
                                        : "Click below to refresh available fleet agents."}
                                </p>
                                {searchQuery ? (
                                    <button
                                        type="button"
                                        onClick={() => setSearchQuery("")}
                                        className="text-xs text-[#00c9a7] hover:underline font-semibold cursor-pointer"
                                    >
                                        Clear search
                                    </button>
                                ) : onRefreshAgents ? (
                                    <button
                                        type="button"
                                        onClick={onRefreshAgents}
                                        className="px-3 py-1 rounded-xl bg-[#112a2a] text-[#00c9a7] border border-[#1a4a4a] text-xs font-semibold hover:bg-[#1a4a4a] cursor-pointer transition-colors"
                                    >
                                        Refresh Agents List
                                    </button>
                                ) : null}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {displayedAgents.map((agent) => {
                                    const isSelected = selectedAgentId === agent.id;
                                    const isCorridorMatch = doesAgentMatchCorridor(
                                        agent,
                                        shipment.origin,
                                        shipment.destination
                                    );

                                    return (
                                        <label
                                            key={agent.id}
                                            onClick={() => setSelectedAgentId(agent.id)}
                                            className={`p-3 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                                                isSelected
                                                    ? "bg-[#00c9a7]/15 border-[#00c9a7] ring-1 ring-[#00c9a7]"
                                                    : "bg-[#0a1a1a] border-[#1a4a4a] hover:border-[#7ecfc4]/40"
                                            }`}
                                        >
                                            <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                                                <input
                                                    type="radio"
                                                    name="selectedAgent"
                                                    checked={isSelected}
                                                    onChange={() => setSelectedAgentId(agent.id)}
                                                    className="text-[#00c9a7] focus:ring-0 cursor-pointer shrink-0"
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-1.5 flex-wrap">
                                                        <span className="text-xs font-bold text-[#e0faf5] truncate">
                                                            {agent.name}
                                                        </span>
                                                        {isCorridorMatch && (
                                                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/40 flex items-center gap-1">
                                                                <CheckCircle2 size={10} />
                                                                <span>Corridor Match</span>
                                                            </span>
                                                        )}
                                                        {agent.assignedArea && (
                                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#112a2a] text-[#7ecfc4] border border-[#1a4a4a] truncate max-w-[200px]">
                                                                {agent.assignedArea}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-[11px] text-[#7ecfc4]/80 mt-0.5 truncate">
                                                        <span>{agent.email}</span>
                                                        {agent.phone && <span>• {agent.phone}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30 block font-mono">
                                                    {agent.activeShipmentsCount ?? 0} active loads
                                                </span>
                                                <span className="text-[9px] text-[#7ecfc4]/70 mt-0.5 block font-semibold">
                                                    {agent.isAvailable !== false ? "Ready" : "Busy"}
                                                </span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Dispatch Instructions / Note */}
                    <div className="shrink-0 pt-1">
                        <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                            Dispatch Instructions / Note (Optional)
                        </label>
                        <textarea
                            rows={2}
                            value={assignNote}
                            onChange={(e) => setAssignNote(e.target.value)}
                            placeholder="e.g. Assigned for Mirpur route delivery; handle with fragile package care."
                            className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden resize-none transition-colors"
                        />
                    </div>

                    {/* Footer Actions */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a4a4a] shrink-0">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isAssigning || !selectedAgentId || displayedAgents.length === 0}
                            className="px-4 py-2 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-xs font-bold text-[#0a0f0f] transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-[#00c9a7]/20"
                        >
                            {isAssigning && <Loader2 size={13} className="animate-spin" />}
                            <span>{isAssigning ? "Assigning Agent..." : "Confirm Assignment"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}

export default AssignAgentModal;
