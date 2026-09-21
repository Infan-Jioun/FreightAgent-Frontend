"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
    Package,
    Search,
    RefreshCw,
    PlusCircle,
    Calendar,
    Loader2,
    Filter,
    UserCheck,
    Phone,
    CreditCard,
    Eye,
    FileText,
} from "lucide-react";
import { shipmentService } from "@/app/services/shipment.service";
import { paymentService } from "@/app/services/payment.service";
import { IShipment, ShipmentStatus } from "@/app/types/shipment.types";
import { PaymentSocketPayload } from "@/app/types/socket.types";
import { StatusBadge, PaymentStatusBadge } from "@/components/ui/status-badge";
import { StripePaymentModal } from "@/components/payment/StripePaymentModal";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ROUTES } from "@/app/constants/routes";
import { toast } from "sonner";
import { AppError } from "@/app/errorHelper/appError";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useSocketEvent } from "@/app/hooks/useSocket";
import { usePaymentSocket } from "@/app/hooks/usePaymentSocket";
import { CustomerShipmentDetailsModal } from "./components/CustomerShipmentDetailsModal";

const STATUS_FILTERS: { label: string; value: ShipmentStatus | "ALL" }[] = [
    { label: "All Statuses", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Assigned", value: "ASSIGNED" },
    { label: "Accepted", value: "ACCEPTED" },
    { label: "Picked Up", value: "PICKED_UP" },
    { label: "In Transit", value: "IN_TRANSIT" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
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

            {/* Filter & Search Bar */}
            <div className="p-4 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a] flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md">
                <div className="relative flex-1 max-w-md">
                    <Search
                        size={15}
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7ecfc4]/70"
                    />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tracking ID, origin, destination..."
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#7ecfc4]/50 focus:outline-hidden focus:border-[#00c9a7] focus:ring-3 focus:ring-[#00c9a7]/20 transition-all"
                    />
                </div>

                {/* Status Filter Badges/Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
                    <span className="text-[11px] font-bold text-[#7ecfc4] uppercase mr-1 flex items-center gap-1 shrink-0">
                        <Filter size={12} />
                        Status:
                    </span>
                    {STATUS_FILTERS.map((tab) => {
                        const active = statusFilter === tab.value;
                        return (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setStatusFilter(tab.value)}
                                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                    active
                                        ? "bg-[#00c9a7] text-[#0a0f0f] shadow-xs"
                                        : "bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#e0faf5] hover:border-[#00c9a7]/40"
                                }`}
                            >
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Shipments Table */}
            <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden">
                {loading ? (
                    <div className="p-16 flex flex-col items-center justify-center gap-2.5">
                        <Loader2 className="w-7 h-7 text-[#00c9a7] animate-spin" />
                        <span className="text-xs font-semibold text-[#7ecfc4]">Fetching shipments...</span>
                    </div>
                ) : shipments.length === 0 ? (
                    <div className="p-16 text-center">
                        <Package className="w-12 h-12 mx-auto text-[#7ecfc4]/40 mb-3" />
                        <h3 className="text-sm font-bold text-[#e0faf5]">No shipments match criteria</h3>
                        <p className="text-xs text-[#7ecfc4] mt-1 max-w-sm mx-auto mb-4">
                            {searchTerm || statusFilter !== "ALL"
                                ? "Try resetting your search query or status filter."
                                : "You haven't booked any shipments yet. Create your first consignment to get started."}
                        </p>
                        {statusFilter !== "ALL" || searchTerm ? (
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
                        )}
                    </div>
                ) : (
                    <Table>
                        <TableHeader>
                            <TableRow className="border-b border-[#1a4a4a] bg-[#0a1a1a]/50 text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider">
                                <TableHead className="py-3.5 px-4">Tracking Waybill</TableHead>
                                <TableHead className="py-3.5 px-4">Route Corridor</TableHead>
                                <TableHead className="py-3.5 px-4">Status</TableHead>
                                <TableHead className="py-3.5 px-4">Payment</TableHead>
                                <TableHead className="py-3.5 px-4 text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-[#1a4a4a]/40">
                            {shipments.map((s) => (
                                <TableRow
                                    key={s.id}
                                    onClick={() => setDetailsModalShipment(s)}
                                    className="hover:bg-[#112a2a]/40 transition-colors group cursor-pointer"
                                >
                                    {/* 1. Tracking Waybill & Weight */}
                                    <TableCell className="py-3.5 px-4">
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
                                                    })}
                                                </span>
                                            </div>
                                        </div>
                                    </TableCell>

                                    {/* 2. Route Corridor */}
                                    <TableCell className="py-3.5 px-4">
                                        <div className="flex items-center gap-1.5 text-[#e0faf5] font-semibold text-xs min-w-0 max-w-[260px]">
                                            <span className="truncate" title={s.origin}>
                                                {s.origin}
                                            </span>
                                            <span className="text-[#00c9a7] shrink-0 font-bold">→</span>
                                            <span className="truncate" title={s.destination}>
                                                {s.destination}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* 3. Dispatch Status */}
                                    <TableCell className="py-3.5 px-4">
                                        <StatusBadge status={s.status} />
                                    </TableCell>

                                    {/* 4. Payment Status */}
                                    <TableCell className="py-3.5 px-4">
                                        <PaymentStatusBadge status={s.paymentStatus} />
                                    </TableCell>

                                    {/* 5. Actions */}
                                    <TableCell className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                                        <div className="flex items-center justify-end gap-1.5">
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
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>

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
