"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
    Laptop,
    Smartphone,
    Tablet,
    Globe,
    Clock,
    Trash2,
    LogOut,
    ShieldAlert,
    RefreshCw,
    AlertCircle,
    Wifi,
    CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { adminSessionService } from "@/app/services/adminSessionService";
import { IUserSessionData, IUserSession } from "@/app/types/session.types";
import { getErrorMessage } from "@/app/errorHelper/appError";
import { cn } from "@/lib/utils";

export interface UserSessionsModalProps {
    userId: string | null;
    userName?: string;
    userEmail?: string;
    isOpen: boolean;
    onClose: () => void;
    onSessionRevoked?: (sessionId: string) => void;
    onAllRevoked?: () => void;
}

export function UserSessionsModal({
    userId,
    userName,
    userEmail,
    isOpen,
    onClose,
    onSessionRevoked,
    onAllRevoked,
}: UserSessionsModalProps): React.JSX.Element | null {
    const [data, setData] = useState<IUserSessionData | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
    const [isRevokingAll, setIsRevokingAll] = useState<boolean>(false);
    const [confirmRevokeAll, setConfirmRevokeAll] = useState<boolean>(false);

    // Fetch sessions for the target user
    const loadSessions = useCallback(async () => {
        if (!userId) return;
        try {
            setIsLoading(true);
            setError(null);
            const res = await adminSessionService.getUserSessions(userId);
            setData(res);
        } catch (err: unknown) {
            const msg = getErrorMessage(err, "Failed to load active user devices and sessions");
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        if (isOpen && userId) {
            setConfirmRevokeAll(false);
            loadSessions();
        } else {
            setData(null);
            setError(null);
        }
    }, [isOpen, userId, loadSessions]);

    // Revoke a single specific session
    const handleRevokeSingle = async (sessionId: string) => {
        if (!userId) return;
        try {
            setActionLoadingId(sessionId);
            await adminSessionService.revokeSession(userId, sessionId);
            toast.success("Device session revoked successfully");

            // Optimistic update
            setData((prev) => {
                if (!prev) return null;
                const filtered = prev.sessions.filter((s) => s.id !== sessionId);
                return {
                    ...prev,
                    sessions: filtered,
                    breakdown: {
                        ...prev.breakdown,
                        total: Math.max(0, filtered.length),
                    },
                };
            });

            onSessionRevoked?.(sessionId);
        } catch (err: unknown) {
            const msg = getErrorMessage(err, "Failed to revoke session");
            toast.error(msg);
        } finally {
            setActionLoadingId(null);
        }
    };

    // Force logout target user from all devices
    const handleRevokeAll = async () => {
        if (!userId) return;
        try {
            setIsRevokingAll(true);
            await adminSessionService.revokeAllSessions(userId);
            toast.success("User forced logout from all active devices");

            // Optimistic update
            setData((prev) => {
                if (!prev) return null;
                return {
                    ...prev,
                    sessions: [],
                    breakdown: { total: 0, mobile: 0, tablet: 0, desktop: 0 },
                };
            });

            setConfirmRevokeAll(false);
            onAllRevoked?.();
        } catch (err: unknown) {
            const msg = getErrorMessage(err, "Failed to terminate all sessions");
            toast.error(msg);
        } finally {
            setIsRevokingAll(false);
        }
    };

    if (!isOpen) return null;

    const renderDeviceIcon = (deviceType: string | null) => {
        const type = (deviceType || "").toLowerCase();
        switch (type) {
            case "mobile":
                return <Smartphone className="size-4 text-[#00c9a7] shrink-0" />;
            case "tablet":
                return <Tablet className="size-4 text-[#00b4d8] shrink-0" />;
            default:
                return <Laptop className="size-4 text-[#7ecfc4] shrink-0" />;
        }
    };

    const targetDisplayName = data?.user?.name || userName || "User";
    const targetDisplayEmail = data?.user?.email || userEmail || "";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            maxWidth="2xl"
            title="Active User Devices & Login Sessions"
            description={
                targetDisplayEmail
                    ? `Monitoring active device logins for ${targetDisplayName} (${targetDisplayEmail})`
                    : `Monitoring active device logins for ${targetDisplayName}`
            }
            icon={<ShieldAlert size={20} className="text-[#00e5c0]" />}
            headerRight={
                <button
                    type="button"
                    onClick={loadSessions}
                    disabled={isLoading}
                    className="p-1.5 rounded-xl bg-[#112a2a] text-[#7ecfc4] hover:text-[#00e5c0] hover:bg-[#1a4a4a] border border-[#1a4a4a] transition-colors cursor-pointer focus:outline-hidden disabled:opacity-50"
                    title="Refresh sessions"
                    aria-label="Refresh active sessions"
                >
                    <RefreshCw className={cn("size-3.5", isLoading && "animate-spin")} />
                </button>
            }
        >
            <ModalBody className="space-y-4 pt-1">
                {/* Device Breakdown 4-Card Metric Grid */}
                {data?.breakdown && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex flex-col justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3a6b66]">
                                Total Active
                            </span>
                            <span className="text-xl font-extrabold text-[#e0faf5] mt-1">
                                {data.breakdown.total}
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex flex-col justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3a6b66]">
                                Desktops
                            </span>
                            <span className="text-xl font-extrabold text-[#00b4d8] mt-1">
                                {data.breakdown.desktop}
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex flex-col justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3a6b66]">
                                Mobile Phones
                            </span>
                            <span className="text-xl font-extrabold text-[#00c9a7] mt-1">
                                {data.breakdown.mobile}
                            </span>
                        </div>
                        <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/70 flex flex-col justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-[#3a6b66]">
                                Tablets
                            </span>
                            <span className="text-xl font-extrabold text-[#f59e0b] mt-1">
                                {data.breakdown.tablet}
                            </span>
                        </div>
                    </div>
                )}

                {/* Session List Container */}
                <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-[#7ecfc4] gap-3">
                            <RefreshCw className="size-6 animate-spin text-[#00c9a7]" />
                            <span className="text-xs font-medium">Loading active user sessions...</span>
                        </div>
                    ) : error ? (
                        <div className="p-4 rounded-2xl bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 text-xs text-[#ff6b6b] flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="size-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                            <Button
                                variant="secondary"
                                size="xs"
                                onClick={loadSessions}
                            >
                                Try Again
                            </Button>
                        </div>
                    ) : data?.sessions && data.sessions.length > 0 ? (
                        data.sessions.map((session: IUserSession) => {
                            const isRevoking = actionLoadingId === session.id;
                            const displayName =
                                session.deviceName ||
                                [session.browser, session.os].filter(Boolean).join(" on ") ||
                                "Authenticated Workstation";

                            return (
                                <div
                                    key={session.id}
                                    className={cn(
                                        "p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                                        session.isCurrent
                                            ? "bg-[#00c9a7]/10 border-[#00c9a7]/40 shadow-xs shadow-[#00c9a7]/10"
                                            : "bg-[#0a1a1a] border-[#1a4a4a] hover:border-[#00c9a7]/40"
                                    )}
                                >
                                    {/* Left: Device Icon & Information */}
                                    <div className="flex items-start gap-3 min-w-0">
                                        <div className="p-2.5 rounded-xl bg-[#0d2626] border border-[#1a4a4a] shrink-0 mt-0.5">
                                            {renderDeviceIcon(session.deviceType)}
                                        </div>

                                        <div className="min-w-0 space-y-1">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-bold text-[#e0faf5] truncate">
                                                    {displayName}
                                                </span>
                                                {session.isCurrent && (
                                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30 flex items-center gap-1">
                                                        <CheckCircle2 size={9} />
                                                        Current Session
                                                    </span>
                                                )}
                                                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30">
                                                    Active
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-[#7ecfc4]/70 font-mono">
                                                <span className="flex items-center gap-1">
                                                    <Wifi size={11} className="text-[#00c9a7]" />
                                                    {session.ipAddress || "Unknown IP"}
                                                </span>
                                                <span>•</span>
                                                <span>{session.browser || "Browser"}</span>
                                                <span>•</span>
                                                <span>{session.os || "OS"}</span>
                                                <span>•</span>
                                                <span className="flex items-center gap-1">
                                                    <Clock size={11} />
                                                    {session.createdAt
                                                        ? new Date(session.createdAt).toLocaleDateString("en-US", {
                                                              month: "short",
                                                              day: "numeric",
                                                              hour: "2-digit",
                                                              minute: "2-digit",
                                                          })
                                                        : "Recently"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right: Termination Action */}
                                    <Button
                                        variant="destructive"
                                        size="xs"
                                        onClick={() => handleRevokeSingle(session.id)}
                                        disabled={isRevoking || session.isCurrent}
                                        isLoading={isRevoking}
                                        loadingText="Revoking..."
                                        leftIcon={<Trash2 size={12} />}
                                        className="self-end sm:self-center shrink-0"
                                        title={
                                            session.isCurrent
                                                ? "Cannot revoke active administrative session from here"
                                                : "Terminate this login session"
                                        }
                                    >
                                        Revoke
                                    </Button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 text-center rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/50 p-6">
                            <Laptop className="size-8 text-[#3a6b66] mx-auto mb-2" />
                            <p className="text-xs font-bold text-[#e0faf5]">
                                No active device sessions found
                            </p>
                            <p className="text-[11px] text-[#7ecfc4]/70 mt-0.5">
                                This user is currently logged out from all workstations and mobile devices.
                            </p>
                        </div>
                    )}
                </div>

                {/* Inline Confirmation for Revoking All Devices */}
                {confirmRevokeAll && (
                    <div className="p-3.5 rounded-2xl bg-[#ff6b6b]/15 border border-[#ff6b6b]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="text-[#ff6b6b]">
                            <strong>Confirm Mass Logout:</strong> This will terminate ALL connected devices for {targetDisplayName}. Continue?
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => setConfirmRevokeAll(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                size="xs"
                                onClick={handleRevokeAll}
                                isLoading={isRevokingAll}
                                loadingText="Terminating..."
                            >
                                Yes, Terminate All
                            </Button>
                        </div>
                    </div>
                )}
            </ModalBody>

            <ModalFooter className="justify-between">
                <Button variant="secondary" size="sm" onClick={onClose}>
                    Close
                </Button>

                {data?.sessions && data.sessions.length > 0 && !confirmRevokeAll && (
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmRevokeAll(true)}
                        leftIcon={<LogOut size={14} />}
                    >
                        Terminate All Devices ({data.sessions.length})
                    </Button>
                )}
            </ModalFooter>
        </Modal>
    );
}

export default UserSessionsModal;
