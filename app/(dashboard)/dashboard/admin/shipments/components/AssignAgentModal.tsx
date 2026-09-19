"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, UserCheck } from "lucide-react";
import { IShipment, IRoadAgent } from "@/app/types/shipment.types";

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
}: AssignAgentModalProps) {
    const [selectedAgentId, setSelectedAgentId] = useState("");
    const [assignNote, setAssignNote] = useState("");

    useEffect(() => {
        if (availableAgents.length > 0) {
            // Select first agent by default if none selected or not in list
            if (!selectedAgentId || !availableAgents.some((a) => a.id === selectedAgentId)) {
                setSelectedAgentId(availableAgents[0].id);
            }
        } else {
            setSelectedAgentId("");
        }
    }, [availableAgents, selectedAgentId]);

    useEffect(() => {
        if (shipment) {
            setAssignNote("");
        }
    }, [shipment]);

    if (!isOpen || !shipment) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAgentId) return;
        await onSubmit(selectedAgentId, assignNote.trim() || undefined);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <div className="w-full max-w-lg bg-[#0d1f1f] border border-[#1a4a4a] rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto custom-modal-scrollbar">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-[#1a4a4a] pb-3">
                    <div>
                        <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                            Dispatch Assignment
                        </span>
                        <h3 className="text-base font-extrabold text-[#e0faf5]">
                            Assign Road Agent — {shipment.trackingId}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                        title="Close Modal"
                    >
                        <X size={15} />
                    </button>
                </div>

                {/* Shipment Route Summary */}
                <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-between text-xs">
                    <div>
                        <span className="text-[10px] text-[#7ecfc4] block">Route Corridor:</span>
                        <span className="font-bold text-[#e0faf5]">
                            {shipment.origin} → {shipment.destination}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="text-[10px] text-[#7ecfc4] block">Weight:</span>
                        <span className="font-bold text-[#00e5c0]">{shipment.weight} kg</span>
                    </div>
                </div>

                {/* Filter Area Toggle */}
                <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-[#7ecfc4] text-[11px]">
                        {filterAllAreas
                            ? "Showing all available agents across network"
                            : `Matching area corridor: "${shipment.origin}"`}
                    </span>
                    <button
                        type="button"
                        onClick={onToggleFilterAllAreas}
                        className="text-[11px] font-bold text-[#00e5c0] hover:underline cursor-pointer"
                    >
                        {filterAllAreas ? "Filter by origin only" : "Show all available agents"}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Candidate Road Agents List */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-[#7ecfc4] block">
                            Select Available Carrier Agent *
                        </label>

                        {loadingAgents ? (
                            <div className="p-8 text-center bg-[#0a1a1a] rounded-2xl border border-[#1a4a4a]">
                                <Loader2 size={24} className="mx-auto text-[#00c9a7] animate-spin mb-2" />
                                <p className="text-xs text-[#7ecfc4]">Querying active carrier agents...</p>
                            </div>
                        ) : availableAgents.length === 0 ? (
                            <div className="p-6 text-center bg-[#0a1a1a] rounded-2xl border border-[#1a4a4a] space-y-2">
                                <UserCheck size={28} className="mx-auto text-[#3a6b66]" />
                                <p className="text-xs font-bold text-[#e0faf5]">No road agents available for this filter</p>
                                <p className="text-[11px] text-[#7ecfc4]/70">
                                    Try clicking &quot;Show all available agents&quot; above to find agents in neighboring hubs.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2 max-h-56 overflow-y-auto pr-1 custom-modal-scrollbar">
                                {availableAgents.map((agent) => {
                                    const isSelected = selectedAgentId === agent.id;
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
                                            <div className="flex items-center gap-3 min-w-0">
                                                <input
                                                    type="radio"
                                                    name="selectedAgent"
                                                    checked={isSelected}
                                                    onChange={() => setSelectedAgentId(agent.id)}
                                                    className="text-[#00c9a7] focus:ring-0 cursor-pointer"
                                                />
                                                <div className="min-w-0">
                                                    <p className="text-xs font-bold text-[#e0faf5] truncate flex items-center gap-1.5">
                                                        <span>{agent.name}</span>
                                                        {agent.assignedArea && (
                                                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#112a2a] text-[#7ecfc4] border border-[#1a4a4a]">
                                                                {agent.assignedArea}
                                                            </span>
                                                        )}
                                                    </p>
                                                    <div className="flex items-center gap-3 text-[11px] text-[#7ecfc4]/80 mt-0.5 truncate">
                                                        <span>{agent.email}</span>
                                                        {agent.phone && <span>• {agent.phone}</span>}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right shrink-0">
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30 block">
                                                    Loads: {agent.activeShipmentsCount ?? 0} active
                                                </span>
                                                <span className="text-[9px] text-[#7ecfc4]/70 mt-0.5 block">
                                                    {agent.isAvailable !== false ? "Ready" : "Busy"}
                                                </span>
                                            </div>
                                        </label>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Assignment Note */}
                    <div>
                        <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                            Dispatch Instructions / Note (Optional)
                        </label>
                        <textarea
                            rows={2}
                            value={assignNote}
                            onChange={(e) => setAssignNote(e.target.value)}
                            placeholder="e.g. Assigned for Mirpur route delivery; handle with fragile package care."
                            className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] resize-none transition-colors"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a4a4a]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isAssigning || !selectedAgentId || availableAgents.length === 0}
                            className="px-4 py-2 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-xs font-bold text-[#0a0f0f] transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {isAssigning && <Loader2 size={13} className="animate-spin" />}
                            <span>{isAssigning ? "Assigning Agent..." : "Confirm Assignment"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AssignAgentModal;
