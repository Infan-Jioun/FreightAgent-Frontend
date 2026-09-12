"use client";

import {
    Users,
    CheckCircle2,
    AlertCircle,
    Eye,
    Shield,
    Trash2,
    UserX,
    UserCheck,
    ChevronLeft,
    ChevronRight,
    Edit3,
} from "lucide-react";
import { IAdminUser } from "@/app/types/admin.types";

interface UsersTableProps {
    users: IAdminUser[];
    loading: boolean;
    currentAdminId?: string;
    currentPage: number;
    totalPages: number;
    totalCount: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onViewDetails: (user: IAdminUser) => void;
    onChangeRole: (user: IAdminUser) => void;
    onToggleStatus: (user: IAdminUser) => void;
    onDelete: (user: IAdminUser) => void;
}

export default function UsersTable({
    users,
    loading,
    currentAdminId,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    onPageChange,
    onViewDetails,
    onChangeRole,
    onToggleStatus,
    onDelete,
}: UsersTableProps) {
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

    const isUserBlocked = (user: IAdminUser): boolean => {
        return Boolean(user.isBlocked || user.status === "SUSPENDED");
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

    return (
        <div className="rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                    <thead>
                        <tr className="border-b border-[#1a4a4a] bg-[#0a1a1a]/50 text-[10px] font-bold text-[#3a6b66] uppercase tracking-wider">
                            <th className="py-3.5 px-4">User</th>
                            <th className="py-3.5 px-4">Role</th>
                            <th className="py-3.5 px-4">Status</th>
                            <th className="py-3.5 px-4">Email Verified</th>
                            <th className="py-3.5 px-4">Last Login</th>
                            <th className="py-3.5 px-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1a4a4a]/40">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="py-3.5 px-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-[#1a4a4a]/40" />
                                            <div className="space-y-1.5">
                                                <div className="w-28 h-3.5 rounded-sm bg-[#1a4a4a]/40" />
                                                <div className="w-40 h-3 rounded-sm bg-[#1a4a4a]/20" />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="w-16 h-5 rounded-full bg-[#1a4a4a]/30" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="w-16 h-5 rounded-full bg-[#1a4a4a]/30" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="w-20 h-5 rounded-full bg-[#1a4a4a]/30" />
                                    </td>
                                    <td className="py-3.5 px-4">
                                        <div className="w-24 h-3.5 rounded-sm bg-[#1a4a4a]/30" />
                                    </td>
                                    <td className="py-3.5 px-4 text-right">
                                        <div className="w-28 h-7 rounded-lg bg-[#1a4a4a]/30 ml-auto" />
                                    </td>
                                </tr>
                            ))
                        ) : users.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="py-12 text-center">
                                    <Users size={36} className="mx-auto text-[#3a6b66] mb-2" />
                                    <p className="text-xs font-bold text-[#e0faf5]">No users found</p>
                                    <p className="text-[11px] text-[#7ecfc4]/70 mt-0.5">
                                        Try adjusting your search query, role, or status filter.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            users.map((u) => {
                                const initials = (u.name || "U")
                                    .split(" ")
                                    .map((w) => w[0])
                                    .join("")
                                    .toUpperCase()
                                    .slice(0, 2);

                                const isSelf = currentAdminId ? u.id.trim() === currentAdminId.trim() : false;
                                const blocked = isUserBlocked(u);

                                return (
                                    <tr
                                        key={u.id}
                                        className="hover:bg-[#112a2a]/40 transition-colors group"
                                    >
                                        {/* User Name & Email */}
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-linear-to-tr from-[#00c9a7]/20 to-[#00b4d8]/20 border border-[#00c9a7]/40 flex items-center justify-center font-bold text-[11px] text-[#00e5c0] shrink-0">
                                                    {initials}
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-bold text-[#e0faf5] truncate">
                                                            {u.name}
                                                        </span>
                                                        {isSelf && (
                                                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30">
                                                                You
                                                            </span>
                                                        )}
                                                    </div>
                                                    <span className="text-[11px] text-[#7ecfc4]/70 truncate block">
                                                        {u.email}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Role with Quick-Edit Button */}
                                        <td className="py-3 px-4">
                                            <button
                                                type="button"
                                                onClick={() => !isSelf && onChangeRole(u)}
                                                disabled={isSelf}
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadge(
                                                    u.role
                                                )} ${
                                                    isSelf
                                                        ? "cursor-default opacity-80"
                                                        : "hover:opacity-80 transition-opacity cursor-pointer"
                                                } flex items-center gap-1`}
                                                title={isSelf ? "Cannot change your own role" : "Click to change role"}
                                            >
                                                <span>{u.role}</span>
                                                {!isSelf && <Edit3 size={10} />}
                                            </button>
                                        </td>

                                        {/* Status Badge */}
                                        <td className="py-3 px-4">
                                            {blocked ? (
                                                <span
                                                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#e11d48]/15 text-[#f43f5e] border-[#e11d48]/30 inline-flex items-center gap-1 cursor-help"
                                                    title={u.blockedReason ? `Suspended: ${u.blockedReason}` : "Account Suspended"}
                                                >
                                                    <UserX size={10} />
                                                    <span>SUSPENDED</span>
                                                </span>
                                            ) : (
                                                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30 inline-flex items-center gap-1">
                                                    <CheckCircle2 size={10} />
                                                    <span>ACTIVE</span>
                                                </span>
                                            )}
                                        </td>

                                        {/* Email Verified */}
                                        <td className="py-3 px-4">
                                            <span
                                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                                    u.emailVerified
                                                        ? "bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/40"
                                                        : "bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/40"
                                                } inline-flex items-center gap-1`}
                                            >
                                                {u.emailVerified ? (
                                                    <CheckCircle2 size={11} />
                                                ) : (
                                                    <AlertCircle size={11} />
                                                )}
                                                <span>{u.emailVerified ? "Verified" : "Unverified"}</span>
                                            </span>
                                        </td>

                                        {/* Last Login Date / Time */}
                                        <td className="py-3 px-4 text-[#7ecfc4]">
                                            {formatDateTime(u.lastLoginAt || u.createdAt)}
                                        </td>

                                        {/* Action Buttons */}
                                        <td className="py-3 px-4 text-right">
                                            <div className="flex items-center justify-end gap-1.5">
                                                {/* View Details */}
                                                <button
                                                    type="button"
                                                    onClick={() => onViewDetails(u)}
                                                    className="p-1.5 rounded-lg bg-[#0a1a1a] border border-[#1a4a4a] text-[#7ecfc4] hover:text-[#00e5c0] hover:border-[#00c9a7]/40 transition-colors cursor-pointer"
                                                    title="View full profile & shipments"
                                                >
                                                    <Eye size={13} />
                                                </button>

                                                {/* Change Role Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => onChangeRole(u)}
                                                    disabled={isSelf}
                                                    className={`p-1.5 rounded-lg border transition-colors ${
                                                        isSelf
                                                            ? "opacity-30 cursor-not-allowed text-[#7ecfc4] border-[#1a4a4a] bg-[#0a1a1a]"
                                                            : "bg-[#0a1a1a] border-[#1a4a4a] text-[#f59e0b] hover:border-[#f59e0b]/40 hover:bg-[#f59e0b]/10 cursor-pointer"
                                                    }`}
                                                    title={isSelf ? "Cannot change own role" : "Change user role"}
                                                >
                                                    <Shield size={13} />
                                                </button>

                                                {/* Suspend / Reactivate Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => onToggleStatus(u)}
                                                    disabled={isSelf}
                                                    className={`p-1.5 rounded-lg border transition-colors ${
                                                        isSelf
                                                            ? "opacity-30 cursor-not-allowed text-[#7ecfc4] border-[#1a4a4a] bg-[#0a1a1a]"
                                                            : blocked
                                                            ? "bg-[#0a1a1a] border-[#00c9a7]/30 text-[#00e5c0] hover:bg-[#00c9a7]/10 cursor-pointer"
                                                            : "bg-[#0a1a1a] border-[#e11d48]/30 text-[#f43f5e] hover:bg-[#e11d48]/10 cursor-pointer"
                                                    }`}
                                                    title={
                                                        isSelf
                                                            ? "Cannot suspend own account"
                                                            : blocked
                                                            ? "Reactivate user account"
                                                            : "Suspend / block user"
                                                    }
                                                >
                                                    {blocked ? <UserCheck size={13} /> : <UserX size={13} />}
                                                </button>

                                                {/* Delete Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => onDelete(u)}
                                                    disabled={isSelf}
                                                    className={`p-1.5 rounded-lg border transition-colors ${
                                                        isSelf
                                                            ? "opacity-30 cursor-not-allowed text-[#7ecfc4] border-[#1a4a4a] bg-[#0a1a1a]"
                                                            : "bg-[#0a1a1a] text-[#ff6b6b] border-[#ff6b6b]/30 hover:bg-[#ff6b6b]/10 cursor-pointer"
                                                    }`}
                                                    title={isSelf ? "Cannot delete own account" : "Delete user permanently"}
                                                >
                                                    <Trash2 size={13} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Controls */}
            {!loading && totalCount > 0 && (
                <div className="p-3.5 border-t border-[#1a4a4a] bg-[#0a1a1a]/30 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#7ecfc4]">
                    <span>
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, totalCount)} of {totalCount} users
                    </span>

                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className="p-1.5 rounded-lg border border-[#1a4a4a] hover:bg-[#112a2a] disabled:opacity-40 disabled:pointer-events-none text-[#e0faf5] transition-colors cursor-pointer"
                            title="Previous page"
                        >
                            <ChevronLeft size={14} />
                        </button>
                        <span className="px-2 font-bold text-[#e0faf5]">
                            {currentPage} / {totalPages}
                        </span>
                        <button
                            type="button"
                            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className="p-1.5 rounded-lg border border-[#1a4a4a] hover:bg-[#112a2a] disabled:opacity-40 disabled:pointer-events-none text-[#e0faf5] transition-colors cursor-pointer"
                            title="Next page"
                        >
                            <ChevronRight size={14} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
