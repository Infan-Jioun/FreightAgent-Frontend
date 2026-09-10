"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
    Search,
    MapPin,
    Truck,
    Package,
    CheckCircle2,
    Clock,
    Calendar,
    Phone,
    Copy,
    ArrowRight,
    ShieldCheck,
    Navigation,
    AlertCircle,
    Ship,
} from "lucide-react";
import { toast } from "sonner";
import MaritimeRouteTrackingWidget from "@/components/ui/dashboard/MaritimeRouteTrackingWidget";
import { Button } from "@/components/ui/button";


interface TrackingEvent {
    id: string;
    title: string;
    description: string;
    location: string;
    timestamp: string;
    completed: boolean;
    current?: boolean;
}

interface ShipmentDetails {
    trackingCode: string;
    status: "IN_TRANSIT" | "DELIVERED" | "PENDING" | "OUT_FOR_DELIVERY";
    origin: string;
    originAddress: string;
    destination: string;
    destAddress: string;
    eta: string;
    carrier: string;
    driverName: string;
    driverPhone: string;
    vehiclePlate: string;
    weight: string;
    dimensions: string;
    serviceType: string;
    events: TrackingEvent[];
}

const SAMPLE_TRACKING_DATA: Record<string, ShipmentDetails> = {
    "#26277887-ID-YK": {
        trackingCode: "#26277887-ID-YK",
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
        weight: "4.2 lbs (1.9 kg)",
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
                title: "Departed Sort Facility",
                description: "Dispatched via Interstate Transport Hub 04 towards East Coast gateway.",
                location: "Chicago Sort Terminal 2",
                timestamp: "Oct 06, 2023 - 12:15 PM",
                completed: true,
            },
            {
                id: "e3",
                title: "In Transit Between Hubs",
                description: "Passing Waypoint 03 - Akron Logistics Checkpoint. Highway transit on schedule.",
                location: "Akron, OH Highway Corridor",
                timestamp: "Oct 06, 2023 - 02:40 PM",
                completed: true,
                current: true,
            },
            {
                id: "e4",
                title: "Out for Delivery",
                description: "Courier assigned and dispatched for last-mile destination route.",
                location: "Celina Local Delivery Center",
                timestamp: "Pending Arrival",
                completed: false,
            },
            {
                id: "e5",
                title: "Delivered",
                description: "Recipient digital signature and confirmation of drop-off.",
                location: "Celina, DE 10299",
                timestamp: "Estimated 4:45 PM",
                completed: false,
            },
        ],
    },
    "#26277886-ID-KL": {
        trackingCode: "#26277886-ID-KL",
        status: "DELIVERED",
        origin: "New York Hub",
        originAddress: "JFK Air Cargo Building 77, Jamaica, NY 11430",
        destination: "Inglewood, ME 98380",
        destAddress: "88 Harbor Pine Way, Inglewood, ME 98380",
        eta: "Delivered on Oct 04",
        carrier: "FreightAgent Standard Sea/Air",
        driverName: "Jerome Bell",
        driverPhone: "+1 (555) 774-2914",
        vehiclePlate: "NY-448-BBA",
        weight: "1.8 lbs (0.8 kg)",
        dimensions: "10 x 8 x 4 in",
        serviceType: "Standard Ground Delivery",
        events: [
            {
                id: "e1",
                title: "Package Received",
                description: "Package received at origin warehouse.",
                location: "New York Hub",
                timestamp: "Oct 03, 2023 - 09:00 AM",
                completed: true,
            },
            {
                id: "e2",
                title: "In Transit",
                description: "En route to New England sorting facility.",
                location: "Portland Regional Depot",
                timestamp: "Oct 03, 2023 - 06:15 PM",
                completed: true,
            },
            {
                id: "e3",
                title: "Out for Delivery",
                description: "Assigned to delivery route with courier Jerome Bell.",
                location: "Inglewood Depot",
                timestamp: "Oct 04, 2023 - 08:30 AM",
                completed: true,
            },
            {
                id: "e4",
                title: "Delivered & Signed",
                description: "Delivered to front porch. Signed by recipient: J. Doe.",
                location: "Inglewood, ME 98380",
                timestamp: "Oct 04, 2023 - 01:15 PM",
                completed: true,
                current: true,
            },
        ],
    },
};

function TrackingContent() {
    const searchParams = useSearchParams();
    const queryId = searchParams.get("id") || searchParams.get("trackingId") || "";

    const [inputCode, setInputCode] = useState(queryId || "#26277887-ID-YK");
    const [currentTracking, setCurrentTracking] = useState<ShipmentDetails>(
        SAMPLE_TRACKING_DATA[queryId] || SAMPLE_TRACKING_DATA["#26277887-ID-YK"]
    );
    const [trackingView, setTrackingView] = useState<"MARITIME" | "REGIONAL">("MARITIME");

    useEffect(() => {
        if (queryId && SAMPLE_TRACKING_DATA[queryId]) {
            setInputCode(queryId);
            setCurrentTracking(SAMPLE_TRACKING_DATA[queryId]);
        }
    }, [queryId]);

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const code = inputCode.trim();
        if (!code) {
            toast.error("Please enter a tracking number");
            return;
        }

        if (SAMPLE_TRACKING_DATA[code]) {
            setCurrentTracking(SAMPLE_TRACKING_DATA[code]);
            toast.success(`Loaded tracking details for ${code}`);
        } else {
            // Generate dynamic sample for demo
            setCurrentTracking({
                trackingCode: code,
                status: "IN_TRANSIT",
                origin: "Logistics Hub Central",
                originAddress: "Cargo Port Alpha, Facility 102",
                destination: "Recipient Destination",
                destAddress: "Commercial Terminal Dock 3",
                eta: "In 2 business days",
                carrier: "FreightAgent Global Network",
                driverName: "Alex Mercer",
                driverPhone: "+1 (555) 201-9482",
                vehiclePlate: "FA-801-EXP",
                weight: "5.4 lbs (2.4 kg)",
                dimensions: "12 x 12 x 8 in",
                serviceType: "Express Freight Line",
                events: [
                    {
                        id: "ge1",
                        title: "Shipment Registered",
                        description: "Waybill generated and container scanned.",
                        location: "Origin Distribution Center",
                        timestamp: "Today - 09:00 AM",
                        completed: true,
                    },
                    {
                        id: "ge2",
                        title: "En Route to Regional Transit",
                        description: "Consignment is actively moving through sorting corridor.",
                        location: "Transit Hub Corridor",
                        timestamp: "Today - 01:20 PM",
                        completed: true,
                        current: true,
                    },
                    {
                        id: "ge3",
                        title: "Scheduled for Delivery",
                        description: "Will be dispatched upon arrival at target facility.",
                        location: "Target Regional Hub",
                        timestamp: "Estimated 2 Days",
                        completed: false,
                    },
                ],
            });
            toast.success(`Tracking details retrieved for ${code}`);
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Tracking number copied to clipboard");
    };

    const getStatusBadge = (status: ShipmentDetails["status"]) => {
        switch (status) {
            case "DELIVERED":
                return "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/40";
            case "IN_TRANSIT":
                return "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/40";
            case "OUT_FOR_DELIVERY":
                return "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40";
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
                        Live Freight & Parcel Tracking
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Real-time GPS telemetry, waypoint milestones, and carrier status.
                    </p>
                </div>

                {/* Quick select pills */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-semibold text-[#3a6b66]">Quick Demo:</span>
                    {Object.keys(SAMPLE_TRACKING_DATA).map((code) => (
                        <Button
                            key={code}
                            variant={currentTracking.trackingCode === code ? "pill-active" : "pill-inactive"}
                            size="xs"
                            shape="pill"
                            className="font-mono"
                            onClick={() => {
                                setInputCode(code);
                                setCurrentTracking(SAMPLE_TRACKING_DATA[code]);
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
                        placeholder="Enter tracking number (e.g. #26277887-ID-YK)"
                        className="w-full pl-11 pr-4 py-2.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-mono text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] transition-colors"
                    />
                </div>
                <Button
                    type="submit"
                    variant="gradient"
                    shape="box"
                    size="default"
                    leftIcon={<Navigation size={15} />}
                    className="w-full sm:w-auto"
                >
                    Track Shipment
                </Button>
            </form>

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
                                Origin Facility
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
                                Destination
                            </span>
                            <p className="text-xs font-bold text-[#e0faf5] truncate">{currentTracking.destination}</p>
                            <p className="text-[11px] text-[#7ecfc4]/70 truncate">{currentTracking.destAddress}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Transit Mode Switcher: Maritime Container Liner vs Regional Ground */}
            <div className="flex items-center gap-2 p-1.5 bg-[#0d1f1f] rounded-2xl border border-[#1a4a4a] w-fit shadow-md">
                <Button
                    variant={trackingView === "MARITIME" ? "teal" : "ghost"}
                    size="sm"
                    onClick={() => setTrackingView("MARITIME")}
                    leftIcon={<Ship size={14} />}
                >
                    Maritime Vessel Corridor: Bangladesh ⇄ China
                </Button>

                <Button
                    variant={trackingView === "REGIONAL" ? "blue" : "ghost"}
                    size="sm"
                    onClick={() => setTrackingView("REGIONAL")}
                    leftIcon={<Truck size={14} />}
                >
                    Regional Ground Transit
                </Button>
            </div>

            {/* Main Layout: Progress Map & Event Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left 2 Cols: Interactive Map Visual & Driver specs */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    {trackingView === "MARITIME" ? (
                        <MaritimeRouteTrackingWidget />
                    ) : (
                        /* Simulated Radar / Map Route Panel */
                        <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#7ecfc4] flex items-center gap-2">
                                    <Navigation size={14} className="text-[#00c9a7]" />
                                    Live Transit Corridor
                                </h3>
                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00c9a7]/10 text-[#00e5c0] border border-[#00c9a7]/30 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00e5c0] animate-ping" />
                                    Live GPS Feed
                                </span>
                            </div>

                            {/* Interactive Dark Map Canvas */}
                            <div className="relative h-64 rounded-2xl bg-[#0a1414] border border-[#1a4a4a]/70 overflow-hidden flex items-center justify-center">
                                {/* Grid styling */}
                                <div
                                    className="absolute inset-0 opacity-20"
                                    style={{
                                        backgroundImage: `radial-gradient(#00c9a7 1px, transparent 1px)`,
                                        backgroundSize: "20px 20px",
                                    }}
                                />

                                {/* Waypoint Connection Line */}
                                <svg className="absolute inset-0 w-full h-full">
                                    <path
                                        d="M 60 180 Q 240 60, 480 140 T 700 90"
                                        fill="none"
                                        stroke="#1a4a4a"
                                        strokeWidth="3"
                                        strokeDasharray="6 6"
                                    />
                                    <path
                                        d="M 60 180 Q 240 60, 360 100"
                                        fill="none"
                                        stroke="url(#gradient-brand)"
                                        strokeWidth="4"
                                    />
                                    <defs>
                                        <linearGradient id="gradient-brand" x1="0%" y1="0%" x2="100%" y2="100%">
                                            <stop offset="0%" stopColor="#00c9a7" />
                                            <stop offset="100%" stopColor="#00b4d8" />
                                        </linearGradient>
                                    </defs>
                                </svg>

                                {/* Origin Pin */}
                                <div className="absolute left-12 bottom-12 flex flex-col items-center">
                                    <div className="w-6 h-6 rounded-full bg-[#00c9a7] flex items-center justify-center text-[#0a0f0f] shadow-lg shadow-[#00c9a7]/40">
                                        <Package size={13} />
                                    </div>
                                    <span className="text-[9px] font-bold text-[#e0faf5] mt-1 bg-[#0a0f0f]/80 px-2 py-0.5 rounded-sm border border-[#1a4a4a]">
                                        Origin
                                    </span>
                                </div>

                                {/* Live Moving Truck Icon */}
                                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 flex flex-col items-center animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-[#00b4d8]/20 border-2 border-[#00b4d8] flex items-center justify-center text-[#00e5c0] shadow-xl shadow-[#00b4d8]/40">
                                        <Truck size={20} />
                                    </div>
                                    <div className="mt-2 bg-[#0d1f1f]/95 border border-[#00c9a7] px-2.5 py-1 rounded-lg text-center shadow-lg">
                                        <span className="text-[10px] font-bold text-[#e0faf5] block">
                                            Waypoint 03 • 58 mph
                                        </span>
                                        <span className="text-[9px] text-[#7ecfc4]">
                                            Next Stop: Akron Depot
                                        </span>
                                    </div>
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
                                    <span className="text-[10px] text-[#3a6b66] font-semibold block">Dimensions</span>
                                    <span className="text-xs font-bold text-[#e0faf5]">{currentTracking.dimensions}</span>
                                </div>
                                <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/60">
                                    <span className="text-[10px] text-[#3a6b66] font-semibold block">Assigned Plate</span>
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

                    {/* Assigned Courier Contact Card */}
                    <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#00c9a7] to-[#00b4d8] flex items-center justify-center text-[#0a0f0f] font-black text-base shadow-md shadow-[#00c9a7]/20">
                                {currentTracking.driverName.charAt(0)}
                            </div>
                            <div>
                                <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                                    Assigned Dispatch Driver
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
                </div>

                {/* Right 1 Col: Package Milestone Timeline */}
                <div className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between pb-4 border-b border-[#1a4a4a]/60">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#7ecfc4] flex items-center gap-2">
                                <Clock size={14} className="text-[#00c9a7]" />
                                Milestone Timeline
                            </h3>
                            <span className="text-[10px] text-[#3a6b66]">
                                {currentTracking.events.filter((e) => e.completed).length} of{" "}
                                {currentTracking.events.length} Complete
                            </span>
                        </div>

                        {/* Steps List */}
                        <div className="mt-5 flex flex-col gap-6 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#1a4a4a]">
                            {currentTracking.events.map((ev, idx) => (
                                <div key={ev.id} className="relative flex items-start gap-4 pl-8">
                                    {/* Timeline Dot */}
                                    <div
                                        className={`absolute left-0 top-0.5 w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${ev.current
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
                                                className={`text-xs font-bold ${ev.current
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
                                                    Current Status
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
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 pt-4 border-t border-[#1a4a4a]/60 text-center">
                        <p className="text-[11px] text-[#3a6b66]">
                            Need assistance with this parcel? Contact Support at{" "}
                            <span className="text-[#00c9a7]">support@freightagent.com</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function TrackingPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-[400px] flex items-center justify-center">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 rounded-full border-2 border-[#1a4a4a] border-t-[#00c9a7] animate-spin" />
                        <p className="text-xs text-[#7ecfc4]">Loading tracking details...</p>
                    </div>
                </div>
            }
        >
            <TrackingContent />
        </Suspense>
    );
}
