"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Shield,
    Package,
    Users,
    Truck,
    Clock,
    RefreshCw,
    Loader2,
    ArrowRight,
    MapPin,
    Calendar,
    UserCheck,
    AlertCircle,
} from "lucide-react";
import { shipmentService } from "@/app/services/shipment.service";
import { adminService } from "@/app/services/admin.service";
import { IShipment } from "@/app/types/shipment.types";
import { IAdminUser } from "@/app/types/admin.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/app/constants/routes";
import { toast } from "sonner";
import { AppError } from "@/app/errorHelper/appError";
import { useAuthStore } from "@/app/store/authStore";

export default function AdminOverviewPage() {
    const { user } = useAuthStore();
    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [usersList, setUsersList] = useState<IAdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const loadAdminMetrics = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const [shipmentsRes, usersRes] = await Promise.all([
                shipmentService.getAllShipments({ limit: 100 }),
                adminService.getAllUsers({ limit: 100 }),
            ]);

            setShipments(shipmentsRes.shipments);
            setUsersList(usersRes.users);
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to load admin metrics");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadAdminMetrics();
    }, [loadAdminMetrics]);

    // Metric Calculations
    const totalShipments = shipments.length;
    const totalUsers = usersList.length;
    const totalAgents = usersList.filter((u) => u.role === "AGENT").length;
    const pendingShipments = shipments.filter((s) => s.status === "PENDING").length;

    const recentShipments = shipments.slice(0, 5);

    return (
        <div className="space-y-6 pb-12">
            {/* Header section with welcome and quick actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#e11d48]/15 text-[#f43f5e] border border-[#e11d48]/30">
                            Administrator Root
                        </span>
                        <span className="text-xs text-[#7ecfc4]/70">Platform Master Console</span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] mt-1 tracking-tight">
                        Platform Operations Hub
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Global oversight across registered logistics users, certified freight agents, and shipments.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => loadAdminMetrics(true)}
                        disabled={loading || refreshing}
                        className="p-2.5 rounded-xl border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer disabled:opacity-50"
                        title="Refresh platform metrics"
                    >
                        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    </button>
                    <Link
                        href={ROUTES.DASHBOARD_ADMIN_USERS}
                        className="px-3.5 py-2.5 rounded-xl border border-[#1a4a4a] bg-[#0a1a1a] text-xs font-bold text-[#e0faf5] hover:bg-[#112a2a] transition-all flex items-center justify-center gap-2 shadow-xs"
                    >
                        <Users size={14} className="text-[#00c9a7]" />
                        <span>Manage Users</span>
                    </Link>
                    <Link
                        href={ROUTES.DASHBOARD_ADMIN_SHIPMENTS}
                        className="px-4 py-2.5 rounded-xl bg-[#00c9a7] text-xs font-bold text-[#0a0f0f] hover:bg-[#00e5c0] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#00c9a7]/20"
                    >
                        <Package size={15} />
                        <span>All Shipments</span>
                    </Link>
                </div>
            </div>

            {/* 4 Admin Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Total Shipments */}
                <div className="p-5 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] relative overflow-hidden group hover:border-[#00c9a7]/40 transition-all shadow-md">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#7ecfc4] uppercase tracking-wider">
                            Total Shipments
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-[#00c9a7]/10 border border-[#00c9a7]/30 flex items-center justify-center text-[#00c9a7]">
                            <Package size={20} />
                        </div>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <div className="h-8 w-16 bg-[#1a4a4a]/40 rounded-md animate-pulse" />
                        ) : (
                            <span className="text-3xl font-extrabold text-[#e0faf5] tracking-tight">
                                {totalShipments}
                            </span>
                        )}
                        <p className="text-[11px] text-[#7ecfc4]/70 mt-1">Platform freight consignments</p>
                    </div>
                </div>

                {/* 2. Total Users */}
                <div className="p-5 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] relative overflow-hidden group hover:border-blue-500/40 transition-all shadow-md">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                            Total Users
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <div className="h-8 w-16 bg-[#1a4a4a]/40 rounded-md animate-pulse" />
                        ) : (
                            <span className="text-3xl font-extrabold text-blue-300 tracking-tight">
                                {totalUsers}
                            </span>
                        )}
                        <p className="text-[11px] text-[#7ecfc4]/70 mt-1">Registered platform accounts</p>
                    </div>
                </div>

                {/* 3. Total Agents */}
                <div className="p-5 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] relative overflow-hidden group hover:border-purple-500/40 transition-all shadow-md">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
                            Total Agents
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
                            <Truck size={20} />
                        </div>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <div className="h-8 w-16 bg-[#1a4a4a]/40 rounded-md animate-pulse" />
                        ) : (
                            <span className="text-3xl font-extrabold text-purple-300 tracking-tight">
                                {totalAgents}
                            </span>
                        )}
                        <p className="text-[11px] text-[#7ecfc4]/70 mt-1">Certified freight carriers</p>
                    </div>
                </div>

                {/* 4. Pending Shipments */}
                <div className="p-5 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] relative overflow-hidden group hover:border-neutral-500/40 transition-all shadow-md">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
                            Pending
                        </span>
                        <div className="w-10 h-10 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-neutral-300">
                            <Clock size={20} />
                        </div>
                    </div>
                    <div className="mt-4">
                        {loading ? (
                            <div className="h-8 w-16 bg-[#1a4a4a]/40 rounded-md animate-pulse" />
                        ) : (
                            <span className="text-3xl font-extrabold text-neutral-200 tracking-tight">
                                {pendingShipments}
                            </span>
                        )}
                        <p className="text-[11px] text-[#7ecfc4]/70 mt-1">Awaiting dispatch or pickup</p>
                    </div>
                </div>
            </div>

            {/* Global Shipments Feed */}
            <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden">
                <div className="p-5 border-b border-[#1a4a4a] flex items-center justify-between">
                    <div>
                        <h2 className="text-base font-bold text-[#e0faf5]">Recent Global Consignments</h2>
                        <p className="text-xs text-[#7ecfc4]">Latest bookings across all merchants and carriers</p>
                    </div>
                    <Link
                        href={ROUTES.DASHBOARD_ADMIN_SHIPMENTS}
                        className="text-xs font-bold text-[#00c9a7] hover:text-[#00e5c0] flex items-center gap-1.5 transition-colors"
                    >
                        <span>Manage All Consignments</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>

                {loading ? (
                    <div className="p-12 flex flex-col items-center justify-center gap-2">
                        <Loader2 className="w-6 h-6 text-[#00c9a7] animate-spin" />
                        <span className="text-xs text-[#7ecfc4]">Loading consignments...</span>
                    </div>
                ) : recentShipments.length === 0 ? (
                    <div className="p-12 text-center text-xs text-[#7ecfc4]">
                        No consignments currently in database.
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Tracking ID</TableHead>
                                <TableHead>Shipper</TableHead>
                                <TableHead>Origin → Destination</TableHead>
                                <TableHead>Weight</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {recentShipments.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-mono font-bold text-[#00e5c0]">
                                        {s.trackingId}
                                    </TableCell>
                                    <TableCell className="text-xs text-[#e0faf5] font-medium">
                                        {s.user?.name || "Merchant"}
                                    </TableCell>
                                    <TableCell className="text-xs text-[#7ecfc4]">
                                        {s.origin} → {s.destination}
                                    </TableCell>
                                    <TableCell className="text-xs text-[#7ecfc4]">
                                        {s.weight} kg
                                    </TableCell>
                                    <TableCell>
                                        <StatusBadge status={s.status} />
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Link
                                            href={ROUTES.DASHBOARD_ADMIN_SHIPMENTS}
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-[#00c9a7] hover:text-[#00e5c0]"
                                        >
                                            <span>Manage</span>
                                            <ArrowRight size={12} />
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
