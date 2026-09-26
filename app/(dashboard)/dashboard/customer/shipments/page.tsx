"use client";

/**
 * CustomerShipmentsPage.tsx
 * 
 * This needs 'use client' because: it manages interactive customer actions (initiating
 * Stripe payments, opening consignment detail modals, listening to real-time Socket.IO
 * updates, and driving client-side filter and search state).
 * 
 * Employs the unified PaginatedDataTable composite component for uniform UX,
 * React.memo row performance, and zero redundant table boilerplate.
 */

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import {
    Package,
    RefreshCw,
    PlusCircle,
    Loader2,
    Eye,
    FileText,
    Search,
    CreditCard,
} from "lucide-react";
import { shipmentService } from "@/app/services/shipment.service";
import { paymentService } from "@/app/services/payment.service";
import { IShipment, ShipmentStatus } from "@/app/types/shipment.types";
import { StatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { StripePaymentModal } from "@/components/payment/StripePaymentModal";
import {
    PaginatedDataTable,
    DataTableColumn,
    FilterTabOption,
} from "@/components/ui/PaginatedDataTable";
import { ROUTES } from "@/app/constants/routes";
import { toast } from "sonner";
import { AppError } from "@/app/errorHelper/appError";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useSocketEvent } from "@/app/hooks/useSocket";
import { usePaymentSocket } from "@/app/hooks/usePaymentSocket";
import { CustomerShipmentDetailsModal } from "./components/CustomerShipmentDetailsModal";
import { ShipmentChatButton } from "@/components/chat/ShipmentChatButton";

const STATUS_FILTERS: FilterTabOption<ShipmentStatus | "ALL">[] = [
    { key: "ALL", label: "All Statuses" },
    { key: "PENDING", label: "Pending" },
    { key: "ASSIGNED", label: "Assigned" },
    { key: "ACCEPTED", label: "Accepted" },
    { key: "PICKED_UP", label: "Picked Up" },
    { key: "IN_TRANSIT", label: "In Transit" },
    { key: "DELIVERED", label: "Delivered" },
    { key: "CANCELLED", label: "Cancelled" },
];

export default function CustomerShipmentsPage() {
    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [statusFilter, setStatusFilter] = useState<ShipmentStatus | "ALL">("ALL");
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearch = useDebounce(searchTerm, 400);

    // Consignment Details Modal State
    const [detailsModalShipment, setDetailsModalShipment] = useState<IShipment | null>(null);

    // Stripe Payment Modal State
    const [paymentModalOpen, setPaymentModalOpen] = useState(false);
    const [activePayShipment, setActivePayShipment] = useState<IShipment | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [amountUSD, setAmountUSD] = useState(0);
    const [creatingIntentId, setCreatingIntentId] = useState<string | null>(null);

    const fetchMyShipments = useCallback(async (isSilent = false) => {
        if (!isSilent) setLoading(true);
        else setRefreshing(true);

        try {
            const res = await shipmentService.getMyShipments({
                status: statusFilter === "ALL" ? undefined : statusFilter,
                search: debouncedSearch.trim() || undefined,
            });
            setShipments(res.shipments);
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to load shipments list");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [statusFilter, debouncedSearch]);

    // Live Socket listener for customer notifications
    useSocketEvent("agent_assigned", () => {
        void fetchMyShipments(true);
    });

    useSocketEvent("shipment_status_updated", () => {
        void fetchMyShipments(true);
    });

    usePaymentSocket(() => {
        void fetchMyShipments(true);
    });

    useEffect(() => {
        fetchMyShipments();
    }, [fetchMyShipments]);

    const handleOpenPayModal = async (shipment: IShipment) => {
        setCreatingIntentId(shipment.id);
        try {
            const res = await paymentService.createPaymentIntent(shipment.id);
            if (!res.clientSecret) {
                toast.error("Stripe did not return a valid client secret for this consignment.");
                return;
            }
            setActivePayShipment(shipment);
            setClientSecret(res.clientSecret);
            setAmountUSD(res.amountUSD || 0);
            setPaymentModalOpen(true);
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to initialize Stripe checkout");
        } finally {
            setCreatingIntentId(null);
        }
    };

    // Table Column Definitions with React.useMemo for stable reference
    const columns: DataTableColumn<IShipment>[] = useMemo(
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
                        <div className="flex items-center gap-1.5 text-[11px] text-[#7ecfc4]/70 mt-0.5">
                            <span>{s.weight} kg</span>
                            <span>•</span>
                            <span>
                                {new Date(s.createdAt).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                id: "route",
                header: "Route Corridor",
                cell: (s) => (
                    <div className="flex items-center gap-1.5 text-[#e0faf5] font-semibold text-xs min-w-0 max-w-[260px]">
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
                id: "status",
                header: "Status",
                cell: (s) => <StatusBadge status={s.status} />,
            },
            {
                id: "payment",
                header: "Payment",
                cell: (s) => <PaymentStatusBadge status={s.paymentStatus} />,
            },
            {
                id: "actions",
                header: "Actions",
                align: "right",
                cell: (s) => (
                    <div
                        className="flex items-center justify-end gap-1.5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Details Button */}
                        <button
                            type="button"
                            onClick={() => setDetailsModalShipment(s)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-xs font-bold transition-colors cursor-pointer"
                            title="View consignment details & road agent"
                        >
                            <Eye size={13} />
                            <span>Details</span>
                        </button>

                        {/* Shipment Live Chat Modal Trigger */}
                        {s.status !== "CANCELLED" && (
                            <ShipmentChatButton
                                shipmentId={s.id}
                                trackingId={s.trackingId}
                                routeTitle={`${s.origin} → ${s.destination}`}
                                counterpartyName={s.assignedAgent?.name || "Terminal Agent"}
                                counterpartyRole="Assigned Carrier Agent"
                                counterpartyPhone={s.assignedAgent?.phone || undefined}
                                counterpartyEmail={s.assignedAgent?.email || undefined}
                                variant="white"
                                label="Chat"
                                className="px-2.5 py-1.5 text-xs"
                            />
                        )}

                        {/* Pay Now Button (if unpaid) */}
                        {(s.paymentStatus === "UNPAID" || s.paymentStatus === "FAILED" || !s.paymentStatus) &&
                            s.status !== "CANCELLED" && (
                                <button
                                    type="button"
                                    onClick={() => handleOpenPayModal(s)}
                                    disabled={creatingIntentId === s.id}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#00c9a7] text-[#0a0f0f] text-xs font-black hover:bg-[#00e5c0] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                                >
                                    {creatingIntentId === s.id ? (
                                        <Loader2 size={12} className="animate-spin" />
                                    ) : (
                                        <CreditCard size={12} />
                                    )}
                                    <span>Pay</span>
                                </button>
                            )}

                        {/* Download Receipt (if paid and invoiceUrl available) */}
                        {s.paymentStatus === "PAID" && s.invoiceUrl && (
                            <a
                                href={s.invoiceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-xs font-bold transition-all shadow-xs"
                                title="Download Payment Receipt PDF"
                            >
                                <FileText size={12} />
                                <span className="hidden sm:inline">Receipt</span>
                            </a>
                        )}

                        {/* Track Link */}
                        <Link
                            href={`/dashboard/customer/tracking?trackingId=${encodeURIComponent(s.trackingId)}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#1a4a4a] bg-[#0a1a1a] text-xs font-semibold text-[#7ecfc4] hover:text-[#00e5c0] hover:border-[#00c9a7]/40 transition-all"
                            title="Track Waybill"
                        >
                            <Search size={12} />
                            <span className="hidden sm:inline">Track</span>
                        </Link>
                    </div>
                ),
            },
        ],
        [creatingIntentId]
    );

    return (
        <div className="space-y-6 pb-12">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl">
                <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30">
                        Consignment Directory
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] mt-1 tracking-tight">
                        My Booked Shipments
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Track progress, view dispatch status, and manage all your cargo deliveries.
                    </p>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                    <button
                        type="button"
                        onClick={() => fetchMyShipments(true)}
                        disabled={loading || refreshing}
                        className="p-2.5 rounded-xl border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer disabled:opacity-50"
                        title="Refresh consignments"
                    >
                        <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                    </button>
                    <Link
                        href={ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS_NEW}
                        className="px-4 py-2.5 rounded-xl bg-[#00c9a7] text-xs font-bold text-[#0a0f0f] hover:bg-[#00e5c0] transition-all flex items-center justify-center gap-1.5 shadow-md shadow-[#00c9a7]/20"
                    >
                        <PlusCircle size={15} />
                        <span>Book New Shipment</span>
                    </Link>
                </div>
            </div>

            {/* Centralized Reusable PaginatedDataTable Composite */}
            <PaginatedDataTable
                data={shipments}
                columns={columns}
                rowKey={(s) => s.id}
                onRowClick={(s) => setDetailsModalShipment(s)}
                loading={loading}
                tabs={STATUS_FILTERS}
                activeTab={statusFilter}
                onTabChange={(tab) => setStatusFilter(tab)}
                showFilterIcon
                tabsTitle="Status:"
                search={{
                    value: searchTerm,
                    onChange: setSearchTerm,
                    placeholder: "Search tracking ID, origin, destination...",
                }}
                emptyState={{
                    icon: Package,
                    title: "No shipments match criteria",
                    description:
                        searchTerm || statusFilter !== "ALL"
                            ? "Try resetting your search query or status filter."
                            : "You haven't booked any shipments yet. Create your first consignment to get started.",
                    action:
                        statusFilter !== "ALL" || searchTerm ? (
                            <button
                                type="button"
                                onClick={() => {
                                    setStatusFilter("ALL");
                                    setSearchTerm("");
                                }}
                                className="px-4 py-2 rounded-xl border border-[#1a4a4a] bg-[#0a1a1a] text-xs font-bold text-[#00e5c0] hover:bg-[#112a2a] transition-colors cursor-pointer"
                            >
                                Reset Filters
                            </button>
                        ) : (
                            <Link
                                href={ROUTES.DASHBOARD_CUSTOMER_SHIPMENTS_NEW}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00c9a7] text-[#0a0f0f] text-xs font-bold hover:bg-[#00e5c0] transition-colors"
                            >
                                <PlusCircle size={14} />
                                Book Consignment
                            </Link>
                        ),
                }}
            />

            {/* Consignment Details Modal */}
            <CustomerShipmentDetailsModal
                shipment={detailsModalShipment}
                isOpen={Boolean(detailsModalShipment)}
                onClose={() => setDetailsModalShipment(null)}
                onOpenPayModal={(s) => handleOpenPayModal(s)}
                isCreatingIntent={creatingIntentId === detailsModalShipment?.id}
            />

            {/* Stripe Checkout Modal */}
            <StripePaymentModal
                isOpen={paymentModalOpen}
                onClose={() => {
                    setPaymentModalOpen(false);
                    setActivePayShipment(null);
                    setClientSecret(null);
                }}
                onSuccess={() => {
                    void fetchMyShipments(true);
                }}
                shipment={activePayShipment}
                clientSecret={clientSecret}
                amountUSD={amountUSD}
            />
        </div>
    );
}
