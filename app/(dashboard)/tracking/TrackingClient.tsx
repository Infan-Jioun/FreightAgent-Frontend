"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import {
    Search,
    MapPin,
    Truck,
    CheckCircle2,
    Clock,
    Phone,
    Copy,
    ShieldCheck,
    Navigation,
    Ship,
    Loader2,
    AlertCircle,
    RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import MaritimeRouteTrackingWidget from "@/components/ui/dashboard/MaritimeRouteTrackingWidget";
import { Button } from "@/components/ui/button";
import { shipmentService } from "@/app/services/shipment.service";
import { IShipment, ShipmentStatus } from "@/app/types/shipment.types";
import type { TrackingEvent, ShipmentDetails } from "@/app/types/interface";
import { AppError } from "@/app/errorHelper/appError";

// Fallback initial demo data
const DEFAULT_SHIPMENT: ShipmentDetails = {
    trackingCode: "FA-DEMO-262778",
    status: "IN_TRANSIT",
    origin: "Chicago, IL Hub",
    originAddress: "Freight Depot 4, O'Hare Cargo District, IL 60666",
    destination: "Celina, DE 10299",
    destAddress: "452 Willowbrook Creek Road, Celina, DE 10299",
    eta: "Today, 4:45 PM",
    carrier: "FreightAgent Prime Logistics",
    driverName: "Guy Hawkins",
    driverPhone: "+1 (555) 382-9011",
    vehiclePlate: "IL-992-TXK",
    weight: "4.2 kg",
    dimensions: "14 x 10 x 6 in",
    serviceType: "Priority Express Freight",
    events: [
        {
            id: "e1",
            title: "Package Collected & Scanned",
            description: "Shipper manifest confirmed and loaded into regional transit container.",
            location: "Chicago, IL Central Depot",
            timestamp: "Oct 06, 2023 - 08:30 AM",
            completed: true,
        },
        {
            id: "e2",
            title: "In Transit Between Hubs",
            description: "Passing Waypoint 03 - Akron Logistics Checkpoint. Highway transit on schedule.",
            location: "Akron, OH Highway Corridor",
            timestamp: "Oct 06, 2023 - 02:40 PM",
            completed: true,
            current: true,
        },
        {
            id: "e3",
            title: "Out for Delivery",
            description: "Courier assigned and dispatched for last-mile destination route.",
            location: "Celina Local Delivery Center",
            timestamp: "Estimated 4:45 PM",
            completed: false,
        },
    ],
};

// Standard milestone order for progression synthesis
const STATUS_ORDER: ShipmentStatus[] = [
    "PENDING",
    "PICKED_UP",
    "IN_TRANSIT",
    "AT_CUSTOMS",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
];

function transformShipmentToDetails(shipment: IShipment): ShipmentDetails {
    const rawLogs = shipment.statusLogs || [];

    // Sort logs oldest to newest
    const sortedLogs = [...rawLogs].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    let events: TrackingEvent[] = [];

    if (sortedLogs.length > 0) {
        events = sortedLogs.map((log, index) => {
            const isLast = index === sortedLogs.length - 1;
            return {
                id: log.id,
                title: log.status.replace(/_/g, " "),
                description: log.note || `Transit status recorded at checkpoint.`,
                location: log.location || "En Route Corridor",
                timestamp: new Date(log.createdAt).toLocaleString([], {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                completed: true,
                current: isLast,
                author: log.updatedByUser
                    ? `${log.updatedByUser.name} (${log.updatedByUser.role})`
                    : log.updateBy || "System",
            };
        });
    } else {
        // Synthesize milestone sequence from current status
        const currentIndex = STATUS_ORDER.indexOf(shipment.status);
        const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;

        events = STATUS_ORDER.slice(0, 4).map((st, idx) => {
            const isDone = idx <= effectiveIndex;
            const isCur = idx === effectiveIndex;
            return {
                id: `step-${st}`,
                title: st.replace(/_/g, " "),
                description: isDone
                    ? `Consignment verified at ${st.toLowerCase().replace(/_/g, " ")} stage.`
                    : `Upcoming milestone in corridor schedule.`,
                location: isDone ? shipment.origin : shipment.destination,
                timestamp: isDone
                    ? new Date(shipment.createdAt).toLocaleDateString([], { month: "short", day: "numeric" })
                    : "Scheduled",
                completed: isDone,
                current: isCur,
            };
        });
    }

    const etaString = shipment.estimatedDate
        ? new Date(shipment.estimatedDate).toLocaleDateString([], {
              month: "short",
              day: "numeric",
              year: "numeric",
          })
        : "Standard Transit (2-3 Days)";

    return {
        trackingCode: shipment.trackingId,
        status: shipment.status,
        origin: shipment.origin,
        originAddress: `${shipment.origin} Logistics Facility`,
        destination: shipment.destination,
        destAddress: `${shipment.destination} Delivery Hub`,
        eta: etaString,
        carrier: shipment.assignedAgent
            ? `Road Agent: ${shipment.assignedAgent.name}`
            : "FreightAgent Global Logistics",
        driverName: shipment.assignedAgent?.name || shipment.user?.name || "Corridor Fleet Lead",
        driverPhone: shipment.assignedAgent?.phone || "+880 1700 000000",
        vehiclePlate: shipment.assignedAgent?.assignedArea ? `Hub: ${shipment.assignedAgent.assignedArea}` : "Carrier Hub 04",
        weight: `${shipment.weight} KG`,
        dimensions: "Standard Freight Unit",
        serviceType: "Express Cargo Dispatch",
        events,
        assignedBy: shipment.assignedBy ? `${shipment.assignedBy.name} (${shipment.assignedBy.email})` : undefined,
        assignedAgentArea: shipment.assignedAgent?.assignedArea || undefined,
    };
}

export default function TrackingClient() {
    const searchParams = useSearchParams();
    const queryId = searchParams.get("id") || searchParams.get("trackingId") || "";

    const [inputCode, setInputCode] = useState(queryId || "FA-DEMO-262778");
    const [currentTracking, setCurrentTracking] = useState<ShipmentDetails>(DEFAULT_SHIPMENT);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [trackingView, setTrackingView] = useState<"MARITIME" | "REGIONAL">("REGIONAL");

    // Fetch tracking by tracking code from backend
    const fetchTracking = useCallback(async (code: string) => {
        const trimmed = code.trim();
        if (!trimmed) return;

        setLoading(true);
        setErrorMsg(null);

        try {
            const res = await shipmentService.trackShipment(trimmed);
            const transformed = transformShipmentToDetails(res);
            setCurrentTracking(transformed);
            toast.success(`Telemetry loaded for consignment ${trimmed}`);
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            const message = error.isNotFound
                ? `No shipment found for tracking ID "${trimmed}". Please check the number.`
                : error.message || "Failed to retrieve tracking data.";
            setErrorMsg(message);
            toast.error(message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (queryId) {
            setInputCode(queryId);
            fetchTracking(queryId);
        }
    }, [queryId, fetchTracking]);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const code = inputCode.trim();
        if (!code) {
            toast.error("Please enter a tracking number");
            return;
        }
        fetchTracking(code);
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Tracking number copied to clipboard");
    };

    const getStatusBadge = (status: ShipmentStatus) => {
        switch (status) {
            case "DELIVERED":
                return "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/40";
            case "IN_TRANSIT":
            case "OUT_FOR_DELIVERY":
                return "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/40";
            case "PICKED_UP":
                return "bg-[#6366f1]/15 text-[#818cf8] border-[#6366f1]/40";
            case "AT_CUSTOMS":
                return "bg-[#ec4899]/15 text-[#f472b6] border-[#ec4899]/40";
            case "PENDING":
                return "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/40";
            case "CANCELLED":
                return "bg-[#ff6b6b]/15 text-[#ff6b6b] border-[#ff6b6b]/40";
            default:
                return "bg-[#3a6b66]/20 text-[#7ecfc4] border-[#1a4a4a]";
        }
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Header + Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] tracking-tight">
                        Live Freight & Consignment Radar
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Real-time GPS telemetry, waypoint checkpoints, and corridor milestones.
                    </p>
                </div>

                {/* Quick select pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-[#3a6b66]">Quick Demo:</span>
                    {["FA-DEMO-262778", "#26277887-ID-YK"].map((code) => (
                        <Button
                            key={code}
                            variant={inputCode === code ? "pill-active" : "pill-inactive"}
                            size="xs"
                            shape="pill"
                            className="font-mono"
                            onClick={() => {
                                setInputCode(code);
                                fetchTracking(code);
                            }}
                        >
                            {code}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Tracking Search Input Card */}
            <form
                onSubmit={handleSearch}
                className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-lg shadow-black/20 flex flex-col sm:flex-row items-center gap-3"
            >
                <div className="relative flex-1 w-full">
                    <Search
                        size={18}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#3a6b66]"
                    />
                    <input
                        type="text"
                        value={inputCode}
                        onChange={(e) => setInputCode(e.target.value)}
                        placeholder="Enter tracking number (e.g. FA-123456 or #26277887-ID-YK)"
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-mono text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                    />
                </div>
                <Button
                    type="submit"
                    variant="gradient"
                    shape="box"
                    size="default"
                    disabled={loading}
                    leftIcon={loading ? <Loader2 size={15} className="animate-spin" /> : <Navigation size={15} />}
                    className="w-full sm:w-auto"
                >
                    {loading ? "Scanning Radar..." : "Track Consignment"}
                </Button>
            </form>

            {/* Error Banner */}
            {errorMsg && (
                <div className="p-4 rounded-2xl bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 flex items-center justify-between gap-3 text-xs text-[#ff6b6b]">
                    <div className="flex items-center gap-2">
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                    <button
                        onClick={() => fetchTracking(inputCode)}
                        className="px-3 py-1 rounded-xl bg-[#ff6b6b]/20 hover:bg-[#ff6b6b]/30 text-white font-bold transition-colors flex items-center gap-1 shrink-0"
                    >
                        <RotateCcw size={12} />
                        <span>Retry</span>
                    </button>
                </div>
            )}

            {/* Overview Banner */}
            <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-br from-[#0d1f1f] via-[#0d1f1f] to-[#112a2a] border border-[#1a4a4a] shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-80 h-80 bg-[#00c9a7]/5 rounded-full blur-3xl pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-lg sm:text-xl font-mono font-bold text-[#e0faf5] flex items-center gap-2">
                                {currentTracking.trackingCode}
                                <button
                                    onClick={() => handleCopy(currentTracking.trackingCode)}
                                    className="p-1 rounded-md text-[#7ecfc4] hover:text-[#00e5c0] hover:bg-[#1a4a4a]/40 transition-colors"
                                    title="Copy Tracking ID"
                                >
                                    <Copy size={15} />
                                </button>
                            </h2>
                            <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${getStatusBadge(
                                    currentTracking.status
                                )}`}
                            >
                                {currentTracking.status.replace(/_/g, " ")}
                            </span>
                        </div>

                        <p className="text-xs text-[#7ecfc4] flex items-center gap-2">
                            <Truck size={14} className="text-[#00c9a7]" />
                            <span>Carrier: <strong className="text-[#e0faf5]">{currentTracking.carrier}</strong></span>
                            <span>•</span>
                            <span>Service: <strong className="text-[#e0faf5]">{currentTracking.serviceType}</strong></span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4 bg-[#0a1a1a]/80 p-3.5 rounded-2xl border border-[#1a4a4a]/60">
                        <div className="w-10 h-10 rounded-xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0]">
                            <Clock size={20} />
                        </div>
                        <div>
                            <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                                Estimated Arrival
                            </span>
                            <span className="text-sm font-bold text-[#e0faf5]">
                                {currentTracking.eta}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Origin to Destination Bar */}
                <div className="mt-6 pt-5 border-t border-[#1a4a4a]/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00c9a7] shrink-0 mt-0.5">
                            <MapPin size={16} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] text-[#3a6b66] font-bold uppercase tracking-wider">
                                Origin Corridor
                            </span>
                            <p className="text-xs font-bold text-[#e0faf5] truncate">{currentTracking.origin}</p>
                            <p className="text-[11px] text-[#7ecfc4]/70 truncate">{currentTracking.originAddress}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-[#00b4d8]/15 border border-[#00b4d8]/30 flex items-center justify-center text-[#00b4d8] shrink-0 mt-0.5">
                            <MapPin size={16} />
                        </div>
                        <div className="min-w-0">
                            <span className="text-[10px] text-[#3a6b66] font-bold uppercase tracking-wider">
                                Target Destination
                            </span>
                            <p className="text-xs font-bold text-[#e0faf5] truncate">{currentTracking.destination}</p>
                            <p className="text-[11px] text-[#7ecfc4]/70 truncate">{currentTracking.destAddress}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transit Mode Switcher */}
            <div className="flex items-center gap-2 p-1.5 bg-[#0d1f1f] rounded-2xl border border-[#1a4a4a] w-fit shadow-md">
                <Button
                    variant={trackingView === "REGIONAL" ? "blue" : "ghost"}
                    size="sm"
                    onClick={() => setTrackingView("REGIONAL")}
                    leftIcon={<Truck size={14} />}
                >
                    Regional Corridor Route
                </Button>

                <Button
                    variant={trackingView === "MARITIME" ? "teal" : "ghost"}
                    size="sm"
                    onClick={() => setTrackingView("MARITIME")}
                    leftIcon={<Ship size={14} />}
                >
                    Maritime Vessel Corridor
                </Button>
            </div>

            {/* Main Layout: Map Visual & Milestone Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Map Visual & Telemetry */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {trackingView === "MARITIME" ? (
                        <MaritimeRouteTrackingWidget />
                    ) : (
                        /* Simulated Radar Panel */
                        <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7ecfc4] flex items-center gap-2">
                                    <Navigation size={14} className="text-[#00c9a7]" />
                                    Active Transit Telemetry
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00c9a7]/10 text-[#00e5c0] border border-[#00c9a7]/30 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c0] animate-ping" />
                                    Live Satellite Link
                                </span>
                            </div>

                            {/* Canvas */}
                            <div className="relative h-64 rounded-2xl bg-[#0a1414] border border-[#1a4a4a]/70 overflow-hidden flex items-center justify-center">
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage:
                                            "radial-gradient(#00c9a7 1px, transparent 1px), radial-gradient(#00b4d8 1px, transparent 1px)",
                                        backgroundSize: "24px 24px",
                                        backgroundPosition: "0 0, 12px 12px",
                                    }}
                                />

                                {/* Corridor line */}
                                <div className="absolute w-3/4 h-0.5 bg-linear-to-r from-[#00c9a7] via-[#00b4d8] to-[#1a4a4a] top-1/2 -translate-y-1/2" />

                                {/* Origin Pin */}
                                <div className="absolute left-10 top-12 flex flex-col items-center">
                                    <div className="w-6 h-6 rounded-full bg-[#00c9a7] flex items-center justify-center text-[#0a0f0f] shadow-lg shadow-[#00c9a7]/40">
                                        <MapPin size={13} />
                                    </div>
                                    <span className="text-[9px] font-bold text-[#e0faf5] mt-1 bg-[#0a0f0f]/80 px-2 py-0.5 rounded-sm border border-[#1a4a4a]">
                                        Origin
                                    </span>
                                </div>

                                {/* Current Position Indicator */}
                                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                                    <div className="w-9 h-9 rounded-2xl bg-[#00b4d8] flex items-center justify-center text-[#0a0f0f] shadow-xl shadow-[#00b4d8]/50 animate-bounce">
                                        <Truck size={18} />
                                    </div>
                                    <span className="text-[9px] font-bold text-[#00e5c0] mt-1 bg-[#0a0f0f]/90 px-2 py-0.5 rounded-sm border border-[#00c9a7]/40 whitespace-nowrap">
                                        En Route Corridor
                                    </span>
                                </div>

                                {/* Destination Pin */}
                                <div className="absolute right-12 top-14 flex flex-col items-center">
                                    <div className="w-6 h-6 rounded-full bg-[#00b4d8] flex items-center justify-center text-[#0a0f0f] shadow-lg shadow-[#00b4d8]/40">
                                        <MapPin size={13} />
                                    </div>
                                    <span className="text-[9px] font-bold text-[#e0faf5] mt-1 bg-[#0a0f0f]/80 px-2 py-0.5 rounded-sm border border-[#1a4a4a]">
                                        Dest
                                    </span>
                                </div>
                            </div>

                            {/* Specs Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                                <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60">
                                    <span className="text-[10px] text-[#3a6b66] font-semibold block">Total Weight</span>
                                    <span className="text-xs font-bold text-[#e0faf5]">{currentTracking.weight}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60">
                                    <span className="text-[10px] text-[#3a6b66] font-semibold block">Cargo Dimension</span>
                                    <span className="text-xs font-bold text-[#e0faf5]">{currentTracking.dimensions}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60">
                                    <span className="text-[10px] text-[#3a6b66] font-semibold block">Carrier Corridor</span>
                                    <span className="text-xs font-bold text-[#e0faf5] font-mono">{currentTracking.vehiclePlate}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60">
                                    <span className="text-[10px] text-[#3a6b66] font-semibold block">Security Status</span>
                                    <span className="text-xs font-bold text-[#00e5c0] flex items-center gap-1">
                                        <ShieldCheck size={12} /> Verified
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dispatch Courier Card */}
                    <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#00c9a7] to-[#00b4d8] flex items-center justify-center text-[#0a0f0f] font-black text-base shadow-md shadow-[#00c9a7]/20">
                                {currentTracking.driverName.charAt(0)}
                            </div>
                            <div>
                                <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                                    Dispatch Officer / Shipper
                                </span>
                                <h4 className="text-sm font-bold text-[#e0faf5]">{currentTracking.driverName}</h4>
                                <p className="text-xs text-[#7ecfc4]">{currentTracking.carrier}</p>
                            </div>
                        </div>

                        <a
                            href={`tel:${currentTracking.driverPhone}`}
                            className="px-4 py-2.5 rounded-xl bg-[#112a2a] hover:bg-[#00c9a7]/15 border border-[#1a4a4a] hover:border-[#00c9a7] text-xs font-bold text-[#00e5c0] transition-colors flex items-center justify-center gap-2"
                        >
                            <Phone size={14} />
                            <span>{currentTracking.driverPhone}</span>
                        </a>
                    </div>

                    {/* Who Assigned Audit Banner */}
                    {currentTracking.assignedBy && (
                        <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-between text-xs">
                            <span className="text-[#7ecfc4]">Assigned By Admin Authority:</span>
                            <span className="font-bold text-[#e0faf5]">{currentTracking.assignedBy}</span>
                        </div>
                    )}
                </div>

                {/* Right 1 Col: Milestone Stepper */}
                <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-[#1a4a4a]/60">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7ecfc4] flex items-center gap-2">
                                <Clock size={14} className="text-[#00c9a7]" />
                                Checkpoint Milestones
                            </h3>
                            <span className="text-[10px] text-[#3a6b66]">
                                {currentTracking.events.filter((e) => e.completed).length} of{" "}
                                {currentTracking.events.length} Checkpoints
                            </span>
                        </div>

                        {/* Steps List */}
                        <div className="mt-5 flex flex-col gap-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1a4a4a]">
                            {currentTracking.events.map((ev) => (
                                <div key={ev.id} className="relative flex items-start gap-4 pl-8">
                                    {/* Timeline Indicator */}
                                    <div
                                        className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${
                                            ev.current
                                                ? "bg-[#00c9a7] border-[#0a0f0f] text-[#0a0f0f] shadow-lg shadow-[#00c9a7]/50 animate-pulse"
                                                : ev.completed
                                                  ? "bg-[#0d1f1f] border-[#00c9a7] text-[#00c9a7]"
                                                  : "bg-[#0d1f1f] border-[#1a4a4a] text-[#3a6b66]"
                                        }`}
                                    >
                                        {ev.completed ? (
                                            <CheckCircle2 size={12} strokeWidth={3} />
                                        ) : (
                                            <span className="w-1.5 h-1.5 rounded-full bg-[#1a4a4a]" />
                                        )}
                                    </div>

                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h5
                                                className={`text-xs font-bold ${
                                                    ev.current
                                                        ? "text-[#00e5c0]"
                                                        : ev.completed
                                                          ? "text-[#e0faf5]"
                                                          : "text-[#3a6b66]"
                                                }`}
                                            >
                                                {ev.title}
                                            </h5>
                                            {ev.current && (
                                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/40">
                                                    Current Checkpoint
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-[11px] text-[#7ecfc4]/80 leading-relaxed">
                                            {ev.description}
                                        </p>

                                        <div className="flex items-center gap-2 text-[10px] text-[#3a6b66] pt-0.5">
                                            <MapPin size={10} />
                                            <span>{ev.location}</span>
                                            <span>•</span>
                                            <span>{ev.timestamp}</span>
                                        </div>

                                        {ev.author && (
                                            <div className="text-[10px] text-[#3a6b66] pt-0.5 flex items-center gap-1">
                                                <span>Author:</span>
                                                <span className="text-[#00c9a7] font-semibold">{ev.author}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-[#1a4a4a]/60 text-center">
                        <p className="text-[11px] text-[#3a6b66]">
                            Consignment telemetry synchronized via FreightAgent Core •{" "}
                            <span className="text-[#00c9a7]">support@freightagent.com</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
