"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
    Search,
    Package,
    MapPin,
    Calendar,
    Weight,
    FileText,
    Radio,
    Clock,
    CheckCircle2,
    Loader2,
    ArrowRight,
    UserCheck,
    Phone,
    User,
} from "lucide-react";
import { toast } from "sonner";
import { shipmentService } from "@/app/services/shipment.service";
import { IShipment, IStatusLog } from "@/app/types/shipment.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { useSocketContext, useSocketEvent } from "@/app/hooks/useSocket";
import { AppError } from "@/app/errorHelper/appError";

function TrackingContent() {
    const searchParams = useSearchParams();
    const initialTrackingId = searchParams.get("trackingId") || "";

    const [trackingIdInput, setTrackingIdInput] = useState(initialTrackingId);
    const [shipment, setShipment] = useState<IShipment | null>(null);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const { isConnected } = useSocketContext();

    const fetchTrackingData = useCallback(async (code: string, silent = false) => {
        const cleanCode = code.trim();
        if (!cleanCode) return;

        if (!silent) setLoading(true);
        setHasSearched(true);

        try {
            const data = await shipmentService.trackShipment(cleanCode);
            setShipment(data);
            if (!silent) {
                toast.success(`Tracking data loaded for ${cleanCode}`);
            }
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            if (!silent) {
                toast.error(appErr.message || "Shipment not found with this tracking ID");
                setShipment(null);
            }
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    // Socket.IO real-time listeners for live tracking refresh
    useSocketEvent("shipment_status_updated", (data: unknown) => {
        const record = data as { trackingId?: string };
        if (shipment && record?.trackingId === shipment.trackingId) {
            void fetchTrackingData(shipment.trackingId, true);
        }
    });

    useSocketEvent("agent_assigned", (data: unknown) => {
        const record = data as { trackingId?: string };
        if (shipment && record?.trackingId === shipment.trackingId) {
            void fetchTrackingData(shipment.trackingId, true);
        }
    });

    useEffect(() => {
        if (initialTrackingId) {
            setTrackingIdInput(initialTrackingId);
            fetchTrackingData(initialTrackingId);
        }
    }, [initialTrackingId, fetchTrackingData]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        fetchTrackingData(trackingIdInput);
    };

    const statusLogs = shipment?.statusLogs || [];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Header with Live Socket Status */}
            <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30">
                            Consignment Tracking
                        </span>
                        {/* Live Socket Status Pill */}
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0a1a1a] border border-[#1a4a4a] text-[11px] font-semibold text-[#7ecfc4]">
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    isConnected ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                                }`}
                            />
                            <span>{isConnected ? "Socket.IO Live" : "Connecting..."}</span>
                        </div>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] mt-1 tracking-tight">
                        Live Freight Tracking
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Track shipment progress and receive real-time carrier checkpoint updates.
                    </p>
                </div>
            </div>

            {/* Tracking Search Input Box */}
            <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl">
                <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search
                            size={16}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#7ecfc4]"
                        />
                        <input
                            type="text"
                            value={trackingIdInput}
                            onChange={(e) => setTrackingIdInput(e.target.value)}
                            placeholder="Enter Tracking ID (e.g. TRK-ABC12345)..."
                            className="w-full pl-11 pr-4 py-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-sm text-[#e0faf5] placeholder:text-[#7ecfc4]/40 font-mono focus:outline-hidden focus:border-[#00c9a7] focus:ring-3 focus:ring-[#00c9a7]/20 transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !trackingIdInput.trim()}
                        className="px-6 py-3 rounded-2xl bg-[#00c9a7] text-xs font-bold text-[#0a0f0f] hover:bg-[#00e5c0] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#00c9a7]/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
                    >
                        {loading ? (
                            <>
                                <Loader2 size={15} className="animate-spin" />
                                <span>Searching...</span>
                            </>
                        ) : (
                            <>
                                <Search size={15} />
                                <span>Track Consignment</span>
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* Results Display */}
            {loading ? (
                <div className="p-16 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col items-center justify-center gap-3">
                    <Loader2 className="w-8 h-8 text-[#00c9a7] animate-spin" />
                    <span className="text-xs font-semibold text-[#7ecfc4]">
                        Retrieving consignment milestones...
                    </span>
                </div>
            ) : shipment ? (
                <div className="space-y-6">
                    {/* Consignment Overview Card */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#1a4a4a]">
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-[#7ecfc4]">Tracking Number:</span>
                                    <span className="font-mono text-base sm:text-lg font-bold text-[#00e5c0]">
                                        {shipment.trackingId}
                                    </span>
                                </div>
                                <p className="text-xs text-[#7ecfc4]/70 mt-0.5">
                                    Booked on {new Date(shipment.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-[#7ecfc4]">Current Status:</span>
                                <StatusBadge status={shipment.status} />
                            </div>
                        </div>

                        {/* Origin -> Destination Banner */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                            <div>
                                <span className="text-[11px] font-bold text-[#7ecfc4] uppercase flex items-center gap-1">
                                    <MapPin size={12} className="text-[#00c9a7]" />
                                    Origin
                                </span>
                                <p className="text-sm font-bold text-[#e0faf5] mt-1">{shipment.origin}</p>
                            </div>

                            <div className="sm:text-center flex flex-col justify-center items-start sm:items-center">
                                <span className="text-[11px] font-bold text-[#7ecfc4] uppercase flex items-center gap-1">
                                    <Weight size={12} className="text-[#00c9a7]" />
                                    Gross Weight
                                </span>
                                <p className="text-sm font-bold text-[#00e5c0] mt-1">{shipment.weight} kg</p>
                            </div>

                            <div className="sm:text-right">
                                <span className="text-[11px] font-bold text-[#7ecfc4] uppercase flex items-center justify-start sm:justify-end gap-1">
                                    <MapPin size={12} className="text-orange-400" />
                                    Destination
                                </span>
                                <p className="text-sm font-bold text-[#e0faf5] mt-1">{shipment.destination}</p>
                            </div>
                        </div>

                        {/* Assigned Road Agent Card */}
                        <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-2">
                            <span className="text-[10px] text-[#3a6b66] font-bold uppercase tracking-wider block">
                                Assigned Carrier Road Agent
                            </span>
                            {shipment.assignedAgent ? (
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-0.5">
                                        <p className="text-sm font-bold text-[#e0faf5] flex items-center gap-1.5">
                                            <UserCheck size={14} className="text-[#00c9a7]" />
                                            <span>{shipment.assignedAgent.name}</span>
                                        </p>
                                        {shipment.assignedAgent.email && (
                                            <p className="text-xs text-[#7ecfc4]/80">{shipment.assignedAgent.email}</p>
                                        )}
                                        {shipment.assignedAgent.assignedArea && (
                                            <p className="text-[11px] text-amber-300 font-medium">
                                                Carrier Area: {shipment.assignedAgent.assignedArea}
                                            </p>
                                        )}
                                    </div>
                                    {shipment.assignedAgent.phone && (
                                        <a
                                            href={`tel:${shipment.assignedAgent.phone}`}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00c9a7]/15 text-xs font-bold text-[#00e5c0] border border-[#00c9a7]/30 hover:bg-[#00c9a7] hover:text-[#0a0f0f] transition-all w-fit shadow-xs"
                                        >
                                            <Phone size={13} />
                                            <span>{shipment.assignedAgent.phone}</span>
                                        </a>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold px-3 py-1 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 inline-block">
                                        Waiting for Road Agent Assignment
                                    </span>
                                    <span className="text-[11px] text-[#7ecfc4]/70">
                                        Regional carrier terminal is currently preparing dispatch.
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Who Assigned Audit Banner */}
                        {shipment.assignedBy && (
                            <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-between text-xs">
                                <span className="text-[#7ecfc4] flex items-center gap-1.5">
                                    <UserCheck size={13} className="text-[#00c9a7]" />
                                    <span>Assigned By Administrator:</span>
                                </span>
                                <span className="font-bold text-[#e0faf5]">
                                    {shipment.assignedBy.name} ({shipment.assignedBy.email})
                                </span>
                            </div>
                        )}

                        {/* Additional Meta */}
                        {shipment.description && (
                            <div className="text-xs text-[#7ecfc4] bg-[#0a1a1a]/50 p-3.5 rounded-xl border border-[#1a4a4a]/60">
                                <span className="font-bold text-[#e0faf5] mr-1.5">Cargo Notes:</span>
                                {shipment.description}
                            </div>
                        )}
                    </div>

                    {/* Status Logs Timeline Section with Audit Trail */}
                    <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-base font-bold text-[#e0faf5]">Milestone Timeline</h2>
                                <p className="text-xs text-[#7ecfc4]">
                                    Chronological status logs broadcasted by freight carriers with audit trail
                                </p>
                            </div>
                            <span className="text-xs font-semibold text-[#7ecfc4] bg-[#0a1a1a] px-3 py-1 rounded-full border border-[#1a4a4a]">
                                {statusLogs.length} checkpoint{statusLogs.length === 1 ? "" : "s"}
                            </span>
                        </div>

                        {statusLogs.length === 0 ? (
                            <div className="p-8 text-center bg-[#0a1a1a] rounded-2xl border border-[#1a4a4a]">
                                <Clock className="w-8 h-8 mx-auto text-[#7ecfc4]/40 mb-2" />
                                <p className="text-xs font-semibold text-[#e0faf5]">
                                    No status milestone updates recorded yet
                                </p>
                                <p className="text-[11px] text-[#7ecfc4] mt-0.5">
                                    Carrier checkpoints will appear here as cargo is scanned in transit.
                                </p>
                            </div>
                        ) : (
                            <div className="relative pl-6 sm:pl-8 border-l-2 border-[#1a4a4a] space-y-8 my-4">
                                {statusLogs.map((log: IStatusLog, idx: number) => {
                                    const isLatest = idx === statusLogs.length - 1 || idx === 0;
                                    return (
                                        <div key={log.id || idx} className="relative group">
                                            {/* Milestone Node Bullet */}
                                            <div
                                                className={`absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full border-2 ${
                                                    isLatest
                                                        ? "border-[#00c9a7] bg-[#00c9a7] ring-4 ring-[#00c9a7]/20"
                                                        : "border-[#1a4a4a] bg-[#0d1f1f]"
                                                }`}
                                            />

                                            <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] hover:border-[#00c9a7]/40 transition-all space-y-2">
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <StatusBadge status={log.status} />
                                                    <span className="text-[11px] text-[#7ecfc4]/80 flex items-center gap-1 font-mono">
                                                        <Clock size={11} />
                                                        {new Date(log.createdAt).toLocaleString("en-US", {
                                                            month: "short",
                                                            day: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        })}
                                                    </span>
                                                </div>

                                                <div className="text-xs text-[#e0faf5] flex items-center gap-1.5 font-medium">
                                                    <MapPin size={13} className="text-[#00c9a7] shrink-0" />
                                                    <span>{log.location || "Facility Location"}</span>
                                                </div>

                                                {log.note && (
                                                    <p className="text-xs text-[#7ecfc4] bg-[#0d1f1f] p-2.5 rounded-lg border border-[#1a4a4a]/60">
                                                        {log.note}
                                                    </p>
                                                )}

                                                {/* Audit Trail: Who updated status */}
                                                <div className="pt-2 border-t border-[#1a4a4a]/40 flex items-center justify-between text-[11px]">
                                                    <span className="text-[#3a6b66]">Checkpoint Author:</span>
                                                    <span className="text-[#00e5c0] font-semibold flex items-center gap-1">
                                                        <User size={11} className="text-[#7ecfc4]" />
                                                        {log.updatedByUser
                                                            ? `${log.updatedByUser.name} (${log.updatedByUser.role})`
                                                            : "System"}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            ) : hasSearched ? (
                <div className="p-16 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] text-center">
                    <Package className="w-12 h-12 mx-auto text-neutral-500 mb-3" />
                    <h3 className="text-sm font-bold text-[#e0faf5]">No Consignment Found</h3>
                    <p className="text-xs text-[#7ecfc4] mt-1 max-w-sm mx-auto">
                        We could not find any active shipment matching code &quot;{trackingIdInput}&quot;. Please verify the tracking ID and try again.
                    </p>
                </div>
            ) : (
                <div className="p-12 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] text-center">
                    <Search className="w-10 h-10 mx-auto text-[#7ecfc4]/40 mb-2" />
                    <p className="text-sm font-bold text-[#e0faf5]">Enter a Tracking ID</p>
                    <p className="text-xs text-[#7ecfc4] mt-0.5 max-w-md mx-auto">
                        Input your shipment tracking code above to monitor real-time transit checkpoints and status logs.
                    </p>
                </div>
            )}
        </div>
    );
}

export default function CustomerTrackingPage() {
    return (
        <Suspense
            fallback={
                <div className="p-16 flex flex-col items-center justify-center gap-2.5">
                    <Loader2 className="w-7 h-7 text-[#00c9a7] animate-spin" />
                    <span className="text-xs font-semibold text-[#7ecfc4]">Loading tracking portal...</span>
                </div>
            }
        >
            <TrackingContent />
        </Suspense>
    );
}
