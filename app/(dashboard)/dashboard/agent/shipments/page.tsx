"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
    Truck,
    RefreshCw,
    ArrowRight,
    User,
    CheckSquare,
    X,
    Eye,
    Loader2,
} from "lucide-react";
import { agentService } from "@/app/services/agent.service";
import { IShipment, ShipmentStatus } from "@/app/types/shipment.types";
import { IPaginationMeta } from "@/app/types/admin.types";
import { StatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import {
    PaginatedDataTable,
    DataTableColumn,
    FilterTabOption,
} from "@/components/ui/PaginatedDataTable";
import { toast } from "sonner";
import { AppError } from "@/app/errorHelper/appError";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useSocketEvent, useSocketContext } from "@/app/hooks/useSocket";
import { usePaymentSocket } from "@/app/hooks/usePaymentSocket";
import { AgentShipmentDetailsModal } from "./components/AgentShipmentDetailsModal";

const AGENT_STATUS_TABS: FilterTabOption<ShipmentStatus | "ALL">[] = [
    { key: "ALL", label: "All Assigned" },
    { key: "ASSIGNED", label: "Assigned" },
    { key: "ACCEPTED", label: "Accepted" },
    { key: "PICKED_UP", label: "Picked Up" },
    { key: "IN_TRANSIT", label: "In Transit" },
    { key: "DELIVERED", label: "Delivered" },
];

export default function AgentShipmentsPage() {
    const { isConnected } = useSocketContext();
    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [meta, setMeta] = useState<IPaginationMeta | undefined>();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "ALL">("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);
    const [page, setPage] = useState(1);
    const limit = 10;
    const totalPages = Math.max(
        1,
        meta?.totalPage ?? meta?.totalPages ?? (meta?.total ? Math.ceil(meta.total / limit) : 1)
    );

    // Consignment Details Modal State
    const [detailsModalShipment, setDetailsModalShipment] = useState<IShipment | null>(null);

    // Accept Shipment Modal State
    const [acceptModalShipment, setAcceptModalShipment] = useState<IShipment | null>(null);
    const [acceptLocation, setAcceptLocation] = useState("");
    const [acceptNote, setAcceptNote] = useState("");
    const [isAccepting, setIsAccepting] = useState(false);

    // Socket.IO hook: auto-add new shipment to the list without refresh
    useSocketEvent("shipment_assigned", (data: unknown) => {
        const record = data as { trackingId?: string };
        toast.success(`Consignment #${record?.trackingId || ""} assigned to your terminal!`);
        void fetchAssigned(true);
    });

    useSocketEvent("shipment_status_updated", () => {
        void fetchAssigned(true);
    });

    usePaymentSocket(() => {
        void fetchAssigned(true);
    });

    const fetchAssigned = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const res = await agentService.getAssignedShipments({
                page,
                limit,
                status: statusFilter === "ALL" ? undefined : statusFilter,
                search: debouncedSearch.trim() || undefined,
            });
            setShipments(res.shipments);
            setMeta(res.meta);
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to load assigned shipments");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [page, statusFilter, debouncedSearch]);

    useEffect(() => {
        fetchAssigned();
    }, [fetchAssigned]);

    // Reset to page 1 on filter or search change
    const handleStatusFilterChange = (val: ShipmentStatus | "ALL") => {
        setStatusFilter(val);
        setPage(1);
    };

    const handleSearchChange = (val: string) => {
        setSearchTerm(val);
        setPage(1);
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
            if (detailsModalShipment?.id === updated.id) {
                setDetailsModalShipment((prev) =>
                    prev ? { ...prev, ...updated, status: "ACCEPTED" } : null
                );
            }
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

    // Define Table Columns
    const columns = useMemo<DataTableColumn<IShipment>[]>(
        () => [
            {
                id: "waybill",
                header: "Tracking Waybill",
                cell: (s) => (
                    <div className="flex flex-col min-w-0">
                        <span
                            className="font-mono font-bold text-[#e0faf5] group-hover:text-[#00e5c0] transition-colors truncate max-w-[190px]"
                            title={`Waybill: ${s.trackingId}`}
                        >
                            {s.trackingId.length > 20
                                ? `${s.trackingId.slice(0, 10)}...${s.trackingId.slice(-6)}`
                                : s.trackingId}
                        </span>
                        <div className="flex items-center gap-1.5 text-[11px] text-[#7ecfc4]/70 truncate max-w-[190px] mt-0.5">
                            <User size={11} className="text-[#7ecfc4]/60 shrink-0" />
                            <span className="truncate">{s.user?.name || "Merchant Shipper"}</span>
                        </div>
                    </div>
                ),
            },
            {
                id: "route",
                header: "Route Corridor",
                cell: (s) => (
                    <div className="flex items-center gap-1.5 text-[#e0faf5] font-semibold text-xs min-w-0 max-w-[240px]">
                        <span className="truncate" title={s.origin}>
                            {s.origin}
                        </span>
                        <span className="text-[#00c9a7] shrink-0 font-bold">→</span>
                        <span className="truncate" title={s.destination}>
                            {s.destination}
                        </span>
                    </div>
                ),
            },
            {
                id: "cargo",
                header: "Cargo",
                cell: (s) => (
                    <div className="flex flex-col min-w-0">
                        <span className="font-bold text-[#e0faf5] text-xs">
                            {s.weight} <span className="text-[11px] font-normal text-[#7ecfc4]">kg</span>
                        </span>
                        {s.declaredCargoValue ? (
                            <span className="text-[10px] text-amber-300 font-mono">
                                ${s.declaredCargoValue.toFixed(0)} USD
                            </span>
                        ) : s.description ? (
                            <span className="text-[10px] text-[#7ecfc4]/60 truncate max-w-[140px]" title={s.description}>
                                {s.description}
                            </span>
                        ) : null}
                    </div>
                ),
            },
            {
                id: "status",
                header: "Status",
                cell: (s) => <StatusBadge status={s.status} />,
            },
            {
                id: "payment",
                header: "Payment & Commission",
                cell: (s) => (
                    <div className="flex flex-col gap-1 min-w-0">
                        <PaymentStatusBadge status={s.paymentStatus} />
                        <div className="flex items-center gap-1 text-[11px] font-mono">
                            <span className="text-[#7ecfc4]">Comm:</span>
                            <span className="font-bold text-[#00e5c0]">
                                ${(s.cost?.agencyFee ?? 0).toFixed(2)}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                id: "actions",
                header: "Actions",
                align: "right",
                cell: (s) => (
                    <div
                        className="inline-flex items-center gap-1.5 justify-end"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Details Button */}
                        <button
                            type="button"
                            onClick={() => setDetailsModalShipment(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-xs font-bold transition-colors cursor-pointer"
                            title="View consignment details & payment"
                        >
                            <Eye size={13} />
                            <span>Details</span>
                        </button>

                        {/* Accept Button for ASSIGNED status */}
                        {s.status === "ASSIGNED" && (
                            <button
                                type="button"
                                onClick={() => {
                                    setAcceptModalShipment(s);
                                    setAcceptLocation(s.origin || "");
                                    setAcceptNote("");
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all cursor-pointer shadow-xs"
                                title="Accept Consignment"
                            >
                                <CheckSquare size={12} />
                                <span>Accept</span>
                            </button>
                        )}

                        {/* Manage / Update link */}
                        <Link
                            href={`/dashboard/agent/shipments/${s.id}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#112a2a] hover:bg-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] border border-[#1a4a4a] text-xs font-bold transition-colors cursor-pointer"
                            title="Manage Checkpoint Tracking"
                        >
                            <Truck size={13} />
                            <span className="hidden lg:inline">Update</span>
                            <ArrowRight size={12} />
                        </Link>
                    </div>
                ),
            },
        ],
        []
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
                            Carrier Terminal
                        </span>
                        {/* Live Socket Status Pill */}
                        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0a1a1a] border border-[#1a4a4a] text-[11px] font-semibold text-[#7ecfc4]">
                            <span
                                className={`w-2 h-2 rounded-full ${
                                    isConnected ? "bg-emerald-400 animate-pulse" : "bg-neutral-500"
                                }`}
                            />
                            <span>{isConnected ? "Live Socket Active" : "Reconnecting..."}</span>
                        </div>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] mt-1 tracking-tight">
                        Assigned Freight Deliveries
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Consignments dispatched to your carrier terminal. Review cargo, accept consignments, and update checkpoints.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={() => fetchAssigned(true)}
                    disabled={loading || refreshing}
                    className="p-2.5 rounded-xl border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer disabled:opacity-50"
                    title="Refresh assigned consignments"
                >
                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                </button>
            </div>

            {/* Unified Reusable Paginated Data Table with Filter Tabs */}
            <PaginatedDataTable
                data={shipments}
                columns={columns}
                rowKey={(s) => s.id}
                onRowClick={(s) => setDetailsModalShipment(s)}
                loading={loading}
                tabs={AGENT_STATUS_TABS}
                activeTab={statusFilter}
                onTabChange={handleStatusFilterChange}
                showFilterIcon
                tabsTitle="Filter:"
                search={{
                    value: searchTerm,
                    onChange: handleSearchChange,
                    placeholder: "Search tracking ID, customer, city...",
                }}
                pagination={
                    meta && totalPages > 1
                        ? {
                              currentPage: page,
                              totalPages,
                              totalCount: meta.total,
                              pageSize: limit,
                              itemName: "consignments",
                              onPageChange: (p) => setPage(p),
                          }
                        : undefined
                }
                emptyState={{
                    icon: Truck,
                    title: "No assigned shipments found",
                    description:
                        searchTerm || statusFilter !== "ALL"
                            ? "No shipments matched your search criteria."
                            : "You do not have any shipments assigned currently. Incoming dispatches will appear here automatically.",
                    action:
                        statusFilter !== "ALL" || searchTerm ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setStatusFilter("ALL");
                                    setSearchTerm("");
                                    setPage(1);
                                }}
                                className="px-4 py-2 rounded-xl border border-[#1a4a4a] bg-[#0a1a1a] text-xs font-bold text-[#00e5c0] hover:bg-[#112a2a] transition-colors cursor-pointer"
                            >
                                Reset Filter
                            </button>
                        ) : null,
                }}
            />

            {/* CONSIGNMENT DETAILS MODAL */}
            <AgentShipmentDetailsModal
                shipment={detailsModalShipment}
                isOpen={Boolean(detailsModalShipment)}
                onClose={() => setDetailsModalShipment(null)}
                onOpenAcceptModal={(s) => {
                    setAcceptModalShipment(s);
                    setAcceptLocation(s.origin || "");
                    setAcceptNote("");
                }}
            />

            {/* ACCEPT SHIPMENT MODAL */}
            {acceptModalShipment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
                    <div className="w-full max-w-md bg-[#0d1f1f] border border-[#1a4a4a] rounded-3xl shadow-2xl p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-[#1a4a4a] pb-3">
                            <div>
                                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block">
                                    Carrier Acceptance
                                </span>
                                <h3 className="text-base font-extrabold text-[#e0faf5]">
                                    Accept Consignment #{acceptModalShipment.trackingId}
                                </h3>
                            </div>
                            <button
                                onClick={() => setAcceptModalShipment(null)}
                                className="p-1.5 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#e0faf5] transition-colors"
                            >
                                <X size={15} />
                            </button>
                        </div>

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
                </div>
            )}
        </div>
    );
}
