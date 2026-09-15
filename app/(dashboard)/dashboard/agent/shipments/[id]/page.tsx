"use client";

import { useEffect, useState, useCallback, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Truck,
    Package,
    MapPin,
    User,
    Weight,
    Calendar,
    FileText,
    CheckCircle2,
    Clock,
    Send,
    Loader2,
    CheckSquare,
    AlertCircle,
    UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import { shipmentService } from "@/app/services/shipment.service";
import { agentService } from "@/app/services/agent.service";
import { IShipment, ShipmentStatus, IStatusLog } from "@/app/types/shipment.types";
import { AgentAllowedStatus } from "@/app/types/agent.types";
import { StatusBadge } from "@/components/ui/status-badge";
import { Select } from "@/components/ui/select";
import { ROUTES } from "@/app/constants/routes";
import { AppError } from "@/app/errorHelper/appError";
import { useSocketEvent } from "@/app/hooks/useSocket";

const ALLOWED_AGENT_STATUSES: { label: string; value: AgentAllowedStatus }[] = [
    { label: "ACCEPTED - Carrier Accepted Cargo", value: "ACCEPTED" },
    { label: "PICKED_UP - Cargo Picked Up from Shipper", value: "PICKED_UP" },
    { label: "IN_TRANSIT - Cargo in Active Transit", value: "IN_TRANSIT" },
    { label: "DELIVERED - Consignment Delivered to Consignee", value: "DELIVERED" },
];

export default function AgentShipmentDetailPage({
    params,
}: {
    params: Promise<{ id: string }> | { id: string };
}) {
    const resolvedParams =
        params && typeof (params as unknown as Promise<{ id: string }>).then === "function"
            ? use(params as Promise<{ id: string }>)
            : (params as { id: string });
    const shipmentId = resolvedParams.id;
    const router = useRouter();

    const [shipment, setShipment] = useState<IShipment | null>(null);
    const [loading, setLoading] = useState(true);

    // Accept State
    const [accepting, setAccepting] = useState(false);

    // Update Form State
    const [selectedStatus, setSelectedStatus] = useState<AgentAllowedStatus>("ACCEPTED");
    const [location, setLocation] = useState("");
    const [note, setNote] = useState("");
    const [updating, setUpdating] = useState(false);

    const loadShipment = useCallback(async () => {
        setLoading(true);
        try {
            const data = await shipmentService.getShipmentById(shipmentId);
            setShipment(data);

            // Default selected status to next logical step
            if (data.status === "ASSIGNED") setSelectedStatus("ACCEPTED");
            else if (data.status === "ACCEPTED") setSelectedStatus("PICKED_UP");
            else if (data.status === "PICKED_UP") setSelectedStatus("IN_TRANSIT");
            else if (data.status === "IN_TRANSIT") setSelectedStatus("DELIVERED");
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to load shipment details");
        } finally {
            setLoading(false);
        }
    }, [shipmentId]);

    // Live Socket listener for status updates
    useSocketEvent("shipment_status_updated", (data: unknown) => {
        const record = data as { trackingId?: string };
        if (shipment && record?.trackingId === shipment.trackingId) {
            void loadShipment();
        }
    });

    useEffect(() => {
        loadShipment();
    }, [loadShipment]);

    // Handle Accept Shipment (PATCH /api/v1/agent/shipments/:id/accept)
    const handleAcceptShipment = async () => {
        setAccepting(true);
        try {
            const updated = await agentService.acceptShipment(shipmentId, {
                location: shipment?.origin || undefined,
                note: "Cargo accepted by carrier road agent",
            });

            toast.success("Shipment accepted! Status changed to ACCEPTED");
            setShipment((prev) => (prev ? { ...prev, ...updated, status: "ACCEPTED" } : updated));
            setSelectedStatus("PICKED_UP");
            void loadShipment();
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to accept shipment");
        } finally {
            setAccepting(false);
        }
    };

    // Handle Update Status (PATCH /api/v1/agent/shipments/:id/status)
    const handleUpdateStatus = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!location.trim()) {
            toast.error("Location is required", {
                description: "Please specify the current checkpoint facility or city location.",
            });
            return;
        }

        setUpdating(true);
        try {
            const updated = await agentService.updateShipmentStatus(shipmentId, {
                status: selectedStatus,
                location: location.trim(),
                note: note.trim() || undefined,
            });

            toast.success("Shipment Status Updated!", {
                description: `Milestone logged: ${selectedStatus.replace(/_/g, " ")} at ${location}`,
            });

            setShipment((prev) => (prev ? { ...prev, ...updated, status: selectedStatus } : updated));
            setLocation("");
            setNote("");

            void loadShipment();
        } catch (err: unknown) {
            const appErr = AppError.fromAxios(err);
            toast.error(appErr.message || "Failed to update transit status");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="p-16 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[#00c9a7] animate-spin" />
                <span className="text-xs font-semibold text-[#7ecfc4]">
                    Loading consignment dossier...
                </span>
            </div>
        );
    }

    if (!shipment) {
        return (
            <div className="p-16 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] text-center space-y-4">
                <Package className="w-12 h-12 mx-auto text-rose-400" />
                <h2 className="text-base font-bold text-[#e0faf5]">Shipment Not Found</h2>
                <p className="text-xs text-[#7ecfc4]">
                    The requested consignment may have been removed or assigned to another carrier terminal.
                </p>
                <Link
                    href={ROUTES.DASHBOARD_AGENT_SHIPMENTS}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#00c9a7] text-xs font-bold text-[#0a0f0f]"
                >
                    <ArrowLeft size={14} />
                    Back to Assigned Shipments
                </Link>
            </div>
        );
    }

    const statusLogs: IStatusLog[] = shipment.statusLogs || [];

    return (
        <div className="max-w-4xl mx-auto space-y-6 pb-12">
            {/* Back link */}
            <div className="flex items-center justify-between">
                <Link
                    href={ROUTES.DASHBOARD_AGENT_SHIPMENTS}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7ecfc4] hover:text-[#00e5c0] transition-colors"
                >
                    <ArrowLeft size={14} />
                    <span>Back to Assigned Deliveries</span>
                </Link>
            </div>

            {/* Header Card */}
            <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#f59e0b]/15 text-[#f59e0b] border border-[#f59e0b]/30">
                        Dispatch Management
                    </span>
                    <h1 className="text-xl sm:text-2xl font-black text-[#e0faf5] mt-1 tracking-tight">
                        Consignment #{shipment.trackingId}
                    </h1>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Manage transit milestones and update checkpoint status for this freight assignment.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-[#7ecfc4]">Current Status:</span>
                    <StatusBadge status={shipment.status} />
                </div>
            </div>

            {/* ACTION BANNER: ACCEPT SHIPMENT (When Status is ASSIGNED) */}
            {shipment.status === "ASSIGNED" && (
                <div className="p-5 rounded-3xl bg-linear-to-r from-amber-500/15 via-emerald-500/15 to-transparent border border-amber-500/40 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <AlertCircle size={16} className="text-amber-400" />
                            <h3 className="text-sm font-black text-[#e0faf5]">
                                Action Required: Accept This Consignment
                            </h3>
                        </div>
                        <p className="text-xs text-[#7ecfc4]">
                            This consignment has been dispatched to your terminal. Click Accept to confirm receipt before posting transit updates.
                        </p>
                    </div>

                    <button
                        onClick={handleAcceptShipment}
                        disabled={accepting}
                        className="px-5 py-2.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-[#0a0f0f] text-xs font-extrabold transition-all flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0 cursor-pointer disabled:opacity-50"
                    >
                        {accepting ? <Loader2 size={15} className="animate-spin" /> : <CheckSquare size={15} />}
                        <span>{accepting ? "Accepting Cargo..." : "Accept Shipment"}</span>
                    </button>
                </div>
            )}

            {/* Consignment Details Card */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl space-y-5">
                <h2 className="text-sm font-bold text-[#e0faf5] uppercase tracking-wider">
                    Consignment Overview
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                        <span className="text-[11px] text-[#7ecfc4] flex items-center gap-1">
                            <MapPin size={12} className="text-[#00c9a7]" />
                            Origin
                        </span>
                        <p className="text-xs font-bold text-[#e0faf5] mt-1">{shipment.origin}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                        <span className="text-[11px] text-[#7ecfc4] flex items-center gap-1">
                            <MapPin size={12} className="text-orange-400" />
                            Destination
                        </span>
                        <p className="text-xs font-bold text-[#e0faf5] mt-1">{shipment.destination}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                        <span className="text-[11px] text-[#7ecfc4] flex items-center gap-1">
                            <Weight size={12} className="text-[#00c9a7]" />
                            Gross Weight
                        </span>
                        <p className="text-xs font-bold text-[#00e5c0] mt-1">{shipment.weight} kg</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                        <span className="text-[11px] text-[#7ecfc4] flex items-center gap-1">
                            <User size={12} className="text-[#00c9a7]" />
                            Customer / Merchant
                        </span>
                        <p className="text-xs font-bold text-[#e0faf5] mt-1">
                            {shipment.user?.name || "Merchant"}
                        </p>
                        {shipment.user?.phone && (
                            <p className="text-[10px] text-[#7ecfc4]">{shipment.user.phone}</p>
                        )}
                    </div>
                </div>

                {/* Who Assigned Info */}
                {shipment.assignedBy && (
                    <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center justify-between text-xs">
                        <span className="text-[#7ecfc4] flex items-center gap-1.5">
                            <UserCheck size={13} className="text-[#00c9a7]" />
                            <span>Assigned by Administrator:</span>
                        </span>
                        <span className="font-bold text-[#e0faf5]">
                            {shipment.assignedBy.name} ({shipment.assignedBy.email})
                        </span>
                    </div>
                )}

                {shipment.description && (
                    <div className="p-3.5 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#7ecfc4]">
                        <span className="font-bold text-[#e0faf5] mr-1.5">Cargo Description:</span>
                        {shipment.description}
                    </div>
                )}
            </div>

            {/* Status Update Form Card (PATCH /api/v1/agent/shipments/:id/status) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1f1f] border border-[#00c9a7]/30 shadow-xl space-y-5 relative overflow-hidden">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00c9a7]">
                        <Truck size={20} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-[#e0faf5]">Update Transit Status</h2>
                        <p className="text-xs text-[#7ecfc4]">
                            Transmit next milestone update to customer & dispatch control
                        </p>
                    </div>
                </div>

                <form onSubmit={handleUpdateStatus} className="space-y-4">
                    {/* Status Dropdown */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#e0faf5]">
                            Milestone Status <span className="text-[#f43f5e]">*</span>
                        </label>
                        <Select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value as AgentAllowedStatus)}
                            className="text-xs"
                        >
                            {ALLOWED_AGENT_STATUSES.map((opt) => (
                                <option key={opt.value} value={opt.value} className="bg-[#0d1f1f] text-white">
                                    {opt.label}
                                </option>
                            ))}
                        </Select>
                    </div>

                    {/* Location Field (Required) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                            <MapPin size={13} className="text-[#00c9a7]" />
                            Current Location / Facility <span className="text-[#f43f5e]">*</span>
                        </label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            placeholder="e.g. Banani Hub, Dhaka / Highway Checkpoint 3..."
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#7ecfc4]/40 focus:outline-hidden focus:border-[#00c9a7] focus:ring-3 focus:ring-[#00c9a7]/20 transition-all"
                            required
                        />
                    </div>

                    {/* Note Field (Optional) */}
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#e0faf5] flex items-center gap-1.5">
                            <FileText size={13} className="text-[#00c9a7]" />
                            Transit Remarks & Checkpoint Notes
                        </label>
                        <textarea
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. Package picked from sender, in transit to main hub."
                            className="w-full px-4 py-2.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs text-[#e0faf5] placeholder:text-[#7ecfc4]/40 focus:outline-hidden focus:border-[#00c9a7] focus:ring-3 focus:ring-[#00c9a7]/20 transition-all resize-none"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={updating || !location.trim()}
                            className="px-6 py-2.5 rounded-xl bg-[#00c9a7] text-xs font-bold text-[#0a0f0f] hover:bg-[#00e5c0] transition-all flex items-center gap-2 shadow-lg shadow-[#00c9a7]/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                            {updating ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    <span>Transmitting Status...</span>
                                </>
                            ) : (
                                <>
                                    <Send size={14} />
                                    <span>Transmit Checkpoint Update</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Checkpoint Logs Timeline with Audit Trail */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-[#e0faf5]">Milestone History</h2>
                    <span className="text-xs font-semibold text-[#7ecfc4] bg-[#0a1a1a] px-3 py-1 rounded-full border border-[#1a4a4a]">
                        {statusLogs.length} milestone{statusLogs.length === 1 ? "" : "s"}
                    </span>
                </div>

                {statusLogs.length === 0 ? (
                    <div className="p-8 text-center bg-[#0a1a1a] rounded-2xl border border-[#1a4a4a]">
                        <Clock className="w-8 h-8 mx-auto text-[#7ecfc4]/40 mb-2" />
                        <p className="text-xs font-semibold text-[#e0faf5]">No checkpoint logs yet</p>
                    </div>
                ) : (
                    <div className="relative pl-6 sm:pl-8 border-l-2 border-[#1a4a4a] space-y-6 my-2">
                        {statusLogs.map((log, idx) => (
                            <div key={log.id || idx} className="relative">
                                <div className="absolute -left-[31px] sm:-left-[39px] top-1 w-4 h-4 rounded-full border-2 border-[#00c9a7] bg-[#0d1f1f]" />
                                <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] space-y-1.5">
                                    <div className="flex items-center justify-between gap-2">
                                        <StatusBadge status={log.status} />
                                        <span className="text-[11px] text-[#7ecfc4]/80 font-mono">
                                            {new Date(log.createdAt).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="text-xs text-[#e0faf5] font-medium flex items-center gap-1.5">
                                        <MapPin size={12} className="text-[#00c9a7]" />
                                        <span>{log.location}</span>
                                    </div>
                                    {log.note && (
                                        <p className="text-xs text-[#7ecfc4] bg-[#0d1f1f] p-2.5 rounded-lg border border-[#1a4a4a]/60">
                                            {log.note}
                                        </p>
                                    )}
                                    {/* Audit Trail */}
                                    <p className="text-[10px] text-[#3a6b66] pt-1 border-t border-[#1a4a4a]/40 flex items-center gap-1">
                                        <span>Logged by:</span>
                                        <span className="text-[#7ecfc4] font-semibold">
                                            {log.updatedByUser
                                                ? `${log.updatedByUser.name} (${log.updatedByUser.role})`
                                                : "System"}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
