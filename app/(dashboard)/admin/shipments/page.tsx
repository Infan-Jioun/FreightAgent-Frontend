"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Package,
    Search,
    Truck,
    MapPin,
    AlertTriangle,
    CheckCircle2,
    Clock,
    Download,
    Eye,
    RefreshCw,
    Trash2,
    X,
    Calendar,
    Weight,
    FileText,
    User,
    UserCheck,
    UserPlus,
    Phone,
    Mail,
    ShieldCheck,
    ChevronRight,
    Loader2,
    RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import { shipmentService } from "@/app/services/shipment.service";
import { adminService } from "@/app/services/admin.service";
import {
    IShipment,
    ShipmentStatus,
    IUpdateShipmentStatusPayload,
    IRoadAgent,
} from "@/app/types/shipment.types";
import { PaymentSocketPayload } from "@/app/types/socket.types";
import { StatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { RefundModal } from "@/components/payment/RefundModal";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useAuthStore } from "@/app/store/authStore";
import { useSocketEvent } from "@/app/hooks/useSocket";
import { usePaymentSocket } from "@/app/hooks/usePaymentSocket";
import { AppError } from "@/app/errorHelper/appError";

const ALL_STATUSES: { label: string; value: ShipmentStatus | "ALL" }[] = [
    { label: "All Statuses", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Assigned", value: "ASSIGNED" },
    { label: "Accepted", value: "ACCEPTED" },
    { label: "Picked Up", value: "PICKED_UP" },
    { label: "In Transit", value: "IN_TRANSIT" },
    { label: "At Customs", value: "AT_CUSTOMS" },
    { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
];

export default function AdminShipmentsPage() {
    const { user } = useAuthStore();
    const isAdmin = user?.role === "ADMIN";

    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "ALL">("ALL");

    // Modal States
    const [selectedShipment, setSelectedShipment] = useState<IShipment | null>(null);
    const [statusModalShipment, setStatusModalShipment] = useState<IShipment | null>(null);
    const [deleteModalShipment, setDeleteModalShipment] = useState<IShipment | null>(null);
    const [refundModalShipment, setRefundModalShipment] = useState<IShipment | null>(null);

    // Assign Agent Modal State
    const [assignModalShipment, setAssignModalShipment] = useState<IShipment | null>(null);
    const [availableAgents, setAvailableAgents] = useState<IRoadAgent[]>([]);
    const [loadingAgents, setLoadingAgents] = useState(false);
    const [selectedAgentId, setSelectedAgentId] = useState("");
    const [assignNote, setAssignNote] = useState("");
    const [isAssigning, setIsAssigning] = useState(false);
    const [filterAllAreas, setFilterAllAreas] = useState(false);

    // Status Update Form State
    const [newStatus, setNewStatus] = useState<ShipmentStatus>("IN_TRANSIT");
    const [statusLocation, setStatusLocation] = useState("");
    const [statusNote, setStatusNote] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Delete State
    const [isDeleting, setIsDeleting] = useState(false);

    // Fetch Shipments with debounce & status filter
    const fetchShipments = useCallback(async () => {
        setLoading(true);
        try {
            const res = await shipmentService.getAllShipments({
                status: statusFilter === "ALL" ? undefined : statusFilter,
                search: debouncedSearch.trim() || undefined,
            });
            setShipments(res.shipments);
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to load consignments");
        } finally {
            setLoading(false);
        }
    }, [statusFilter, debouncedSearch]);

    // Real-time socket updates for Admin: new request & status updates
    useSocketEvent("new_shipment_request", () => {
        void fetchShipments();
    });
    useSocketEvent("shipment_status_updated", () => {
        void fetchShipments();
    });
    useSocketEvent("agent_assigned", () => {
        void fetchShipments();
    });
    usePaymentSocket(() => {
        void fetchShipments();
    });

    useEffect(() => {
        fetchShipments();
    }, [fetchShipments]);

    // Open Assign Agent Modal & load matching road agents
    const handleOpenAssignModal = async (shipment: IShipment) => {
        setAssignModalShipment(shipment);
        setSelectedAgentId("");
        setAssignNote("");
        setFilterAllAreas(false);
        setLoadingAgents(true);
        try {
            const agents = await adminService.getAvailableAgents({
                area: shipment.origin,
                isAvailable: true,
            });
            setAvailableAgents(agents);
            if (agents.length > 0) {
                setSelectedAgentId(agents[0].id);
            }
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to load road agents");
        } finally {
            setLoadingAgents(false);
        }
    };

    const handleToggleFilterAllAreas = async () => {
        if (!assignModalShipment) return;
        const nextFilterAll = !filterAllAreas;
        setFilterAllAreas(nextFilterAll);
        setLoadingAgents(true);
        try {
            const agents = await adminService.getAvailableAgents({
                area: nextFilterAll ? undefined : assignModalShipment.origin,
                isAvailable: true,
            });
            setAvailableAgents(agents);
            if (agents.length > 0 && !agents.some((a) => a.id === selectedAgentId)) {
                setSelectedAgentId(agents[0].id);
            }
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to load road agents");
        } finally {
            setLoadingAgents(false);
        }
    };

    const handleAssignSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!assignModalShipment) return;
        if (!selectedAgentId) {
            toast.error("Please select an available Road Agent");
            return;
        }

        setIsAssigning(true);
        try {
            const updated = await adminService.assignAgentToShipment(assignModalShipment.id, {
                agentId: selectedAgentId,
                note: assignNote.trim() || undefined,
            });
            toast.success(`Road Agent assigned to shipment #${assignModalShipment.trackingId}!`);

            setShipments((prev) =>
                prev.map((s) => (s.id === updated.id ? { ...s, ...updated, status: updated.status || "ASSIGNED" } : s))
            );

            if (selectedShipment?.id === updated.id) {
                setSelectedShipment((prev) => (prev ? { ...prev, ...updated, status: updated.status || "ASSIGNED" } : updated));
            }

            setAssignModalShipment(null);
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to assign road agent");
        } finally {
            setIsAssigning(false);
        }
    };

    // Status Badge Helpers
    const getStatusStyle = (status: ShipmentStatus) => {
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
                return "bg-[#1a4a4a]/40 text-[#7ecfc4] border-[#1a4a4a]";
        }
    };

    // Open Status Modal
    const handleOpenStatusModal = (shipment: IShipment) => {
        setStatusModalShipment(shipment);
        setNewStatus(shipment.status);
        setStatusLocation(shipment.destination || "");
        setStatusNote("");
    };

    // Submit Status Update (20 req/min backend rate limit guard)
    const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!statusModalShipment) return;
        if (!statusLocation.trim()) {
            toast.error("Location is required for status checkpoint");
            return;
        }

        setIsUpdatingStatus(true);
        try {
            const payload: IUpdateShipmentStatusPayload = {
                status: newStatus,
                location: statusLocation.trim(),
                note: statusNote.trim() || undefined,
            };

            const updated = await shipmentService.updateStatus(statusModalShipment.id, payload);
            toast.success(`Consignment status updated to ${newStatus.replace(/_/g, " ")}`);

            // Update local state
            setShipments((prev) =>
                prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
            );

            // Update selected modal if currently viewed
            if (selectedShipment?.id === updated.id) {
                setSelectedShipment(updated);
            }

            setStatusModalShipment(null);
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to update consignment status");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    // Delete Shipment (5 req/hr backend rate limit guard)
    const handleDeleteShipment = async () => {
        if (!deleteModalShipment) return;
        setIsDeleting(true);
        try {
            await shipmentService.deleteShipment(deleteModalShipment.id);
            toast.success("Consignment record removed successfully");
            setShipments((prev) => prev.filter((s) => s.id !== deleteModalShipment.id));
            if (selectedShipment?.id === deleteModalShipment.id) {
                setSelectedShipment(null);
            }
            setDeleteModalShipment(null);
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to delete consignment");
        } finally {
            setIsDeleting(false);
        }
    };

    // Export CSV
    const handleExport = () => {
        if (shipments.length === 0) {
            toast.error("No shipments available to export");
            return;
        }

        const headers = ["Tracking ID", "Origin", "Destination", "Weight (kg)", "Status", "Estimated Date", "Created At"];
        const rows = shipments.map((s) => [
            s.trackingId,
            `"${s.origin.replace(/"/g, '""')}"`,
            `"${s.destination.replace(/"/g, '""')}"`,
            s.weight,
            s.status,
            s.estimatedDate || "N/A",
            new Date(s.createdAt).toLocaleDateString(),
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `freightagent_manifest_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        toast.success("Global manifest exported to CSV format");
    };

    // Metric Calculations
    const inTransitCount = shipments.filter(
        (s) => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY"
    ).length;
    const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;
    const customsOrPendingCount = shipments.filter(
        (s) => s.status === "AT_CUSTOMS" || s.status === "PENDING"
    ).length;

    return (
        <div className="space-y-6">
            {/* Header + Export */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] tracking-tight">
                        Global Freight & Consignment Manifest
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Central dispatch authority: Track all global consignments, waybills, and transit checkpoints.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={fetchShipments}
                        disabled={loading}
                        className="px-3.5 py-2.5 rounded-2xl bg-[#112a2a] hover:bg-[#00c9a7]/15 border border-[#1a4a4a] hover:border-[#00c9a7] text-xs font-bold text-[#00e5c0] transition-colors flex items-center justify-center gap-1.5"
                        title="Refresh List"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <button
                        onClick={handleExport}
                        className="px-4 py-2.5 rounded-2xl bg-[#112a2a] hover:bg-[#00c9a7]/15 border border-[#1a4a4a] hover:border-[#00c9a7] text-xs font-bold text-[#00e5c0] transition-colors flex items-center justify-center gap-2"
                    >
                        <Download size={15} />
                        <span>Export Manifest (CSV)</span>
                    </button>
                </div>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Total Consignments</span>
                        <Package size={16} className="text-[#00c9a7]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{shipments.length}</p>
                    <span className="text-[10px] text-[#7ecfc4] font-semibold mt-0.5 block">Across all corridors</span>
                </div>

                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">In Transit Live</span>
                        <Truck size={16} className="text-[#00b4d8]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{inTransitCount}</p>
                    <span className="text-[10px] text-[#00b4d8] font-semibold mt-0.5 block">Active on radar</span>
                </div>

                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Delivered</span>
                        <CheckCircle2 size={16} className="text-[#00e5c0]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{deliveredCount}</p>
                    <span className="text-[10px] text-[#00e5c0] font-semibold mt-0.5 block">Signed & confirmed</span>
                </div>

                <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <div className="flex items-center justify-between text-[#7ecfc4] mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider">Customs / Pending</span>
                        <AlertTriangle size={16} className="text-[#fbbf24]" />
                    </div>
                    <p className="text-xl sm:text-2xl font-black text-[#e0faf5]">{customsOrPendingCount}</p>
                    <span className="text-[10px] text-[#fbbf24] font-semibold mt-0.5 block">Requires attention</span>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="p-4 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg shadow-black/20">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] w-full md:w-auto overflow-x-auto">
                    {ALL_STATUSES.map((s) => (
                        <button
                            key={s.value}
                            onClick={() => setStatusFilter(s.value)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                                statusFilter === s.value
                                    ? "bg-[#00c9a7] text-[#0a0f0f] shadow-xs"
                                    : "text-[#7ecfc4] hover:text-[#e0faf5]"
                            }`}
                        >
                            {s.label}
                        </button>
                    ))}
                </div>

                {/* Search with Debounce protection */}
                <div className="relative w-full md:w-72">
                    <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#3a6b66]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search tracking, origin, destination..."
                        className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7]"
                    />
                </div>
            </div>

            {/* Shipments Table */}
            <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead>
                            <tr className="border-b border-[#1a4a4a] bg-[#0a1a1a]/50 text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider">
                                <th className="py-3.5 px-4">Tracking Waybill</th>
                                <th className="py-3.5 px-4">Route (Origin → Dest)</th>
                                <th className="py-3.5 px-4">Status</th>
                                <th className="py-3.5 px-4">Payment</th>
                                <th className="py-3.5 px-4">Assigned Agent</th>
                                <th className="py-3.5 px-4">Assigned By</th>
                                <th className="py-3.5 px-4">Weight</th>
                                <th className="py-3.5 px-4">Est. Date</th>
                                <th className="py-3.5 px-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1a4a4a]/40">
                            {loading ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center">
                                        <Loader2 size={28} className="mx-auto text-[#00c9a7] animate-spin mb-2" />
                                        <p className="text-xs font-semibold text-[#7ecfc4]">
                                            Loading consignments from network...
                                        </p>
                                    </td>
                                </tr>
                            ) : shipments.length === 0 ? (
                                <tr>
                                    <td colSpan={9} className="py-12 text-center">
                                        <Package size={36} className="mx-auto text-[#3a6b66] mb-2" />
                                        <p className="text-xs font-bold text-[#e0faf5]">No consignments match current filter</p>
                                        <p className="text-[11px] text-[#7ecfc4]/70 mt-1">Try resetting the status filter or search query</p>
                                    </td>
                                </tr>
                            ) : (
                                shipments.map((item) => (
                                    <tr
                                        key={item.id}
                                        className="hover:bg-[#112a2a]/40 transition-colors group"
                                    >
                                        {/* Tracking ID */}
                                        <td className="py-3.5 px-4">
                                            <div className="min-w-0">
                                                <span className="font-mono font-bold text-[#e0faf5] block truncate">
                                                    {item.trackingId}
                                                </span>
                                                {item.user?.name && (
                                                    <span className="text-[11px] text-[#7ecfc4]/70 truncate block">
                                                        By: {item.user.name}
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* Route */}
                                        <td className="py-3.5 px-4">
                                            <div className="min-w-0 max-w-[200px]">
                                                <span className="text-[#e0faf5] font-semibold truncate block">
                                                    {item.origin}
                                                </span>
                                                <span className="text-[11px] text-[#7ecfc4] truncate block">
                                                    → {item.destination}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Status */}
                                        <td className="py-3.5 px-4">
                                            <span
                                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border inline-block ${getStatusStyle(
                                                    item.status
                                                )}`}
                                            >
                                                {item.status.replace(/_/g, " ")}
                                            </span>
                                        </td>

                                        {/* Payment */}
                                        <td className="py-3.5 px-4">
                                            <PaymentStatusBadge status={item.paymentStatus} />
                                        </td>

                                        {/* Assigned Agent */}
                                        <td className="py-3.5 px-4">
                                            {item.assignedAgent ? (
                                                <div className="min-w-0 max-w-[170px]">
                                                    <span className="font-semibold text-[#e0faf5] flex items-center gap-1.5 truncate text-xs">
                                                        <UserCheck size={13} className="text-[#00c9a7] shrink-0" />
                                                        <span className="truncate">{item.assignedAgent.name}</span>
                                                    </span>
                                                    {item.assignedAgent.assignedArea && (
                                                        <span className="text-[10px] text-[#7ecfc4]/70 block truncate">
                                                            Area: {item.assignedAgent.assignedArea}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 inline-block whitespace-nowrap">
                                                    Unassigned / Pending
                                                </span>
                                            )}
                                        </td>

                                        {/* Assigned By */}
                                        <td className="py-3.5 px-4">
                                            {item.assignedBy?.name ? (
                                                <div className="min-w-0 max-w-[130px]">
                                                    <span className="text-xs font-semibold text-[#e0faf5] block truncate">
                                                        {item.assignedBy.name}
                                                    </span>
                                                    {item.assignedBy.email && (
                                                        <span className="text-[10px] text-[#7ecfc4]/70 block truncate">
                                                            {item.assignedBy.email}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[11px] text-[#3a6b66] italic">—</span>
                                            )}
                                        </td>

                                        {/* Weight */}
                                        <td className="py-3.5 px-4 text-[#7ecfc4] font-medium">
                                            {item.weight} kg
                                        </td>

                                        {/* Est. Date */}
                                        <td className="py-3.5 px-4 text-[#e0faf5] font-medium">
                                            {item.estimatedDate ? new Date(item.estimatedDate).toLocaleDateString() : "Pending ETA"}
                                        </td>

                                        {/* Actions */}
                                        <td className="py-3.5 px-4 text-right">
                                            <div className="inline-flex items-center gap-1.5">
                                                {/* Assign Agent Action (Shown for PENDING or unassigned) */}
                                                {(item.status === "PENDING" || !item.assignedAgentId) && (
                                                    <button
                                                        onClick={() => handleOpenAssignModal(item)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-colors cursor-pointer shadow-xs"
                                                        title="Assign Road Agent"
                                                    >
                                                        <UserPlus size={12} />
                                                        <span className="hidden xl:inline">Assign Agent</span>
                                                        <span className="xl:hidden">Assign</span>
                                                    </button>
                                                )}

                                                {/* View Details Modal */}
                                                <button
                                                    onClick={() => setSelectedShipment(item)}
                                                    className="p-1.5 rounded-xl bg-[#112a2a] hover:bg-[#00c9a7]/20 text-[#7ecfc4] hover:text-[#00e5c0] border border-[#1a4a4a] hover:border-[#00c9a7]/40 transition-colors"
                                                    title="View Consignment Details"
                                                >
                                                    <Eye size={13} />
                                                </button>

                                                {/* Update Status Modal */}
                                                <button
                                                    onClick={() => handleOpenStatusModal(item)}
                                                    className="p-1.5 rounded-xl bg-[#112a2a] hover:bg-[#00b4d8]/20 text-[#7ecfc4] hover:text-[#00b4d8] border border-[#1a4a4a] hover:border-[#00b4d8]/40 transition-colors"
                                                    title="Update Checkpoint Status"
                                                >
                                                    <RefreshCw size={13} />
                                                </button>

                                                {/* Live Radar Link */}
                                                <Link
                                                    href={`/dashboard/customer/tracking?trackingId=${encodeURIComponent(item.trackingId)}`}
                                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-[11px] font-bold transition-colors"
                                                    title="Open in Radar"
                                                >
                                                    <Truck size={12} />
                                                    <span>Radar</span>
                                                </Link>

                                                {/* Issue Refund Button (ADMIN ONLY - when PAID) */}
                                                {isAdmin && item.paymentStatus === "PAID" && (
                                                    <button
                                                        onClick={() => setRefundModalShipment(item)}
                                                        className="p-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors cursor-pointer"
                                                        title="Issue Stripe Refund"
                                                    >
                                                        <RotateCcw size={13} />
                                                    </button>
                                                )}

                                                {/* Delete Button (ADMIN ONLY) */}
                                                {isAdmin && (
                                                    <button
                                                        onClick={() => setDeleteModalShipment(item)}
                                                        className="p-1.5 rounded-xl bg-[#ff6b6b]/10 hover:bg-[#ff6b6b]/20 text-[#ff6b6b] border border-[#ff6b6b]/30 transition-colors"
                                                        title="Delete Consignment (Admin only)"
                                                    >
                                                        <Trash2 size={13} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 1. SHIPMENT DETAILS MODAL */}
            {selectedShipment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                    <div className="w-full max-w-2xl bg-[#0d1f1f] border border-[#1a4a4a] rounded-3xl shadow-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#1a4a4a] pb-4">
                            <div>
                                <span className="text-[10px] font-mono text-[#00c9a7] uppercase tracking-wider block">
                                    Consignment Detail
                                </span>
                                <h3 className="text-lg font-extrabold text-[#e0faf5] tracking-tight">
                                    {selectedShipment.trackingId}
                                </h3>
                            </div>
                            <button
                                onClick={() => setSelectedShipment(null)}
                                className="p-2 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#1a4a4a] transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Top Overview Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                            <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                <span className="text-[10px] text-[#3a6b66] font-bold uppercase block mb-1">
                                    Current Status
                                </span>
                                <span
                                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border inline-block ${getStatusStyle(
                                        selectedShipment.status
                                    )}`}
                                >
                                    {selectedShipment.status.replace(/_/g, " ")}
                                </span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                <span className="text-[10px] text-[#3a6b66] font-bold uppercase block mb-1">
                                    Payment Settlement
                                </span>
                                <div className="flex items-center justify-between gap-1">
                                    <PaymentStatusBadge status={selectedShipment.paymentStatus} />
                                    {selectedShipment.paymentStatus === "PAID" && isAdmin && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const s = selectedShipment;
                                                setSelectedShipment(null);
                                                setRefundModalShipment(s);
                                            }}
                                            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer"
                                        >
                                            Refund
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                <span className="text-[10px] text-[#3a6b66] font-bold uppercase block mb-1">
                                    Cargo Weight
                                </span>
                                <span className="text-sm font-bold text-[#e0faf5] flex items-center gap-1">
                                    <Weight size={14} className="text-[#00c9a7]" />
                                    {selectedShipment.weight} kg
                                </span>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                <span className="text-[10px] text-[#3a6b66] font-bold uppercase block mb-1">
                                    Estimated Delivery
                                </span>
                                <span className="text-sm font-bold text-[#e0faf5] flex items-center gap-1">
                                    <Calendar size={14} className="text-[#00b4d8]" />
                                    {selectedShipment.estimatedDate
                                        ? new Date(selectedShipment.estimatedDate).toLocaleDateString()
                                        : "TBD"}
                                </span>
                            </div>
                        </div>

                        {/* Route Corridors */}
                        <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-3">
                            <span className="text-[10px] text-[#3a6b66] font-bold uppercase block">Transit Corridor</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Origin Facility</span>
                                    <p className="text-xs font-semibold text-[#e0faf5] flex items-center gap-1.5">
                                        <MapPin size={13} className="text-[#00c9a7] shrink-0" />
                                        <span>{selectedShipment.origin}</span>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Destination Hub</span>
                                    <p className="text-xs font-semibold text-[#e0faf5] flex items-center gap-1.5">
                                        <MapPin size={13} className="text-[#00b4d8] shrink-0" />
                                        <span>{selectedShipment.destination}</span>
                                    </p>
                                </div>
                            </div>

                            {selectedShipment.description && (
                                <div className="pt-2 border-t border-[#1a4a4a]">
                                    <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Cargo Description</span>
                                    <p className="text-xs text-[#e0faf5]">{selectedShipment.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Assigned Agent & Dispatch Details */}
                        <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] text-[#3a6b66] font-bold uppercase block">
                                    Road Agent Assignment
                                </span>
                                {(selectedShipment.status === "PENDING" || !selectedShipment.assignedAgentId) && (
                                    <button
                                        onClick={() => {
                                            const s = selectedShipment;
                                            setSelectedShipment(null);
                                            handleOpenAssignModal(s);
                                        }}
                                        className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                                    >
                                        <UserPlus size={12} />
                                        <span>Assign Now</span>
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div>
                                    <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Carrier Agent</span>
                                    {selectedShipment.assignedAgent ? (
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                                                <UserCheck size={13} className="text-[#00c9a7]" />
                                                <span>{selectedShipment.assignedAgent.name}</span>
                                            </p>
                                            {selectedShipment.assignedAgent.phone && (
                                                <p className="text-[11px] text-[#7ecfc4]">
                                                    <a
                                                        href={`tel:${selectedShipment.assignedAgent.phone}`}
                                                        className="hover:underline hover:text-[#00e5c0]"
                                                    >
                                                        {selectedShipment.assignedAgent.phone}
                                                    </a>
                                                </p>
                                            )}
                                            {selectedShipment.assignedAgent.assignedArea && (
                                                <p className="text-[10px] text-[#7ecfc4]/70">
                                                    Area: {selectedShipment.assignedAgent.assignedArea}
                                                </p>
                                            )}
                                        </div>
                                    ) : (
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/40 bg-amber-500/15 text-amber-300 inline-block">
                                            Waiting for Assignment
                                        </span>
                                    )}
                                </div>

                                <div>
                                    <span className="text-[10px] text-[#7ecfc4] block mb-0.5">Assigned By (Admin)</span>
                                    {selectedShipment.assignedBy ? (
                                        <div className="space-y-0.5">
                                            <p className="text-xs font-bold text-[#e0faf5]">
                                                {selectedShipment.assignedBy.name}
                                            </p>
                                            <p className="text-[11px] text-[#7ecfc4]">
                                                {selectedShipment.assignedBy.email}
                                            </p>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-[#3a6b66] italic">Not yet dispatched</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Status Checkpoint Logs */}
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                                <Clock size={14} className="text-[#00c9a7]" />
                                <span>Transit Checkpoint History (Audit Trail)</span>
                            </h4>

                            {selectedShipment.statusLogs && selectedShipment.statusLogs.length > 0 ? (
                                <div className="space-y-2 border-l-2 border-[#1a4a4a] pl-4 ml-2">
                                    {selectedShipment.statusLogs.map((log) => (
                                        <div key={log.id} className="relative pb-2">
                                            <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-[#00c9a7]" />
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-bold text-[#e0faf5]">
                                                    {log.status.replace(/_/g, " ")}
                                                </span>
                                                <span className="text-[10px] text-[#3a6b66]">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-[11px] text-[#7ecfc4]">
                                                {log.location}
                                                {log.note && <span className="text-[#e0faf5]/80"> — {log.note}</span>}
                                            </p>
                                            {/* Audit trail who updated */}
                                            <p className="text-[10px] text-[#3a6b66] mt-0.5 flex items-center gap-1">
                                                <span>Logged by:</span>
                                                <span className="text-[#7ecfc4] font-medium">
                                                    {log.updatedByUser
                                                        ? `${log.updatedByUser.name} (${log.updatedByUser.role})`
                                                        : "System"}
                                                </span>
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-xs text-[#3a6b66] italic">No intermediate checkpoints recorded yet.</p>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-[#1a4a4a]">
                            <button
                                onClick={() => {
                                    handleOpenStatusModal(selectedShipment);
                                }}
                                className="px-4 py-2 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-xs font-bold transition-colors"
                            >
                                Update Status
                            </button>

                            <Link
                                href={`/tracking?id=${encodeURIComponent(selectedShipment.trackingId)}`}
                                className="px-4 py-2 rounded-xl bg-[#112a2a] hover:bg-[#00c9a7]/15 text-[#00e5c0] border border-[#1a4a4a] text-xs font-bold transition-colors flex items-center gap-1.5"
                            >
                                <span>Open in Live Radar</span>
                                <ChevronRight size={13} />
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* 2. UPDATE STATUS MODAL (20 req/min limit guard) */}
            {statusModalShipment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-[#0d1f1f] border border-[#1a4a4a] rounded-3xl shadow-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-[#1a4a4a] pb-3">
                            <div>
                                <span className="text-[10px] font-mono text-[#00c9a7] uppercase tracking-wider block">
                                    Update Checkpoint
                                </span>
                                <h3 className="text-base font-extrabold text-[#e0faf5]">
                                    {statusModalShipment.trackingId}
                                </h3>
                            </div>
                            <button
                                onClick={() => setStatusModalShipment(null)}
                                className="p-1.5 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                                    New Status State
                                </label>
                                <select
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                                    className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-hidden focus:border-[#00c9a7]"
                                >
                                    <option value="PENDING">PENDING</option>
                                    <option value="PICKED_UP">PICKED_UP</option>
                                    <option value="IN_TRANSIT">IN_TRANSIT</option>
                                    <option value="AT_CUSTOMS">AT_CUSTOMS</option>
                                    <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
                                    <option value="DELIVERED">DELIVERED</option>
                                    <option value="CANCELLED">CANCELLED</option>
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                                    Checkpoint Location *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={statusLocation}
                                    onChange={(e) => setStatusLocation(e.target.value)}
                                    placeholder="e.g. Chicago Cargo Hub Gate 4"
                                    className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7]"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                                    Checkpoint Note (Optional)
                                </label>
                                <textarea
                                    rows={2}
                                    value={statusNote}
                                    onChange={(e) => setStatusNote(e.target.value)}
                                    placeholder="e.g. Scanned into interstate transit container"
                                    className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a4a4a]">
                                <button
                                    type="button"
                                    onClick={() => setStatusModalShipment(null)}
                                    className="px-4 py-2 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdatingStatus}
                                    className="px-4 py-2 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-xs font-bold text-[#0a0f0f] transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                    {isUpdatingStatus && <Loader2 size={13} className="animate-spin" />}
                                    <span>{isUpdatingStatus ? "Updating..." : "Commit Checkpoint"}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* 3. DELETE CONFIRMATION MODAL (5 req/hr limit guard - ADMIN ONLY) */}
            {deleteModalShipment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                    <div className="w-full max-w-sm bg-[#0d1f1f] border border-[#ff6b6b]/40 rounded-3xl shadow-2xl p-6 space-y-4">
                        <div className="flex items-center gap-3 text-[#ff6b6b]">
                            <div className="p-2.5 rounded-2xl bg-[#ff6b6b]/15 border border-[#ff6b6b]/30">
                                <AlertTriangle size={20} />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-[#e0faf5]">Delete Consignment?</h3>
                                <p className="text-[11px] text-[#ff6b6b]">This action is irreversible</p>
                            </div>
                        </div>

                        <p className="text-xs text-[#7ecfc4]">
                            Are you sure you want to delete consignment{" "}
                            <span className="font-mono font-bold text-[#e0faf5]">{deleteModalShipment.trackingId}</span>? All checkpoint logs will be permanently purged.
                        </p>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a4a4a]">
                            <button
                                type="button"
                                onClick={() => setDeleteModalShipment(null)}
                                className="px-4 py-2 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors"
                            >
                                Keep
                            </button>
                            <button
                                type="button"
                                disabled={isDeleting}
                                onClick={handleDeleteShipment}
                                className="px-4 py-2 rounded-xl bg-[#ff6b6b] hover:bg-[#ff5252] text-xs font-bold text-white transition-colors flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                {isDeleting && <Loader2 size={13} className="animate-spin" />}
                                <span>{isDeleting ? "Deleting..." : "Delete Consignment"}</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* 4. ASSIGN ROAD AGENT MODAL */}
            {assignModalShipment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                    <div className="w-full max-w-lg bg-[#0d1f1f] border border-[#1a4a4a] rounded-3xl shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center justify-between border-b border-[#1a4a4a] pb-3">
                            <div>
                                <span className="text-[10px] font-mono text-amber-400 uppercase tracking-wider block">
                                    Dispatch Assignment
                                </span>
                                <h3 className="text-base font-extrabold text-[#e0faf5]">
                                    Assign Road Agent — {assignModalShipment.trackingId}
                                </h3>
                            </div>
                            <button
                                onClick={() => setAssignModalShipment(null)}
                                className="p-1.5 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

                        {/* Shipment Route Summary */}
                        <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-between text-xs">
                            <div>
                                <span className="text-[10px] text-[#7ecfc4] block">Route Corridor:</span>
                                <span className="font-bold text-[#e0faf5]">
                                    {assignModalShipment.origin} → {assignModalShipment.destination}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-[10px] text-[#7ecfc4] block">Weight:</span>
                                <span className="font-bold text-[#00e5c0]">{assignModalShipment.weight} kg</span>
                            </div>
                        </div>

                        {/* Filter Area Toggle */}
                        <div className="flex items-center justify-between text-xs pt-1">
                            <span className="text-[#7ecfc4] text-[11px]">
                                {filterAllAreas
                                    ? "Showing all available agents across network"
                                    : `Matching area corridor: "${assignModalShipment.origin}"`}
                            </span>
                            <button
                                type="button"
                                onClick={handleToggleFilterAllAreas}
                                className="text-[11px] font-bold text-[#00e5c0] hover:underline"
                            >
                                {filterAllAreas ? "Filter by origin only" : "Show all available agents"}
                            </button>
                        </div>

                        <form onSubmit={handleAssignSubmit} className="space-y-4">
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
                                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
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
                                                            className="text-[#00c9a7] focus:ring-0"
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
                                    className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] resize-none"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a4a4a]">
                                <button
                                    type="button"
                                    onClick={() => setAssignModalShipment(null)}
                                    className="px-4 py-2 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors"
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
            )}

            {/* 5. STRIPE REFUND MODAL */}
            <RefundModal
                isOpen={Boolean(refundModalShipment)}
                onClose={() => setRefundModalShipment(null)}
                onSuccess={() => {
                    void fetchShipments();
                }}
                shipment={refundModalShipment}
            />
        </div>
    );
}
