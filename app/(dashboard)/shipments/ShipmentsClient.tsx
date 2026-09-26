"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    Package,
    Search,
    Plus,
    MapPin,
    Weight,
    Truck,
    Loader2,
    RefreshCw,
    Clock,
} from "lucide-react";
import { ROUTES } from "@/app/constants/routes";
import { toast } from "sonner";
import { shipmentService } from "@/app/services/shipment.service";
import { Modal } from "@/components/ui/Modal";
import {
    IShipment,
    ShipmentStatus,
    IUpdateShipmentStatusPayload,
} from "@/app/types/shipment.types";
import { ShipmentChatButton } from "@/components/chat/ShipmentChatButton";
import { useDebounce } from "@/app/hooks/useDebounce";
import { usePermission } from "@/app/hooks/usePermission";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { AppError } from "@/app/errorHelper/appError";

const STATUS_TABS: { label: string; value: ShipmentStatus | "ALL" }[] = [
    { label: "All", value: "ALL" },
    { label: "Pending", value: "PENDING" },
    { label: "Picked Up", value: "PICKED_UP" },
    { label: "In Transit", value: "IN_TRANSIT" },
    { label: "Customs", value: "AT_CUSTOMS" },
    { label: "Out For Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
];

export default function ShipmentsClient() {
    const { can, isAgent } = usePermission();
    const canUpdateStatus = can("shipments:update_status");

    const [shipments, setShipments] = useState<IShipment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const debouncedSearch = useDebounce(searchQuery, 500);
    const [filterTab, setFilterTab] = useState<ShipmentStatus | "ALL">("ALL");

    // Modal state for quick shipment details
    const [selectedShipment, setSelectedShipment] = useState<IShipment | null>(null);

    // Modal state for status update (AGENT & ADMIN permission)
    const [statusModalShipment, setStatusModalShipment] = useState<IShipment | null>(null);
    const [newStatus, setNewStatus] = useState<ShipmentStatus>("IN_TRANSIT");
    const [statusLocation, setStatusLocation] = useState("");
    const [statusNote, setStatusNote] = useState("");
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    // Fetch consignments: AGENT sees all platform/hub shipments, CUSTOMER sees their own booked shipments
    const fetchShipments = useCallback(async () => {
        setLoading(true);
        try {
            if (canUpdateStatus) {
                // Agent & Admin: Monitor all platform/hub shipments
                const res = await shipmentService.getAllShipments({
                    status: filterTab === "ALL" ? undefined : filterTab,
                    search: debouncedSearch.trim() || undefined,
                });
                setShipments(res.shipments);
            } else {
                // Customer: Monitor user's own booked shipments
                const res = await shipmentService.getMyShipments();
                setShipments(res.shipments);
            }
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to load consignments");
        } finally {
            setLoading(false);
        }
    }, [canUpdateStatus, filterTab, debouncedSearch]);

    useEffect(() => {
        fetchShipments();
    }, [fetchShipments]);

    // Filter logic for Customer mode (client-side matching)
    const filtered = canUpdateStatus
        ? shipments
        : shipments.filter((s) => {
              const matchesFilter = filterTab === "ALL" || s.status === filterTab;
              const q = debouncedSearch.toLowerCase().trim();
              const matchesSearch =
                  !q ||
                  s.trackingId.toLowerCase().includes(q) ||
                  s.origin.toLowerCase().includes(q) ||
                  s.destination.toLowerCase().includes(q) ||
                  (s.description && s.description.toLowerCase().includes(q));
              return matchesFilter && matchesSearch;
          });

    const getBadgeStyle = (status: ShipmentStatus) => {
        switch (status) {
            case "DELIVERED":
                return "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30";
            case "IN_TRANSIT":
            case "OUT_FOR_DELIVERY":
                return "bg-[#00b4d8]/15 text-[#00b4d8] border-[#00b4d8]/30";
            case "PICKED_UP":
                return "bg-[#6366f1]/15 text-[#818cf8] border-[#6366f1]/30";
            case "AT_CUSTOMS":
                return "bg-[#ec4899]/15 text-[#f472b6] border-[#ec4899]/30";
            case "PENDING":
                return "bg-[#f59e0b]/15 text-[#fbbf24] border-[#f59e0b]/30";
            case "CANCELLED":
                return "bg-[#ff6b6b]/15 text-[#ff6b6b] border-[#ff6b6b]/30";
            default:
                return "bg-[#1a4a4a]/40 text-[#7ecfc4] border-[#1a4a4a]";
        }
    };

    // Open Status Modal for Agent/Admin
    const handleOpenStatusModal = (shipment: IShipment) => {
        setStatusModalShipment(shipment);
        setNewStatus(shipment.status);
        setStatusLocation(shipment.destination || "");
        setStatusNote("");
    };

    // Commit Status Update (PATCH /shipment/:id/status)
    const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!statusModalShipment) return;
        if (!statusLocation.trim()) {
            toast.error("Checkpoint location is required");
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

            setShipments((prev) =>
                prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s))
            );

            if (selectedShipment?.id === updated.id) {
                setSelectedShipment(updated);
            }

            setStatusModalShipment(null);
        } catch (err: unknown) {
            const error = AppError.fromAxios(err);
            toast.error(error.message || "Failed to update status checkpoint");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    return (
        <div className="space-y-6 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold text-[#e0faf5] tracking-tight">
                        {isAgent ? "Active Deliveries & Consignments" : "My Shipments & Manifests"}
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-1">
                        {isAgent
                            ? "Field Operations & Hub Registry: Monitor consignments, record checkpoint scans, and update status."
                            : "Track, monitor, and manage your booked freight consignments across the corridor network."}
                    </p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <button
                        onClick={fetchShipments}
                        disabled={loading}
                        className="px-3.5 py-2.5 rounded-full bg-[#0d1f1f] hover:bg-[#112a2a] border border-[#1a4a4a] text-xs font-bold text-[#7ecfc4] hover:text-[#00e5c0] transition-colors flex items-center gap-1.5"
                        title="Refresh List"
                    >
                        <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>

                    <PermissionGate permission="shipments:create">
                        <Link
                            href={ROUTES.SHIPMENT_CREATE}
                            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-linear-to-r from-[#00c9a7] to-[#00b4d8] text-[#0a0f0f] text-xs font-bold shadow-lg shadow-[#00c9a7]/20 hover:opacity-90 transition-all"
                        >
                            <Plus size={15} strokeWidth={2.5} />
                            <span>{isAgent ? "Book Counter Consignment" : "Book Consignment"}</span>
                        </Link>
                    </PermissionGate>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-2xl bg-[#0d1f1f] border border-[#1a4a4a]">
                {/* Status Tabs */}
                <div className="flex items-center gap-1.5 flex-wrap overflow-x-auto">
                    {STATUS_TABS.map((tab) => (
                        <button
                            key={tab.value}
                            onClick={() => setFilterTab(tab.value)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                                filterTab === tab.value
                                    ? "bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/40 shadow-xs"
                                    : "text-[#7ecfc4] hover:text-[#e0faf5] hover:bg-[#112a2a]"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <div className="flex items-center gap-2 bg-[#0a1a1a] px-3.5 py-1.5 rounded-xl border border-[#1a4a4a]">
                    <Search size={14} className="text-[#3a6b66]" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search consignments..."
                        className="bg-transparent border-none outline-hidden text-xs text-[#e0faf5] w-48"
                    />
                </div>
            </div>

            {/* Shipments Cards Grid */}
            {loading ? (
                <div className="p-16 text-center rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                    <Loader2 size={32} className="mx-auto text-[#00c9a7] animate-spin mb-3" />
                    <p className="text-xs font-semibold text-[#7ecfc4]">
                        Retrieving consignments from hub...
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map((item) => (
                        <div
                            key={item.id}
                            className="p-5 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] hover:border-[#00c9a7]/40 hover:bg-[#112a2a]/40 shadow-lg shadow-black/20 transition-all space-y-4"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div>
                                    <span className="font-mono text-sm font-bold text-[#e0faf5] tracking-tight block">
                                        {item.trackingId}
                                    </span>
                                    {item.user?.name && isAgent && (
                                        <span className="text-[10px] text-[#3a6b66]">
                                            Shipper: {item.user.name}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span
                                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getBadgeStyle(
                                            item.status
                                        )}`}
                                    >
                                        {item.status.replace(/_/g, " ")}
                                    </span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div>
                                    <span className="text-[10px] text-[#3a6b66] font-medium flex items-center gap-1">
                                        <MapPin size={11} className="text-[#00c9a7]" /> Origin
                                    </span>
                                    <p className="font-semibold text-[#e0faf5] mt-0.5 truncate">{item.origin}</p>
                                </div>

                                <div>
                                    <span className="text-[10px] text-[#3a6b66] font-medium flex items-center gap-1">
                                        <MapPin size={11} className="text-[#00b4d8]" /> Destination
                                    </span>
                                    <p className="font-semibold text-[#e0faf5] mt-0.5 truncate">{item.destination}</p>
                                </div>
                            </div>

                            {item.description && (
                                <p className="text-xs text-[#7ecfc4] line-clamp-1 italic">
                                    &ldquo;{item.description}&rdquo;
                                </p>
                            )}

                            <div className="pt-3 border-t border-[#1a4a4a]/60 flex items-center justify-between text-xs">
                                <span className="text-[#7ecfc4] flex items-center gap-1">
                                    <Weight size={12} className="text-[#00c9a7]" />
                                    <span>{item.weight} kg</span>
                                </span>

                                <div className="flex items-center gap-2">
                                    {/* Agent Status Update Button (PATCH permission) */}
                                    <PermissionGate permission="shipments:update_status">
                                        <button
                                            onClick={() => handleOpenStatusModal(item)}
                                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-[#00b4d8]/15 hover:bg-[#00b4d8]/25 text-[#00b4d8] border border-[#00b4d8]/30 text-xs font-bold transition-colors cursor-pointer"
                                            title="Update Status Checkpoint"
                                        >
                                            <RefreshCw size={11} />
                                            <span>Update Status</span>
                                        </button>
                                    </PermissionGate>

                                    <button
                                        onClick={() => setSelectedShipment(item)}
                                        className="text-xs font-semibold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                                    >
                                        Details
                                    </button>

                                    <ShipmentChatButton
                                        shipmentId={item.id}
                                        trackingId={item.trackingId}
                                        routeTitle={`${item.origin} → ${item.destination}`}
                                        variant="icon"
                                    />

                                    <Link
                                        href={`/tracking?id=${encodeURIComponent(item.trackingId)}`}
                                        className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-[#00c9a7]/15 hover:bg-[#00c9a7]/25 text-[#00e5c0] border border-[#00c9a7]/30 text-xs font-bold transition-colors"
                                    >
                                        <Truck size={12} />
                                        <span>Radar</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}

                    {filtered.length === 0 && (
                        <div className="col-span-full p-12 text-center rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a]">
                            <Package size={36} className="mx-auto text-[#3a6b66] mb-3" />
                            <p className="text-sm font-bold text-[#e0faf5]">No consignments found</p>
                            <p className="text-xs text-[#7ecfc4] mt-1">
                                {isAgent
                                    ? "No active shipments found in this status category across the hub."
                                    : "You have not booked any shipments yet or no records match your filter."}
                            </p>
                            <PermissionGate permission="shipments:create">
                                <Link
                                    href={ROUTES.SHIPMENT_CREATE}
                                    className="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-[#00c9a7] text-[#0a0f0f] text-xs font-bold hover:bg-[#00e5c0] transition-colors"
                                >
                                    <Plus size={14} />
                                    <span>{isAgent ? "Book Counter Consignment" : "Book Your First Consignment"}</span>
                                </Link>
                            </PermissionGate>
                        </div>
                    )}
                </div>
            )}

            {/* Quick Details Modal */}
            <Modal
                isOpen={!!selectedShipment}
                onClose={() => setSelectedShipment(null)}
                maxWidth="lg"
                title={
                    selectedShipment && (
                        <div>
                            <span className="text-[10px] font-mono text-[#00c9a7] uppercase tracking-wider block">
                                Consignment Detail
                            </span>
                            <span>{selectedShipment.trackingId}</span>
                        </div>
                    )
                }
            >
                {selectedShipment && (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                <span className="text-[10px] text-[#3a6b66] block">Origin</span>
                                <p className="font-bold text-[#e0faf5] mt-0.5">{selectedShipment.origin}</p>
                            </div>
                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                <span className="text-[10px] text-[#3a6b66] block">Destination</span>
                                <p className="font-bold text-[#e0faf5] mt-0.5">{selectedShipment.destination}</p>
                            </div>
                        </div>

                        <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-2 text-xs">
                            <div className="flex justify-between">
                                <span className="text-[#7ecfc4]">Weight:</span>
                                <span className="font-bold text-[#e0faf5]">{selectedShipment.weight} kg</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#7ecfc4]">Status:</span>
                                <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getBadgeStyle(
                                        selectedShipment.status
                                    )}`}
                                >
                                    {selectedShipment.status.replace(/_/g, " ")}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-[#7ecfc4]">Booked Date:</span>
                                <span className="text-[#e0faf5]">{new Date(selectedShipment.createdAt).toLocaleDateString()}</span>
                            </div>
                            {selectedShipment.estimatedDate && (
                                <div className="flex justify-between">
                                    <span className="text-[#7ecfc4]">Estimated ETA:</span>
                                    <span className="text-[#00e5c0] font-semibold">{new Date(selectedShipment.estimatedDate).toLocaleDateString()}</span>
                                </div>
                            )}
                            {selectedShipment.description && (
                                <div className="pt-2 border-t border-[#1a4a4a]">
                                    <span className="text-[10px] text-[#3a6b66] block mb-0.5">Description</span>
                                    <p className="text-xs text-[#e0faf5]">{selectedShipment.description}</p>
                                </div>
                            )}
                        </div>

                        {/* Status Checkpoints */}
                        {selectedShipment.statusLogs && selectedShipment.statusLogs.length > 0 && (
                            <div className="space-y-2">
                                <span className="text-[11px] font-bold text-[#7ecfc4] flex items-center gap-1">
                                    <Clock size={12} className="text-[#00c9a7]" /> Checkpoint History
                                </span>
                                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                                    {selectedShipment.statusLogs.map((log) => (
                                        <div key={log.id} className="p-2 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs">
                                            <div className="flex justify-between text-[10px]">
                                                <span className="font-bold text-[#00e5c0]">{log.status.replace(/_/g, " ")}</span>
                                                <span className="text-[#3a6b66]">{new Date(log.createdAt).toLocaleDateString()}</span>
                                            </div>
                                            <p className="text-[11px] text-[#7ecfc4] mt-0.5">{log.location} {log.note ? `— ${log.note}` : ""}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1a4a4a]">
                            <div className="flex items-center gap-2">
                                <ShipmentChatButton
                                    shipmentId={selectedShipment.id}
                                    trackingId={selectedShipment.trackingId}
                                    routeTitle={`${selectedShipment.origin} → ${selectedShipment.destination}`}
                                    label="Live Dispatch Chat"
                                />

                                {canUpdateStatus && (
                                    <button
                                        onClick={() => {
                                            const current = selectedShipment;
                                            setSelectedShipment(null);
                                            handleOpenStatusModal(current);
                                        }}
                                        className="px-3.5 py-2 rounded-xl bg-[#00b4d8]/15 hover:bg-[#00b4d8]/25 text-[#00b4d8] border border-[#00b4d8]/30 text-xs font-bold transition-colors cursor-pointer"
                                    >
                                        Update Status Checkpoint
                                    </button>
                                )}
                            </div>

                            <div className="flex items-center gap-2 ml-auto">
                                <button
                                    onClick={() => setSelectedShipment(null)}
                                    className="px-4 py-2 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                                >
                                    Close
                                </button>
                                <Link
                                    href={`/tracking?id=${encodeURIComponent(selectedShipment.trackingId)}`}
                                    className="px-4 py-2 rounded-xl bg-[#00c9a7] text-[#0a0f0f] text-xs font-bold hover:bg-[#00e5c0] transition-colors flex items-center gap-1.5"
                                >
                                    <Truck size={13} />
                                    <span>Live Radar</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Agent / Admin Status Update Modal */}
            <Modal
                isOpen={!!statusModalShipment}
                onClose={() => setStatusModalShipment(null)}
                maxWidth="md"
                title={
                    statusModalShipment && (
                        <div>
                            <span className="text-[10px] font-mono text-[#00c9a7] uppercase tracking-wider block">
                                Update Checkpoint
                            </span>
                            <span>{statusModalShipment.trackingId}</span>
                        </div>
                    )
                }
            >
                {statusModalShipment && (
                    <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                                Status Checkpoint
                            </label>
                            <select
                                value={newStatus}
                                onChange={(e) => setNewStatus(e.target.value as ShipmentStatus)}
                                className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-hidden focus:border-[#00c9a7]"
                            >
                                <option value="PICKED_UP">PICKED_UP (Received Package)</option>
                                <option value="IN_TRANSIT">IN_TRANSIT (Dispatched on Route)</option>
                                <option value="AT_CUSTOMS">AT_CUSTOMS (Customs Clearance)</option>
                                <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY (Courier Dispatched)</option>
                                <option value="DELIVERED">DELIVERED (Handed over to Recipient)</option>
                                <option value="CANCELLED">CANCELLED (Order Voided)</option>
                            </select>
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                                Current Checkpoint Location *
                            </label>
                            <input
                                type="text"
                                required
                                value={statusLocation}
                                onChange={(e) => setStatusLocation(e.target.value)}
                                placeholder="e.g. Dhaka Central Hub Gate 2"
                                className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] focus:outline-hidden"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-semibold text-[#7ecfc4] block mb-1">
                                Checkpoint Note / Log (Optional)
                            </label>
                            <textarea
                                rows={2}
                                value={statusNote}
                                onChange={(e) => setStatusNote(e.target.value)}
                                placeholder="e.g. Scanned at regional warehouse sorting facility"
                                className="w-full bg-[#0a1a1a] rounded-xl px-3.5 py-2 border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#3a6b66] focus:outline-hidden focus:border-[#00c9a7] resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#1a4a4a]">
                            <button
                                type="button"
                                onClick={() => setStatusModalShipment(null)}
                                className="px-4 py-2 rounded-xl bg-[#112a2a] text-xs font-bold text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isUpdatingStatus}
                                className="px-4 py-2 rounded-xl bg-[#00c9a7] hover:bg-[#00e5c0] text-xs font-bold text-[#0a0f0f] transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                            >
                                {isUpdatingStatus && <Loader2 size={13} className="animate-spin" />}
                                <span>{isUpdatingStatus ? "Updating..." : "Commit Checkpoint"}</span>
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
