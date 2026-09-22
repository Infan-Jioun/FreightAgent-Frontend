// This needs 'use client' because: it manages carrier terminal duty status, real-time assignment websockets, and interactive checkpoint actions with RBAC gates.
"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Truck,
    UserCheck,
    CheckSquare,
    CheckCircle2,
    RefreshCw,
    Loader2,
    ArrowRight,
    MapPin,
    Calendar,
    Radio,
    Package,
    Shield,
    X,
} from "lucide-react";
import { agentService } from "@/app/services/agent.service";
import { IShipment } from "@/app/types/shipment.types";
import { IAgentProfile } from "@/app/types/agent.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/app/constants/routes";
import { StatCard, StatCardsGrid } from "@/components/ui/dashboard/StatCard";
import { Modal } from "@/components/ui/Modal";
import { toast } from "sonner";
import { AppError } from "@/app/errorHelper/appError";
import { useAuthStore } from "@/app/store/authStore";
import { useSocketEvent, useSocketContext } from "@/app/hooks/useSocket";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function AgentOverviewPage() {
    const { user } = useAuthStore();
    const { isConnected } = useSocketContext();

    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [profile, setProfile] = useState<IAgentProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Availability Toggle State
    const [isAvailable, setIsAvailable] = useState(true);
    const [updatingAvailability, setUpdatingAvailability] = useState(false);

    // Accept Shipment State
    const [acceptModalShipment, setAcceptModalShipment] = useState<IShipment | null>(null);
    const [acceptLocation, setAcceptLocation] = useState("");
    const [acceptNote, setAcceptNote] = useState("");
    const [isAccepting, setIsAccepting] = useState(false);

    // Socket.IO hook for Agent: auto-adds incoming shipment without refresh
    useSocketEvent("shipment_assigned", (data: unknown) => {
        const record = data as { trackingId?: string; origin?: string; destination?: string };
        const trackingId = record?.trackingId || "";
        toast.success(`Consignment #${trackingId} assigned to your terminal!`);
        void loadDashboardData(true);
    });

    useSocketEvent("shipment_status_updated", () => {
        void loadDashboardData(true);
    });

    const loadDashboardData = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const [shipmentsRes, profileRes] = await Promise.allSettled([
                agentService.getAssignedShipments({ limit: 50 }),
                agentService.getProfile(),
            ]);

            if (shipmentsRes.status === "fulfilled") {
                setShipments(shipmentsRes.value.shipments);
            }

            if (profileRes.status === "fulfilled") {
                setProfile(profileRes.value);
                setIsAvailable(profileRes.value.isAvailable);
            }
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to load agent console data");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // Handle Availability Toggle (PATCH /api/v1/agent/availability)
    const handleToggleAvailability = async () => {
        const nextState = !isAvailable;
        setIsAvailable(nextState);
        setUpdatingAvailability(true);
        try {
            const res = await agentService.setAvailability(nextState);
            setIsAvailable(res.isAvailable);
            toast.success(
                res.isAvailable
                    ? "Terminal status set to: Available for dispatch"
                    : "Terminal status set to: Off Duty / Busy"
            );
        } catch (err: unknown) {
            setIsAvailable(!nextState); // rollback on error
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to update availability status");
        } finally {
            setUpdatingAvailability(false);
        }
    };

    // Handle Accept Shipment Submit (PATCH /api/v1/agent/shipments/:id/accept)
    const handleAcceptSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!acceptModalShipment) return;

        setIsAccepting(true);
        try {
            const updated = await agentService.acceptShipment(acceptModalShipment.id, {
                location: acceptLocation.trim() || undefined,
                note: acceptNote.trim() || undefined,
            });

            toast.success(`Shipment #${acceptModalShipment.trackingId} Accepted!`);
            setShipments((prev) =>
                prev.map((s) => (s.id === updated.id ? { ...s, ...updated, status: "ACCEPTED" } : s))
            );
            setAcceptModalShipment(null);
            setAcceptLocation("");
            setAcceptNote("");
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to accept shipment");
        } finally {
            setIsAccepting(false);
        }
    };

    // Metric Calculations
    const activeCount = profile?.activeShipmentsCount ?? shipments.filter((s) => s.status !== "DELIVERED" && s.status !== "CANCELLED").length;
    const deliveredCount = profile?.deliveredShipmentsCount ?? shipments.filter((s) => s.status === "DELIVERED").length;
    const assignedCount = shipments.filter((s) => s.status === "ASSIGNED").length;
    const inTransitCount = shipments.filter(
        (s) =>
            s.status === "IN_TRANSIT" ||
            s.status === "PICKED_UP" ||
            s.status === "AT_CUSTOMS" ||
            s.status === "OUT_FOR_DELIVERY"
    ).length;

    const recentAssigned = shipments.slice(0, 5);

    return (
        <div className="space-y-6 pb-12">
            {/* Header section with Availability Toggle and Socket Pill */}
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl">
                <div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
                            Road Carrier Terminal
                        </span>
                        {profile?.assignedArea && (
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30 flex items-center gap-1">
                                <MapPin size={10} />
                                {profile.assignedArea}
                            </span>
                        )}
                        {/* Live Socket Status Pill */}
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0a1a1a] border border-[#1a4a4a] text-[11px] font-semibold text-[#7ecfc4]">
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    isConnected ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                                }`}
                            />
                            <span>{isConnected ? "Live Socket Active" : "Connecting..."}</span>
                        </div>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] mt-1 tracking-tight">
                        Carrier Hub: {user?.name || "Road Agent"}
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Accept assigned shipments, broadcast transit milestones, and manage dispatch duty.
                    </p>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                    {/* Availability Toggle Switch */}
                    <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                        <div className="flex flex-col">
                            <span className="text-[9px] uppercase font-bold text-[#7ecfc4]/70">Duty Status</span>
                            <span className="text-xs font-bold text-[#e0faf5]">
                                {isAvailable ? "Ready / Active" : "Off Duty / Busy"}
                            </span>
                        </div>
                        <button
                            type="button"
                            onClick={handleToggleAvailability}
                            disabled={updatingAvailability}
                            aria-label="Toggle agent availability status"
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                isAvailable ? "bg-[#00c9a7]" : "bg-[#1a4a4a]"
                            } disabled:opacity-50`}
                        >
                            <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-[#0a0f0f] shadow-lg transition duration-200 ease-in-out ${
                                    isAvailable ? "translate-x-5" : "translate-x-0"
                                }`}
                            />
                        </button>
                    </div>

                    <button
                        type="button"
                        onClick={() => loadDashboardData(true)}
                        disabled={loading || refreshing}
                        className="p-2.5 rounded-xl border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer disabled:opacity-50"
                        title="Refresh assigned consignments"
                    >
                        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    </button>

                    <Link
                        href={ROUTES.DASHBOARD_AGENT_SHIPMENTS}
                        className="px-4 py-2.5 rounded-xl bg-[#00c9a7] text-xs font-bold text-[#0a0f0f] hover:bg-[#00e5c0] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#00c9a7]/20 whitespace-nowrap"
                    >
                        <Truck size={15} />
                        <span>View Assigned Deliveries</span>
                    </Link>
                </div>
            </div>

            {/* 4 Agent Summary Metric Cards with Uniform Size & Reusable StatCard */}
            <StatCardsGrid>
                <StatCard
                    title="New Assigned"
                    value={assignedCount}
                    icon={UserCheck}
                    variant="amber"
                    loading={loading}
                    subtitle="Awaiting carrier acceptance"
                />

                <StatCard
                    title="Active Deliveries"
                    value={activeCount}
                    icon={CheckSquare}
                    variant="blue"
                    loading={loading}
                    subtitle="Ongoing assigned shipments"
                />

                <StatCard
                    title="In Transit"
                    value={inTransitCount}
                    icon={Truck}
                    variant="orange"
                    loading={loading}
                    subtitle="On the road / in delivery"
                />

                <StatCard
                    title="Delivered Total"
                    value={deliveredCount}
                    icon={CheckCircle2}
                    variant="teal"
                    loading={loading}
                    subtitle="Successfully signed & delivered"
                />
            </StatCardsGrid>

            {/* Recent Assigned Shipments Table */}
            <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden">
                <div className="p-5 border-b border-[#1a4a4a] flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-[#e0faf5]">Active Dispatches</h2>
                        <p className="text-xs text-[#7ecfc4]">Latest freight tasks routed to your agent terminal</p>
                    </div>
                    <Link
                        href={ROUTES.DASHBOARD_AGENT_SHIPMENTS}
                        className="text-xs font-bold text-[#00c9a7] hover:text-[#00e5c0] flex items-center gap-1.5 transition-colors"
                    >
                        <span>View All Assigned</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-[#00c9a7] animate-spin" />
                        <span className="text-xs text-[#7ecfc4]">Loading assigned consignments...</span>
                    </div>
                ) : recentAssigned.length === 0 ? (
                    <div className="p-12 text-center">
                        <Truck className="w-10 h-10 mx-auto text-[#7ecfc4]/40 mb-2" />
                        <p className="text-sm font-semibold text-[#e0faf5]">No shipments currently assigned</p>
                        <p className="text-xs text-[#7ecfc4] mt-1">
                            New bookings dispatched by administrators will appear here in real-time.
                        </p>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tracking ID</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead>Route (Origin → Destination)</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Booking Date</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentAssigned.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-mono font-bold text-[#00e5c0]">
                                        {s.trackingId}
                                    </TableCell>
                                    <TableCell className="text-xs text-[#e0faf5] font-medium">
                                        {s.user?.name || "Merchant"}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="text-[#e0faf5] font-medium">{s.origin}</span>
                                            <span className="text-[#7ecfc4]/60">→</span>
                                            <span className="text-[#e0faf5] font-medium">{s.destination}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={s.status} />
                                    </TableCell>
                                    <TableCell className="text-xs text-[#7ecfc4]">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} className="text-[#7ecfc4]/70" />
                                            {new Date(s.createdAt).toLocaleDateString()}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="inline-flex items-center gap-1.5">
                                            {/* Accept Action Button for ASSIGNED status */}
                                            {s.status === "ASSIGNED" && (
                                                <PermissionGate permission="shipments:accept">
                                                    <button
                                                        onClick={() => {
                                                            setAcceptModalShipment(s);
                                                            setAcceptLocation(s.origin || "");
                                                            setAcceptNote("");
                                                        }}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
                                                        title="Accept Shipment"
                                                    >
                                                        <CheckSquare size={13} />
                                                        <span>Accept</span>
                                                    </button>
                                                </PermissionGate>
                                            )}

                                            <PermissionGate permission="shipments:update_status">
                                                <Link
                                                    href={`/dashboard/agent/shipments/${s.id}`}
                                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#00c9a7]/10 text-xs font-semibold text-[#00e5c0] border border-[#00c9a7]/30 hover:bg-[#00c9a7] hover:text-[#0a0f0f] transition-all"
                                                >
                                                    <span>Update Status</span>
                                                    <ArrowRight size={12} />
                                                </Link>
                                            </PermissionGate>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

            {/* ACCEPT SHIPMENT MODAL */}
            <Modal
                isOpen={!!acceptModalShipment}
                onClose={() => setAcceptModalShipment(null)}
                maxWidth="md"
                title={
                    acceptModalShipment && (
                        <div>
                            <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                                Carrier Acceptance
                            </span>
                            <span>Accept Consignment #{acceptModalShipment.trackingId}</span>
                        </div>
                    )
                }
            >
                {acceptModalShipment && (
                    <div className="space-y-4">
                        <p className="text-xs text-[#7ecfc4]">
                            Confirming acceptance changes consignment status from <strong className="text-amber-400">ASSIGNED</strong> to <strong className="text-emerald-400">ACCEPTED</strong>.
                        </p>

                        <form onSubmit={handleAcceptSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                                    Current Terminal / Location (Optional)
                                </label>
                                <input
                                    type="text"
                                    value={acceptLocation}
                                    onChange={(e) => setAcceptLocation(e.target.value)}
                                    placeholder="e.g. Chattogram Port / Hub Warehouse"
                                    className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                                    Acceptance Note (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={acceptNote}
                                    onChange={(e) => setAcceptNote(e.target.value)}
                                    placeholder="e.g. Received by agent, ready for pickup"
                                    className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a4a4a]">
                                <button
                                    type="button"
                                    onClick={() => setAcceptModalShipment(null)}
                                    className="px-4 py-2 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isAccepting}
                                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-xs font-bold text-[#0a0f0f] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                                >
                                    {isAccepting && <Loader2 size={13} className="animate-spin" />}
                                    <span>{isAccepting ? "Accepting..." : "Confirm Acceptance"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </Modal>
        </div>
    );
}
