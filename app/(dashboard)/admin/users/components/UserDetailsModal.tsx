"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Mail,
    CheckCircle2,
    AlertCircle,
    Phone,
    MapPin,
    Calendar,
    Clock,
    Package,
    AlertTriangle,
    Shield,
    Loader2,
} from "lucide-react";
import { IAdminUser, IAdminUserDetail } from "@/app/types/admin.types";
import { adminService } from "@/app/services/admin.service";

interface UserDetailsModalProps {
    isOpen: boolean;
    user: IAdminUser | null;
    currentAdminId?: string;
    onClose: () => void;
    onChangeRoleClick: (user: IAdminUser) => void;
    onToggleStatusClick?: (user: IAdminUser) => void;
}

export default function UserDetailsModal({
    isOpen,
    user,
    currentAdminId,
    onClose,
    onChangeRoleClick,
    onToggleStatusClick,
}: UserDetailsModalProps) {
    const [detailedUser, setDetailedUser] = useState<IAdminUserDetail | null>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        if (isOpen && user?.id) {
            let isMounted = true;
            setLoadingDetails(true);

            adminService
                .getUserById(user.id)
                .then((data) => {
                    if (isMounted && data) {
                        const raw = data as unknown as Record<string, unknown>;
                        const userEntity =
                            raw.user && typeof raw.user === "object"
                                ? (raw.user as Record<string, unknown>)
                                : raw;
                        const shipments =
                            raw.shipments && Array.isArray(raw.shipments)
                                ? raw.shipments
                                : userEntity.shipments && Array.isArray(userEntity.shipments)
                                ? userEntity.shipments
                                : [];

                        setDetailedUser({
                            ...user,
                            ...userEntity,
                            id: (userEntity.id || userEntity._id || user.id) as string,
                            shipments: shipments as IAdminUserDetail["shipments"],
                        });
                    }
                })
                .catch(() => {
                    // Fallback to basic user data on failure
                    if (isMounted) setDetailedUser(user as IAdminUserDetail);
                })
                .finally(() => {
                    if (isMounted) setLoadingDetails(false);
                });

            return () => {
                isMounted = false;
            };
        } else {
            setDetailedUser(null);
        }
    }, [isOpen, user]);

    if (!isOpen || !user) return null;

    const displayUser: IAdminUserDetail = detailedUser || user;
    const isSelf = currentAdminId && user.id ? user.id.trim() === currentAdminId.trim() : false;
    const isBlocked = Boolean(displayUser.isBlocked || displayUser.status === "SUSPENDED");

    const userName = displayUser.name || user.name || "User";
    const initials =
        userName
            .split(" ")
            .filter(Boolean)
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "U";

    const getRoleBadge = (role: IAdminUser["role"]) => {
        switch (role) {
            case "ADMIN":
                return "bg-[#a855f7]/15 text-[#c084fc] border-[#a855f7]/30";
            case "AGENT":
                return "bg-[#0284c7]/15 text-[#38bdf8] border-[#0284c7]/30";
            default:
                return "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30";
        }
    };

    const getShipmentStatusBadge = (status: string) => {
        const s = status.toUpperCase();
        if (s.includes("DELIVERED") || s.includes("COMPLETED")) {
            return "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30";
        }
        if (s.includes("CANCEL") || s.includes("FAILED")) {
            return "bg-[#e11d48]/15 text-[#f43f5e] border-[#e11d48]/30";
        }
        if (s.includes("TRANSIT") || s.includes("IN_PROGRESS")) {
            return "bg-[#0284c7]/15 text-[#38bdf8] border-[#0284c7]/30";
        }
        return "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/30";
    };

    const formatDateTime = (dateStr?: string | null): string => {
        if (!dateStr) return "Never";
        try {
            const date = new Date(dateStr);
            return isNaN(date.getTime())
                ? "Never"
                : date.toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                  });
        } catch {
            return "Never";
        }
    };

    const shipments = displayUser.shipments ?? [];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="w-full max-w-2xl rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] p-6 shadow-2xl shadow-black relative max-h-[90vh] flex flex-col"
                >
                    {/* Close Button */}
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-5 right-5 text-[#7ecfc4] hover:text-[#e0faf5] transition-colors cursor-pointer"
                        title="Close details"
                    >
                        <X size={18} />
                    </button>

                    {/* Header */}
                    <div className="flex items-center gap-3.5 mb-5 shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#00c9a7]/30 to-[#00b4d8]/30 border border-[#00c9a7]/40 flex items-center justify-center font-black text-sm text-[#00e5c0] shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-[#e0faf5] truncate">
                                    {displayUser.name}
                                </h3>
                                {isSelf && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30">
                                        You
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-[#7ecfc4] truncate">{displayUser.email}</p>
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto pr-1 space-y-4 flex-1">
                        {/* Suspension Alert Callout */}
                        {isBlocked && (
                            <div className="p-3.5 rounded-2xl bg-[#e11d48]/10 border border-[#e11d48]/30 text-xs text-[#f43f5e] space-y-1">
                                <div className="flex items-center gap-2 font-bold">
                                    <AlertTriangle size={15} />
                                    <span>Account is Currently Suspended / Blocked</span>
                                </div>
                                {displayUser.blockedReason && (
                                    <p className="text-[#f43f5e]/90 text-[11px] pl-6">
                                        <strong>Reason:</strong> {displayUser.blockedReason}
                                    </p>
                                )}
                                {displayUser.blockedAt && (
                                    <p className="text-[#f43f5e]/70 text-[10px] pl-6">
                                        Suspended on: {formatDateTime(displayUser.blockedAt)}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Account Details Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                    Role
                                </span>
                                <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(
                                        displayUser.role
                                    )} inline-block`}
                                >
                                    {displayUser.role}
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                    Status
                                </span>
                                <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border inline-flex items-center gap-1 ${
                                        isBlocked
                                            ? "bg-[#e11d48]/15 text-[#f43f5e] border-[#e11d48]/30"
                                            : "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30"
                                    }`}
                                >
                                    {isBlocked ? "Suspended" : "Active"}
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                    Verification
                                </span>
                                <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                        displayUser.emailVerified
                                            ? "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/40"
                                            : "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40"
                                    } inline-flex items-center gap-1`}
                                >
                                    {displayUser.emailVerified ? (
                                        <CheckCircle2 size={10} />
                                    ) : (
                                        <AlertCircle size={10} />
                                    )}
                                    <span>{displayUser.emailVerified ? "Verified" : "Unverified"}</span>
                                </span>
                            </div>

                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                    User ID
                                </span>
                                <span className="text-xs font-mono text-[#e0faf5] truncate block">
                                    {(displayUser.id || user.id || "").length > 10
                                        ? `${(displayUser.id || user.id).slice(0, 10)}...`
                                        : displayUser.id || user.id || "—"}
                                </span>
                            </div>
                        </div>

                        {/* Contact & Activity Info */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center gap-2.5">
                                <Phone size={16} className="text-[#00c9a7] shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[10px] text-[#7ecfc4]/70 block">Phone</span>
                                    <span className="text-xs font-medium text-[#e0faf5] truncate block">
                                        {displayUser.phone || "Not provided"}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center gap-2.5">
                                <MapPin size={16} className="text-[#00c9a7] shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[10px] text-[#7ecfc4]/70 block">Address</span>
                                    <span className="text-xs font-medium text-[#e0faf5] truncate block">
                                        {displayUser.address || "Not specified"}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center gap-2.5">
                                <Calendar size={16} className="text-[#00c9a7] shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[10px] text-[#7ecfc4]/70 block">Member Since</span>
                                    <span className="text-xs font-medium text-[#e0faf5] truncate block">
                                        {displayUser.createdAt
                                            ? new Date(displayUser.createdAt).toLocaleDateString()
                                            : "N/A"}
                                    </span>
                                </div>
                            </div>

                            <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center gap-2.5">
                                <Clock size={16} className="text-[#00c9a7] shrink-0" />
                                <div className="min-w-0">
                                    <span className="text-[10px] text-[#7ecfc4]/70 block">Last Login</span>
                                    <span className="text-xs font-medium text-[#e0faf5] truncate block">
                                        {formatDateTime(displayUser.lastLoginAt)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Recent Shipments Section */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Package size={14} className="text-[#00c9a7]" />
                                    <span className="text-xs font-bold text-[#e0faf5]">
                                        Recent Shipments (Latest 10)
                                    </span>
                                </div>
                                {loadingDetails && (
                                    <Loader2 size={13} className="animate-spin text-[#00c9a7]" />
                                )}
                            </div>

                            <div className="rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] overflow-hidden">
                                {loadingDetails ? (
                                    <div className="p-4 text-center text-xs text-[#7ecfc4] flex items-center justify-center gap-2">
                                        <Loader2 size={14} className="animate-spin text-[#00c9a7]" />
                                        <span>Loading shipment records...</span>
                                    </div>
                                ) : shipments.length === 0 ? (
                                    <div className="p-6 text-center text-xs text-[#7ecfc4]/70">
                                        No recent shipments found for this account.
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left text-xs">
                                            <thead>
                                                <tr className="border-b border-[#1a4a4a] bg-[#081414] text-[10px] font-bold text-[#3a6b66] uppercase">
                                                    <th className="py-2 px-3">Tracking ID</th>
                                                    <th className="py-2 px-3">Origin & Destination</th>
                                                    <th className="py-2 px-3">Status</th>
                                                    <th className="py-2 px-3 text-right">Date</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#1a4a4a]/40">
                                                {shipments.map((s ) => (
                                                    <tr key={s.id} className="hover:bg-[#112a2a]/30">
                                                        <td className="py-2 px-3 font-mono text-[11px] text-[#00e5c0]">
                                                            {s.trackingId || (s.id ? s.id.slice(0, 8) : "N/A")}
                                                        </td>
                                                        <td className="py-2 px-3 text-[#e0faf5]">
                                                            <span className="font-semibold">{s.origin}</span>
                                                            <span className="text-[#7ecfc4]/70 mx-1.5">→</span>
                                                            <span className="font-semibold">{s.destination}</span>
                                                        </td>
                                                        <td className="py-2 px-3">
                                                            <span
                                                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getShipmentStatusBadge(
                                                                    s.status
                                                                )}`}
                                                            >
                                                                {s.status}
                                                            </span>
                                                        </td>
                                                        <td className="py-2 px-3 text-right text-[#7ecfc4]/80 text-[11px]">
                                                            {s.createdAt
                                                                ? new Date(s.createdAt).toLocaleDateString()
                                                                : "—"}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 mt-3 border-t border-[#1a4a4a] shrink-0">
                        <a
                            href={`mailto:${displayUser.email}`}
                            className="text-xs text-[#00c9a7] hover:underline flex items-center gap-1.5"
                        >
                            <Mail size={13} />
                            <span>Contact via Email</span>
                        </a>

                        <div className="flex items-center gap-2">
                            {/* Change Role Button */}
                            <button
                                type="button"
                                onClick={() => {
                                    onChangeRoleClick(displayUser);
                                    onClose();
                                }}
                                disabled={isSelf}
                                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                    isSelf
                                        ? "opacity-30 cursor-not-allowed text-[#7ecfc4] border-[#1a4a4a]"
                                        : "border-[#f59e0b]/40 bg-[#f59e0b]/10 hover:bg-[#f59e0b]/20 text-[#f59e0b] cursor-pointer"
                                }`}
                                title={isSelf ? "Cannot change own role" : "Change Role"}
                            >
                                <Shield size={12} />
                                <span>Change Role</span>
                            </button>

                            {/* Suspend / Reactivate Button */}
                            {onToggleStatusClick && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onToggleStatusClick(displayUser);
                                        onClose();
                                    }}
                                    disabled={isSelf}
                                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors flex items-center gap-1.5 ${
                                        isSelf
                                            ? "opacity-30 cursor-not-allowed text-[#7ecfc4] border-[#1a4a4a]"
                                            : isBlocked
                                            ? "border-[#00c9a7]/40 bg-[#00c9a7]/10 hover:bg-[#00c9a7]/20 text-[#00e5c0] cursor-pointer"
                                            : "border-[#e11d48]/40 bg-[#e11d48]/10 hover:bg-[#e11d48]/20 text-[#f43f5e] cursor-pointer"
                                    }`}
                                    title={isSelf ? "Cannot suspend own account" : isBlocked ? "Reactivate" : "Suspend"}
                                >
                                    <span>{isBlocked ? "Reactivate" : "Suspend"}</span>
                                </button>
                            )}

                            {/* Close Button */}
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3.5 py-1.5 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a] text-xs font-bold text-[#e0faf5] hover:bg-[#112a2a] transition-colors cursor-pointer"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
