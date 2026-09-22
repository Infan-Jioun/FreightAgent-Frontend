// This needs 'use client' because: it orchestrates real-time socket updates, consignment filters, CSV export, and administrative dispatch actions with RBAC security.
"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Download, RefreshCw, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { shipmentService } from "@/app/services/shipment.service";
import { adminService } from "@/app/services/admin.service";
import {
    IShipment,
    ShipmentStatus,
    IUpdateShipmentStatusPayload,
    IRoadAgent,
} from "@/app/types/shipment.types";
import { usePermission } from "@/app/hooks/usePermission";
import { useSocketEvent } from "@/app/hooks/useSocket";
import { usePaymentSocket } from "@/app/hooks/usePaymentSocket";
import { AppError } from "@/app/errorHelper/appError";
import { PageHeader } from "@/components/ui/PageHeader";
import { RefundModal } from "@/components/payment/RefundModal";

// Modular Subcomponents
import { ShipmentStatsCards } from "./components/ShipmentStatsCards";
import { ShipmentFilters } from "./components/ShipmentFilters";
import { ShipmentTable } from "./components/ShipmentTable";
import { ShipmentDetailsModal } from "./components/ShipmentDetailsModal";
import { UpdateStatusModal } from "./components/UpdateStatusModal";
import { AssignAgentModal } from "./components/AssignAgentModal";
import { DeleteShipmentModal } from "./components/DeleteShipmentModal";
import { AdminShipmentsUnauthorized } from "./components/AdminShipmentsUnauthorized";

const PAGE_SIZE = 10;

export default function AdminShipmentsPage() {
    // ─── 1. Authentication & Admin Authorization Check ────────────────────────
    const { isAuthenticated, isAdmin, can } = usePermission();
    const canReadAll = can("shipments:read_all");

    // ─── 2. State Management (useState) ───────────────────────────────────────
    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "ALL">("ALL");
    const [currentPage, setCurrentPage] = useState(1);

    // Modal States
    const [selectedShipment, setSelectedShipment] = useState<IShipment | null>(null);
    const [statusModalShipment, setStatusModalShipment] = useState<IShipment | null>(null);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [assignModalShipment, setAssignModalShipment] = useState<IShipment | null>(null);
    const [availableAgents, setAvailableAgents] = useState<IRoadAgent[]>([]);
    const [loadingAgents, setLoadingAgents] = useState(false);
    const [filterAllAreas, setFilterAllAreas] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    const [deleteModalShipment, setDeleteModalShipment] = useState<IShipment | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const [refundModalShipment, setRefundModalShipment] = useState<IShipment | null>(null);

    // ─── 3. Data Fetching & Side Effects (useEffect) ──────────────────────────
    const fetchShipments = useCallback(async () => {
        if (!isAdmin) return;
        setLoading(true);
        try {
            const res = await shipmentService.getAllShipments({
                status: statusFilter === "ALL" ? undefined : statusFilter,
                search: searchQuery.trim() || undefined,
            });

            setShipments((prev) => {
                const prevMap = new Map<string, IShipment>();
                prev.forEach((s) => prevMap.set(s.id, s));

                return (res.shipments || []).map((s) => {
                    const prevS = prevMap.get(s.id);
                    let assignedAgent = s.assignedAgent;

                    // Preserve locally assigned agent if backend list query didn't populate full object
                    if (!assignedAgent && prevS?.assignedAgent) {
                        if (!s.assignedAgentId || s.assignedAgentId === prevS.assignedAgentId) {
                            assignedAgent = prevS.assignedAgent;
                        }
                    }

                    return {
                        ...s,
                        assignedAgent: assignedAgent ?? s.assignedAgent,
                    };
                });
            });
            setCurrentPage(1);
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to load consignments");
        } finally {
            setLoading(false);
        }
    }, [isAdmin, statusFilter, searchQuery]);

    // Initial and reactive fetch on filter changes & eager agent pre-fetch
    useEffect(() => {
        if (isAdmin) {
            void fetchShipments();
            void adminService
                .getAvailableAgents()
                .then((agents) => {
                    setAvailableAgents(agents);
                })
                .catch(() => {});
        }
    }, [fetchShipments, isAdmin]);

    // ─── 4. Real-time Socket Event Subscriptions ──────────────────────────────
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

    // ─── 5. Metrics & Filtered/Paginated Data ─────────────────────────────────
    const inTransitCount = useMemo(
        () =>
            shipments.filter(
                (s) => s.status === "IN_TRANSIT" || s.status === "OUT_FOR_DELIVERY"
            ).length,
        [shipments]
    );

    const deliveredCount = useMemo(
        () => shipments.filter((s) => s.status === "DELIVERED").length,
        [shipments]
    );

    const customsOrPendingCount = useMemo(
        () =>
            shipments.filter(
                (s) => s.status === "AT_CUSTOMS" || s.status === "PENDING"
            ).length,
        [shipments]
    );

    const totalPages = Math.max(1, Math.ceil(shipments.length / PAGE_SIZE));
    const paginatedShipments = useMemo(() => {
        const start = (currentPage - 1) * PAGE_SIZE;
        return shipments.slice(start, start + PAGE_SIZE);
    }, [shipments, currentPage]);

    // ─── 6. Action Handlers ───────────────────────────────────────────────────
    // CSV Export
    const handleExportCSV = () => {
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

    // Agent Assignment Flow
    const handleOpenAssignModal = async (shipment: IShipment) => {
        setAssignModalShipment(shipment);
        setFilterAllAreas(false);
        setLoadingAgents(true);
        try {
            const agents = await adminService.getAvailableAgents();
            setAvailableAgents(agents);
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to load road agents");
        } finally {
            setLoadingAgents(false);
        }
    };

    const handleToggleFilterAllAreas = () => {
        setFilterAllAreas((prev) => !prev);
    };

    const handleRefreshAgents = async () => {
        setLoadingAgents(true);
        try {
            const agents = await adminService.getAvailableAgents();
            setAvailableAgents(agents);
            toast.success("Carrier agents refreshed");
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to load road agents");
        } finally {
            setLoadingAgents(false);
        }
    };

    const handleAssignSubmit = async (agentId: string, note?: string) => {
        if (!assignModalShipment) return;
        setIsAssigning(true);
        try {
            const updated = await adminService.assignAgentToShipment(assignModalShipment.id, {
                agentId,
                note,
            });
            toast.success(`Road Agent assigned to shipment #${assignModalShipment.trackingId}!`);

            const assignedAgentObj = availableAgents.find((a) => a.id === agentId);
            const mergedShipment: IShipment = {
                ...assignModalShipment,
                ...updated,
                assignedAgentId: agentId,
                assignedAgent: updated.assignedAgent || assignedAgentObj || assignModalShipment.assignedAgent,
                status: updated.status || "ASSIGNED",
            };

            setShipments((prev) =>
                prev.map((s) => (s.id === mergedShipment.id ? mergedShipment : s))
            );

            if (selectedShipment?.id === mergedShipment.id) {
                setSelectedShipment((prev) =>
                    prev ? { ...prev, ...mergedShipment } : mergedShipment
                );
            }

            setAssignModalShipment(null);
            void fetchShipments();
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to assign road agent");
        } finally {
            setIsAssigning(false);
        }
    };

    // Checkpoint Status Update Flow
    const handleOpenStatusModal = (shipment: IShipment) => {
        setStatusModalShipment(shipment);
    };

    const handleUpdateStatusSubmit = async (payload: {
        status: ShipmentStatus;
        location: string;
        note?: string;
    }) => {
        if (!statusModalShipment) return;
        setIsUpdatingStatus(true);
        try {
            const updatePayload: IUpdateShipmentStatusPayload = {
                status: payload.status,
                location: payload.location,
                note: payload.note,
            };

            const updated = await shipmentService.updateStatus(
                statusModalShipment.id,
                updatePayload
            );
            toast.success(`Consignment status updated to ${payload.status.replace(/_/g, " ")}`);

            setShipments((prev) =>
                prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
            );

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

    // Consignment Deletion Flow
    const handleOpenDeleteModal = (shipment: IShipment) => {
        setDeleteModalShipment(shipment);
    };

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

    // ─── 7. Render Authorization Checks ───────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
                <Loader2 size={32} className="text-[#00c9a7] animate-spin" />
                <p className="text-xs font-semibold text-[#7ecfc4]">
                    Verifying administrative authorization...
                </p>
            </div>
        );
    }

    if (!isAdmin || !canReadAll) {
        return <AdminShipmentsUnauthorized />;
    }

    // ─── 8. Main Render ───────────────────────────────────────────────────────
    return (
        <main className="space-y-6">
            {/* Header + Export Actions */}
            <PageHeader
                title="Global Freight & Consignment Manifest"
                subtitle="Central dispatch authority: Track all global consignments, waybills, and transit checkpoints."
                badge="Admin Console"
                badgeColor="teal"
                actions={
                    <>
                        <button
                            type="button"
                            onClick={fetchShipments}
                            disabled={loading}
                            className="px-3.5 py-2.5 rounded-2xl bg-[#112a2a] hover:bg-[#00c9a7]/15 border border-[#1a4a4a] hover:border-[#00c9a7] text-xs font-bold text-[#00e5c0] transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                            title="Refresh List"
                        >
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                            <span className="hidden sm:inline">Refresh</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleExportCSV}
                            className="px-4 py-2.5 rounded-2xl bg-[#112a2a] hover:bg-[#00c9a7]/15 border border-[#1a4a4a] hover:border-[#00c9a7] text-xs font-bold text-[#00e5c0] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Download size={15} />
                            <span>Export Manifest (CSV)</span>
                        </button>
                    </>
                }
            />

            {/* Overview KPI Metric Cards */}
            <ShipmentStatsCards
                totalCount={shipments.length}
                inTransitCount={inTransitCount}
                deliveredCount={deliveredCount}
                customsOrPendingCount={customsOrPendingCount}
            />

            {/* Search & Status Filters */}
            <ShipmentFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
            />

            {/* Manifest Table with Pagination */}
            <ShipmentTable
                shipments={paginatedShipments}
                loading={loading}
                isAdmin={isAdmin}
                availableAgents={availableAgents}
                onViewDetails={setSelectedShipment}
                onOpenStatusModal={handleOpenStatusModal}
                onOpenAssignModal={handleOpenAssignModal}
                onOpenRefundModal={setRefundModalShipment}
                onOpenDeleteModal={handleOpenDeleteModal}
                currentPage={currentPage}
                totalPages={totalPages}
                totalCount={shipments.length}
                pageSize={PAGE_SIZE}
                onPageChange={setCurrentPage}
            />

            {/* Consignment Details Modal */}
            <ShipmentDetailsModal
                shipment={selectedShipment}
                isAdmin={isAdmin}
                onClose={() => setSelectedShipment(null)}
                onOpenStatusModal={handleOpenStatusModal}
                onOpenAssignModal={handleOpenAssignModal}
                onOpenRefundModal={setRefundModalShipment}
                onOpenDeleteModal={setDeleteModalShipment}
            />

            {/* Update Checkpoint Status Modal */}
            <UpdateStatusModal
                shipment={statusModalShipment}
                isOpen={Boolean(statusModalShipment)}
                onClose={() => setStatusModalShipment(null)}
                onSubmit={handleUpdateStatusSubmit}
                loading={isUpdatingStatus}
            />

            {/* Assign Road Agent Modal */}
            <AssignAgentModal
                shipment={assignModalShipment}
                isOpen={Boolean(assignModalShipment)}
                onClose={() => setAssignModalShipment(null)}
                onSubmit={handleAssignSubmit}
                availableAgents={availableAgents}
                loadingAgents={loadingAgents}
                filterAllAreas={filterAllAreas}
                onToggleFilterAllAreas={handleToggleFilterAllAreas}
                isAssigning={isAssigning}
                onRefreshAgents={handleRefreshAgents}
            />

            {/* Delete Consignment Confirmation Modal */}
            <DeleteShipmentModal
                shipment={deleteModalShipment}
                isOpen={Boolean(deleteModalShipment)}
                onClose={() => setDeleteModalShipment(null)}
                onConfirm={handleDeleteShipment}
                isDeleting={isDeleting}
            />

            {/* Stripe Payment Refund Modal */}
            <RefundModal
                isOpen={Boolean(refundModalShipment)}
                onClose={() => setRefundModalShipment(null)}
                onSuccess={() => {
                    void fetchShipments();
                }}
                shipment={refundModalShipment}
            />
        </main>
    );
}
