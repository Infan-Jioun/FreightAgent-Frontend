"use client";

import {
    Laptop,
    Globe,
    Smartphone,
    Tablet,
    LogOut,
    RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ISessionItem, ISessionsBreakdown } from "@/app/types/user.types";

interface ActiveSessionsSectionProps {
    sessions: ISessionItem[];
    breakdown: ISessionsBreakdown;
    isLoadingSessions: boolean;
    revokingSessionId: string | null;
    isRevokingAll: boolean;
    onRevokeSession: (sessionId: string) => Promise<void>;
    onRevokeAllOther: () => Promise<void>;
    onRefreshSessions: () => Promise<void>;
}

export default function ActiveSessionsSection({
    sessions,
    breakdown,
    isLoadingSessions,
    revokingSessionId,
    isRevokingAll,
    onRevokeSession,
    onRevokeAllOther,
    onRefreshSessions,
}: ActiveSessionsSectionProps) {
    const getDeviceIcon = (deviceType: string | null) => {
        const type = (deviceType || "").toLowerCase();
        if (type === "mobile") return <Smartphone size={16} className="text-[#00c9a7]" />;
        if (type === "tablet") return <Tablet size={16} className="text-[#00b4d8]" />;
        return <Laptop size={16} className="text-[#7ecfc4]" />;
    };

    const hasRemoteSessions = sessions.some((s) => !s.isCurrent);
    const remoteCount = sessions.filter((s) => !s.isCurrent).length;

    return (
        <div className="p-6 rounded-3xl bg-[#0d1f1f] border border-[#1a4a4a] shadow-xl flex flex-col gap-6">
            {/* Section Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#1a4a4a]/60">
                <div>
                    <h3 className="text-sm font-bold text-[#e0faf5] flex items-center gap-2">
                        <Laptop size={16} className="text-[#00c9a7]" />
                        Active Device Sign-in Sessions
                    </h3>
                    <p className="text-xs text-[#7ecfc4] mt-0.5">
                        Authenticated sessions currently connected to your FreightAgent account across workstations and mobile devices.
                    </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                    {hasRemoteSessions && (
                        <Button
                            variant="destructive"
                            size="xs"
                            onClick={onRevokeAllOther}
                            isLoading={isRevokingAll}
                            loadingText="Terminating..."
                            leftIcon={<LogOut size={12} />}
                        >
                            Log Out All Other Sessions ({remoteCount})
                        </Button>
                    )}

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
                        Refresh Sessions
                    </Button>
                </div>
            </div>

            {/* Device Breakdown Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                            Total Sessions
                        </span>
                        <span className="text-xl font-black text-[#e0faf5]">{breakdown.total}</span>
                    </div>
                    <Globe size={20} className="text-[#00c9a7]" />
                </div>

                <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                            Desktops
                        </span>
                        <span className="text-xl font-black text-[#e0faf5]">{breakdown.desktop}</span>
                    </div>
                    <Laptop size={20} className="text-[#00b4d8]" />
                </div>

                <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                            Mobile Phones
                        </span>
                        <span className="text-xl font-black text-[#e0faf5]">{breakdown.mobile}</span>
                    </div>
                    <Smartphone size={20} className="text-[#00e5c0]" />
                </div>

                <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex items-center justify-between shadow-xs">
                    <div>
                        <span className="text-[10px] font-semibold text-[#3a6b66] uppercase tracking-wider block">
                            Tablets
                        </span>
                        <span className="text-xl font-black text-[#e0faf5]">{breakdown.tablet}</span>
                    </div>
                    <Tablet size={20} className="text-[#f59e0b]" />
                </div>
            </div>

            {/* Sessions Cards List */}
            {isLoadingSessions ? (
                <div className="min-h-[160px] flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full border-2 border-[#1a4a4a] border-t-[#00c9a7] animate-spin" />
                </div>
            ) : sessions.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#7ecfc4] bg-[#0a1a1a] rounded-2xl border border-[#1a4a4a]/50">
                    No active session records found.
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                                session.isCurrent
                                    ? "bg-[#00c9a7]/10 border-[#00c9a7]/50 shadow-xs shadow-[#00c9a7]/10"
                                    : "bg-[#0a1a1a] border-[#1a4a4a]/70 hover:border-[#1a4a4a]"
                            }`}
                        >
                            <div className="flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-[#112a2a] border border-[#1a4a4a] flex items-center justify-center shrink-0 mt-0.5">
                                    {getDeviceIcon(session.deviceType)}
                                </div>

                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h4 className="text-xs font-bold text-[#e0faf5]">
                                            {session.browser || "Standard Browser"} on{" "}
                                            {session.os || session.deviceName || "Desktop"}
                                        </h4>
                                        {session.isCurrent && (
                                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/40">
                                                Current Active Session
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-2.5 text-[11px] text-[#3a6b66] pt-0.5">
                                        <span>IP: {session.ipAddress || "Unknown IP"}</span>
                                        <span>•</span>
                                        <span>
                                            Signed in:{" "}
                                            {new Date(session.createdAt).toLocaleDateString("en-US", {
                                                month: "short",
                                                day: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Revoke Remote Session Action */}
                            {!session.isCurrent && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    shape="box"
                                    onClick={() => onRevokeSession(session.id)}
                                    isLoading={revokingSessionId === session.id}
                                    loadingText="Revoking..."
                                    leftIcon={<LogOut size={13} />}
                                >
                                    Revoke Session
                                </Button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
