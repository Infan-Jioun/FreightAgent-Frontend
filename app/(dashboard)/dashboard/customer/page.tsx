"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Package,
    Clock,
    Truck,
    CheckCircle2,
    PlusCircle,
    Search,
    ArrowRight,
    RefreshCw,
    Loader2,
    Calendar,
    MapPin,
    UserCheck,
} from "lucide-react";
import { shipmentService } from "@/app/services/shipment.service";
import { IShipment } from "@/app/types/shipment.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/app/constants/routes";
import { StatCard, StatCardsGrid } from "@/components/ui/dashboard/StatCard";
import { toast } from "sonner";
import { AppError } from "@/app/errorHelper/appError";
import { useAuthStore } from "@/app/store/authStore";
import { useSocketEvent } from "@/app/hooks/useSocket";

export default function CustomerOverviewPage() {
    const { user } = useAuthStore();
    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadShipments = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const res = await shipmentService.getMyShipments({ limit: 100 });
            setShipments(res.shipments);
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to load dashboard metrics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    // Socket.IO real-time listener for live updates
    useSocketEvent("agent_assigned", () => {
        void loadShipments(true);
    });

    useSocketEvent("shipment_status_updated", () => {
        void loadShipments(true);
    });

    useEffect(() => {
        loadShipments();
    }, [loadShipments]);

    // Metric Calculations
    const totalShipments = shipments.length;
    const pendingCount = shipments.filter((s) => s.status === "PENDING").length;
    const inTransitCount = shipments.filter(
        (s) =>
            s.status === "IN_TRANSIT" ||
            s.status === "PICKED_UP" ||
            s.status === "ASSIGNED" ||
            s.status === "ACCEPTED" ||
            s.status === "AT_CUSTOMS" ||
            s.status === "OUT_FOR_DELIVERY"
    ).length;
    const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;

    const recentShipments = shipments.slice(0, 5);

    return (
        <div className="space-y-6 pb-12">
            {/* Header section with welcome and quick actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30">
                            Merchant Portal
                        </span>
                        <span className="text-xs text-[#7ecfc4]/70">B2B Logistics Control</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] mt-1 tracking-tight">
                        Welcome back, {user?.name || "Customer"}
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Track consignments, manage bookings, and monitor freight shipments in real-time.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => loadShipments(true)}
                        disabled={loading || refreshing}
                        className="p-2.5 rounded-xl border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer disabled:opacity-50"
                        title="Refresh metrics"
                    >
                        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    </button>
                    <Link
                        href={ROUTES.DASHBOARD_CUSTOMER_TRACKING}
                        className="px-3.5 py-2.5 rounded-xl border border-[#1a4a4a] bg-[#0a1a1a] text-xs font-bold text-[#e0faf5] hover:bg-[#112a2a] transition-all flex items-center justify-center gap-2 shadow-xs"
                    >
                        <Search size={14} className="text-[#00c9a7]" />
                        <span>Live Tracking</span>
                    </Link>
                    <Link
                        href={ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS_NEW}
                        className="px-4 py-2.5 rounded-xl bg-[#00c9a7] text-xs font-bold text-[#0a0f0f] hover:bg-[#00e5c0] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#00c9a7]/20"
                    >
                        <PlusCircle size={15} />
                        <span>Book Shipment</span>
                    </Link>
                </div>
            </div>

            {/* 4 Customer Summary Cards with Uniform Size & Reusable StatCard */}
            <StatCardsGrid>
                <StatCard
                    title="Total Shipments"
                    value={totalShipments}
                    icon={Package}
                    variant="teal"
                    loading={loading}
                    subtitle="All registered consignments"
                />

                <StatCard
                    title="Pending"
                    value={pendingCount}
                    icon={Clock}
                    variant="neutral"
                    loading={loading}
                    subtitle="Awaiting carrier dispatch"
                />

                <StatCard
                    title="In Transit"
                    value={inTransitCount}
                    icon={Truck}
                    variant="orange"
                    loading={loading}
                    subtitle="Active movement on network"
                />

                <StatCard
                    title="Delivered"
                    value={deliveredCount}
                    icon={CheckCircle2}
                    variant="teal"
                    loading={loading}
                    subtitle="Successfully completed"
                />
            </StatCardsGrid>

            {/* Recent Shipments Table Section */}
            <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden">
                <div className="p-5 border-b border-[#1a4a4a] flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-[#e0faf5]">Recent Consignments</h2>
                        <p className="text-xs text-[#7ecfc4]">Latest freight activity on your account</p>
                    </div>
                    <Link
                        href={ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS}
                        className="text-xs font-bold text-[#00c9a7] hover:text-[#00e5c0] flex items-center gap-1.5 transition-colors"
                    >
                        <span>View All Shipments</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-[#00c9a7] animate-spin" />
                        <span className="text-xs text-[#7ecfc4]">Loading consignments...</span>
                    </div>
                ) : recentShipments.length === 0 ? (
                    <div className="p-12 text-center">
                        <Package className="w-10 h-10 mx-auto text-[#7ecfc4]/40 mb-2" />
                        <p className="text-sm font-semibold text-[#e0faf5]">No shipments booked yet</p>
                        <p className="text-xs text-[#7ecfc4] mt-1 mb-4">
                            Start booking freight cargo and tracking transit milestones.
                        </p>
                        <Link
                            href={ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS_NEW}
                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00c9a7] text-[#0a0f0f] text-xs font-bold hover:bg-[#00e5c0] transition-colors"
                        >
                            <PlusCircle size={14} />
                            Book First Shipment
                        </Link>
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tracking ID</TableHead>
                                <TableHead>Route (Origin → Destination)</TableHead>
                                <TableHead>Assigned Agent</TableHead>
                                <TableHead>Weight</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Booked Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentShipments.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-mono font-bold text-[#00e5c0]">
                                        {s.trackingId}
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <span className="text-[#e0faf5] font-medium">{s.origin}</span>
                                            <span className="text-[#7ecfc4]/60">→</span>
                                            <span className="text-[#e0faf5] font-medium">{s.destination}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        {s.assignedAgent ? (
                                            <span className="text-xs font-bold text-[#e0faf5] flex items-center gap-1 truncate max-w-[140px]">
                                                <UserCheck size={12} className="text-[#00c9a7] shrink-0" />
                                                <span className="truncate">{s.assignedAgent.name}</span>
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 inline-block">
                                                Pending Agent
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-xs text-[#7ecfc4]">
                                        {s.weight} kg
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={s.status} />
                                    </TableCell>
                                    <TableCell className="text-xs text-[#7ecfc4]">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} className="text-[#7ecfc4]/70" />
                                            {new Date(s.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                year: "numeric",
                                            })}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href={`/dashboard/customer/tracking?trackingId=${encodeURIComponent(s.trackingId)}`}
                                            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg border border-[#1a4a4a] bg-[#0a1a1a] text-xs font-semibold text-[#7ecfc4] hover:text-[#00e5c0] hover:border-[#00c9a7]/40 transition-all"
                                        >
                                            <Search size={12} />
                                            Track
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
