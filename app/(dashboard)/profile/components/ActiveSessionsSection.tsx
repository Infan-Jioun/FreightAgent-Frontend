"use client";

import React from "react";
import {
    Laptop,
    Globe,
    Smartphone,
    Tablet,
    LogOut,
    RefreshCw,
    ShieldAlert,
    Clock,
    Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ISessionItem, ISessionsBreakdown } from "@/app/types/user.types";
import { cn } from "@/lib/utils";

export interface ActiveSessionsSectionProps {
    sessions: ISessionItem[];
    breakdown?: ISessionsBreakdown;
    isLoadingSessions: boolean;
    revokingSessionId?: string | null;
    isRevokingAll?: boolean;
    onRevokeSession: (sessionId: string) => Promise<void> | void;
    onRevokeAllOther?: () => Promise<void> | void;
    onRefreshSessions?: () => Promise<void> | void;
    title?: string;
    description?: string;
    targetUserName?: string;
    isAdminView?: boolean;
    isSelf?: boolean;
    compact?: boolean;
    showBreakdown?: boolean;
    className?: string;
}

export default function ActiveSessionsSection({
    sessions,
    breakdown,
    isLoadingSessions,
    revokingSessionId = null,
    isRevokingAll = false,
    onRevokeSession,
    onRevokeAllOther,
    onRefreshSessions,
    title,
    description,
    targetUserName,
    isAdminView = false,
    isSelf = false,
    compact = false,
    showBreakdown = true,
    className = "",
}: ActiveSessionsSectionProps): React.JSX.Element {
    const getDeviceIcon = (deviceType: string | null) => {
        const type = (deviceType || "").toLowerCase();
        if (type === "mobile") return <Smartphone size={compact ? 14 : 16} className="text-[#00c9a7]" />;
        if (type === "tablet") return <Tablet size={compact ? 14 : 16} className="text-[#00b4d8]" />;
        return <Laptop size={compact ? 14 : 16} className="text-[#7ecfc4]" />;
    };

    // Calculate breakdown fallback if not directly provided
    const effectiveBreakdown: ISessionsBreakdown = breakdown || {
        total: sessions.length,
        mobile: sessions.filter((s) => (s.deviceType || "").toLowerCase() === "mobile").length,
        tablet: sessions.filter((s) => (s.deviceType || "").toLowerCase() === "tablet").length,
        desktop: sessions.filter(
            (s) =>
                (s.deviceType || "").toLowerCase() !== "mobile" &&
                (s.deviceType || "").toLowerCase() !== "tablet"
        ).length,
    };

    // Determine termination permissions
    // In admin view for a remote user, admin can terminate any of their sessions
    const canRevokeSession = (session: ISessionItem) => {
        if (isAdminView && !isSelf) return true;
        return !session.isCurrent;
    };

    const hasTerminatableSessions = sessions.some(canRevokeSession);
    const terminatableCount = sessions.filter(canRevokeSession).length;

    // Header labels
    const sectionTitle =
        title ||
        (isAdminView
            ? `Active Device Sign-in Sessions (${sessions.length})`
            : "Active Device Sign-in Sessions");

    const sectionDescription =
        description ||
        (isAdminView
            ? targetUserName
                ? `Authenticated device sessions currently active for ${targetUserName}. Administrators can terminate individual or all logins.`
                : "Authenticated device sessions currently active for this user account. Administrators can terminate individual or all logins."
            : "Authenticated sessions currently connected to your FreightAgent account across workstations and mobile devices.");

    const bulkButtonLabel =
        isAdminView && !isSelf
            ? `Terminate All Sessions (${sessions.length})`
            : `Log Out All Other Sessions (${terminatableCount})`;

    return (
        <div
            className={cn(
                "rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl flex flex-col",
                compact ? "p-4 gap-4" : "p-6 gap-6",
                className
            )}
        >
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#1a4a4a]/60">
                <div>
                    <h3
                        className={cn(
                            "font-bold text-[#e0faf5] flex items-center gap-2",
                            compact ? "text-xs" : "text-sm"
                        )}
                    >
                        <Laptop size={compact ? 15 : 16} className="text-[#00c9a7] shrink-0" />
                        <span>{sectionTitle}</span>
                        {isAdminView && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30">
                                Admin Control
                            </span>
                        )}
                    </h3>
                    <p className="text-xs text-[#7ecfc4] mt-0.5 max-w-2xl">
                        {sectionDescription}
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap shrink-0">
                    {onRevokeAllOther && hasTerminatableSessions && (
                        <Button
                            variant="destructive"
                            size="xs"
                            onClick={onRevokeAllOther}
                            isLoading={isRevokingAll}
                            loadingText="Terminating..."
                            leftIcon={<LogOut size={12} />}
                        >
                            {bulkButtonLabel}
                        </Button>
                    )}

                    {onRefreshSessions && (
                        <Button
                            variant="secondary"
                            size="xs"
                            onClick={onRefreshSessions}
                            leftIcon={
                                <RefreshCw
                                    size={12}
                                    className={isLoadingSessions ? "animate-spin" : ""}
                                />
                            }
                        >
                            Refresh
                        </Button>
                    )}
                </div>
            </div>

            {/* Device Breakdown Metric Badges */}
            {showBreakdown && (
                <div
                    className={cn(
                        "grid grid-cols-2 sm:grid-cols-4",
                        compact ? "gap-2.5" : "gap-4"
                    )}
                >
                    <div
                        className={cn(
                            "rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex items-center justify-between shadow-xs",
                            compact ? "p-2.5" : "p-4"
                        )}
                    >
                        <div>
                            <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                                Total Sessions
                            </span>
                            <span
                                className={cn(
                                    "font-black text-[#e0faf5]",
                                    compact ? "text-base" : "text-xl"
                                )}
                            >
                                {effectiveBreakdown.total}
                            </span>
                        </div>
                        <Globe size={compact ? 16 : 20} className="text-[#00c9a7] shrink-0" />
                    </div>

                    <div
                        className={cn(
                            "rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex items-center justify-between shadow-xs",
                            compact ? "p-2.5" : "p-4"
                        )}
                    >
                        <div>
                            <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                                Desktops
                            </span>
                            <span
                                className={cn(
                                    "font-black text-[#e0faf5]",
                                    compact ? "text-base" : "text-xl"
                                )}
                            >
                                {effectiveBreakdown.desktop}
                            </span>
                        </div>
                        <Laptop size={compact ? 16 : 20} className="text-[#00b4d8] shrink-0" />
                    </div>

                    <div
                        className={cn(
                            "rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex items-center justify-between shadow-xs",
                            compact ? "p-2.5" : "p-4"
                        )}
                    >
                        <div>
                            <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                                Mobile Phones
                            </span>
                            <span
                                className={cn(
                                    "font-black text-[#e0faf5]",
                                    compact ? "text-base" : "text-xl"
                                )}
                            >
                                {effectiveBreakdown.mobile}
                            </span>
                        </div>
                        <Smartphone size={compact ? 16 : 20} className="text-[#00e5c0] shrink-0" />
                    </div>

                    <div
                        className={cn(
                            "rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex items-center justify-between shadow-xs",
                            compact ? "p-2.5" : "p-4"
                        )}
                    >
                        <div>
                            <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                                Tablets
                            </span>
                            <span
                                className={cn(
                                    "font-black text-[#e0faf5]",
                                    compact ? "text-base" : "text-xl"
                                )}
                            >
                                {effectiveBreakdown.tablet}
                            </span>
                        </div>
                        <Tablet size={compact ? 16 : 20} className="text-[#f59e0b] shrink-0" />
                    </div>
                </div>
            )}

            {/* Sessions Cards List */}
            {isLoadingSessions ? (
                <div
                    className={cn(
                        "flex items-center justify-center",
                        compact ? "min-h-[100px]" : "min-h-[160px]"
                    )}
                >
                    <div className="w-6 h-6 rounded-full border-2 border-[#1a4a4a] border-t-[#00c9a7] animate-spin" />
                </div>
            ) : sessions.length === 0 ? (
                <div
                    className={cn(
                        "text-center text-xs text-[#7ecfc4]/70 bg-[#0a1a1a] rounded-2xl border border-[#1a4a4a]/50",
                        compact ? "p-4" : "p-8"
                    )}
                >
                    <ShieldAlert size={18} className="mx-auto mb-1 text-[#3a6b66]" />
                    No active login sessions recorded for this account.
                </div>
            ) : (
                <div className="flex flex-col gap-2.5">
                    {sessions.map((session) => {
                        const canRevoke = canRevokeSession(session);
                        const isRevoking = revokingSessionId === session.id;

                        return (
                            <div
                                key={session.id}
                                className={cn(
                                    "rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                                    compact ? "p-3" : "p-4",
                                    session.isCurrent
                                        ? "bg-[#00c9a7]/10 border-[#00c9a7]/50 shadow-xs shadow-[#00c9a7]/10"
                                        : "bg-[#0a1a1a] border-[#1a4a4a]/70 hover:border-[#00c9a7]/40"
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <div
                                        className={cn(
                                            "rounded-xl bg-[#112a2a] border border-[#1a4a4a] flex items-center justify-center shrink-0 mt-0.5",
                                            compact ? "w-8 h-8" : "w-10 h-10"
                                        )}
                                    >
                                        {getDeviceIcon(session.deviceType)}
                                    </div>

                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="text-xs font-bold text-[#e0faf5]">
                                                {session.browser || "Standard Browser"} on{" "}
                                                {session.os || session.deviceName || "Desktop Workstation"}
                                            </h4>
                                            {session.isCurrent && (
                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/40">
                                                    Current Active Session
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-2 text-[11px] text-[#7ecfc4]/80 pt-0.5 flex-wrap">
                                            <span className="flex items-center gap-1 font-mono text-[#00e5c0]">
                                                <Wifi size={10} className="text-[#00c9a7]" />
                                                <span>{session.ipAddress || "Unknown IP"}</span>
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                <Clock size={10} className="text-[#3a6b66]" />
                                                <span>
                                                    Signed in:{" "}
                                                    {new Date(session.createdAt).toLocaleDateString(
                                                        undefined,
                                                        {
                                                            month: "short",
                                                            day: "numeric",
                                                            year: "numeric",
                                                            hour: "2-digit",
                                                            minute: "2-digit",
                                                        }
                                                    )}
                                                </span>
                                            </span>
                                            {session.expiresAt && (
                                                <>
                                                    <span>•</span>
                                                    <span className="text-[#3a6b66] text-[10px]">
                                                        Expires:{" "}
                                                        {new Date(session.expiresAt).toLocaleDateString(
                                                            undefined,
                                                            {
                                                                month: "short",
                                                                day: "numeric",
                                                            }
                                                        )}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Revoke Session Action Button */}
                                {canRevoke && (
                                    <div className="shrink-0 self-end sm:self-center">
                                        <Button
                                            variant="destructive"
                                            size="xs"
                                            shape="box"
                                            onClick={() => onRevokeSession(session.id)}
                                            isLoading={isRevoking}
                                            loadingText="Revoking..."
                                            leftIcon={<LogOut size={12} />}
                                        >
                                            Terminate Session
                                        </Button>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
