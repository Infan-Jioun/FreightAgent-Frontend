"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Modal } from "@/components/ui/Modal";
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
    Navigation,
    Route,
    Laptop,
    UserCheck,
    ChevronDown,
    ChevronUp,
    Copy,
    Check,
    Search,
    ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import {
    IAdminUser,
    IAdminUserDetail,
    IAdminUserShipment,
    ISessionItem,
    ISessionsBreakdown,
} from "@/app/types/admin.types";
import { adminService } from "@/app/services/admin.service";
import { shipmentService } from "@/app/services/shipment.service";
import { locationService } from "@/app/services/location.service";
import { ILocation } from "@/app/types/location.types";
import type { IRoadAgent, IResolvedAgentInfo } from "@/app/types/shipment.types";
import { getErrorMessage } from "@/app/errorHelper/appError";
import ActiveSessionsSection from "@/app/(dashboard)/profile/components/ActiveSessionsSection";
import UserSessionsModal from "./UserSessionsModal";

function resolveShipmentAgent(
    shipment: IAdminUserShipment,
    availableAgents: IRoadAgent[]
): IResolvedAgentInfo | null {
    // 1. Direct assignedAgent object
    if (shipment.assignedAgent && typeof shipment.assignedAgent === "object") {
        const a = shipment.assignedAgent;
        if (a.name) {
            return {
                name: a.name,
                email: a.email || null,
                phone: a.phone || null,
            };
        }
    }

    // 2. Alternative raw agent objects
    const record = shipment as unknown as Record<string, unknown>;
    const rawAgent =
        record.agent ||
        record.assignedTo ||
        record.carrierAgent ||
        record.carrier;

    if (rawAgent && typeof rawAgent === "object" && rawAgent !== null) {
        const r = rawAgent as Record<string, unknown>;
        const userObj =
            r.user && typeof r.user === "object"
                ? (r.user as Record<string, unknown>)
                : null;

        const name =
            (typeof r.name === "string" ? r.name : null) ||
            (typeof r.fullName === "string" ? r.fullName : null) ||
            (userObj && typeof userObj.name === "string" ? userObj.name : null);

        const email =
            (typeof r.email === "string" ? r.email : null) ||
            (userObj && typeof userObj.email === "string" ? userObj.email : null);

        const phone =
            (typeof r.phone === "string" ? r.phone : null) ||
            (userObj && typeof userObj.phone === "string" ? userObj.phone : null);

        if (name) {
            return { name, email, phone };
        }
    }

    // 3. Fallback: Lookup by assignedAgentId in availableAgents
    const agentId =
        (typeof shipment.assignedAgentId === "string" ? shipment.assignedAgentId : null) ||
        (typeof record.agentId === "string" ? (record.agentId as string) : null);

    if (agentId && availableAgents && availableAgents.length > 0) {
        const found = availableAgents.find((a) => a.id === agentId);
        if (found) {
            return {
                name: found.name,
                email: found.email || null,
                phone: found.phone || null,
            };
        }
    }

    // 4. Flat properties fallback (e.g. assignedAgentName, assignedAgentEmail)
    if (typeof record.assignedAgentName === "string" && record.assignedAgentName.trim()) {
        return {
            name: record.assignedAgentName,
            email: typeof record.assignedAgentEmail === "string" ? record.assignedAgentEmail : null,
            phone: typeof record.assignedAgentPhone === "string" ? record.assignedAgentPhone : null,
        };
    }

    return null;
}

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
    const [agentCreatedLocations, setAgentCreatedLocations] = useState<ILocation[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(false);

    // Shipments & Assigned Carrier Fleet State
    const [userShipments, setUserShipments] = useState<IAdminUserShipment[]>([]);
    const [loadingShipments, setLoadingShipments] = useState(false);
    const [availableAgents, setAvailableAgents] = useState<IRoadAgent[]>([]);
    const [expandedShipmentId, setExpandedShipmentId] = useState<string | null>(null);
    const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);
    const [shipmentTab, setShipmentTab] = useState<"ALL" | "ASSIGNED" | "BOOKED">("ALL");
    const [shipmentSearch, setShipmentSearch] = useState("");

    // Active Sessions State
    const [sessions, setSessions] = useState<ISessionItem[]>([]);
    const [sessionsBreakdown, setSessionsBreakdown] = useState<ISessionsBreakdown>({
        total: 0,
        mobile: 0,
        tablet: 0,
        desktop: 0,
    });
    const [loadingSessions, setLoadingSessions] = useState(false);
    const [revokingSessionId, setRevokingSessionId] = useState<string | null>(null);
    const [isRevokingAll, setIsRevokingAll] = useState(false);
    const [isDeviceSessionsModalOpen, setIsDeviceSessionsModalOpen] = useState(false);

    useEffect(() => {
        if (isOpen && user?.id) {
            let isMounted = true;
            setLoadingDetails(true);
            setLoadingShipments(true);

            // Fetch available agent fleet to resolve carrier details
            adminService
                .getAvailableAgents()
                .then((agents) => {
                    if (isMounted) setAvailableAgents(agents || []);
                })
                .catch(() => {
                    if (isMounted) setAvailableAgents([]);
                });

            adminService
                .getUserById(user.id)
                .then((data) => {
                    if (isMounted && data) {
                        const raw = data as unknown as Record<string, unknown>;
                        const userEntity =
                            raw.user && typeof raw.user === "object"
                                ? (raw.user as Record<string, unknown>)
                                : raw;
                        const rawShipments: IAdminUserShipment[] = Array.isArray(raw.shipments)
                            ? (raw.shipments as IAdminUserShipment[])
                            : Array.isArray(userEntity.shipments)
                            ? (userEntity.shipments as IAdminUserShipment[])
                            : [];
                        const rawAssigned: IAdminUserShipment[] = Array.isArray(raw.assignedShipments)
                            ? (raw.assignedShipments as IAdminUserShipment[])
                            : Array.isArray(userEntity.assignedShipments)
                            ? (userEntity.assignedShipments as IAdminUserShipment[])
                            : [];

                        const combinedMap = new Map<string, IAdminUserShipment>();
                        [...rawShipments, ...rawAssigned].forEach((s) => {
                            if (s && (s.id || s.trackingId)) {
                                combinedMap.set(s.id || s.trackingId, s);
                            }
                        });

                        setDetailedUser({
                            ...user,
                            ...userEntity,
                            id: (userEntity.id || userEntity._id || user.id) as string,
                            shipments: Array.from(combinedMap.values()),
                        });

                        if (combinedMap.size > 0) {
                            setUserShipments(Array.from(combinedMap.values()));
                        }

                        // Query all shipments as resilient fallback / enrichment
                        shipmentService
                            .getAllShipments({ limit: 100 })
                            .then((sRes) => {
                                if (isMounted && sRes?.shipments && Array.isArray(sRes.shipments)) {
                                    const targetUserId = user.id.trim();
                                    const targetUserEmail = (user.email || "").toLowerCase().trim();

                                    sRes.shipments.forEach((s) => {
                                        const isShipper =
                                            (s.userId && s.userId.trim() === targetUserId) ||
                                            (s.user?.id && s.user.id.trim() === targetUserId) ||
                                            Boolean(
                                                targetUserEmail &&
                                                    s.user?.email?.toLowerCase().trim() === targetUserEmail
                                            );

                                        const isCarrier =
                                            (s.assignedAgentId && s.assignedAgentId.trim() === targetUserId) ||
                                            (s.assignedAgent?.id && s.assignedAgent.id.trim() === targetUserId) ||
                                            Boolean(
                                                targetUserEmail &&
                                                    s.assignedAgent?.email?.toLowerCase().trim() ===
                                                        targetUserEmail
                                            );

                                        if (isShipper || isCarrier) {
                                            const key = s.id || s.trackingId;
                                            const existing = combinedMap.get(key);
                                            combinedMap.set(key, {
                                                ...(existing || {}),
                                                ...s,
                                                assignedAgent: s.assignedAgent || existing?.assignedAgent,
                                            } as IAdminUserShipment);
                                        }
                                    });

                                    setUserShipments(Array.from(combinedMap.values()));
                                }
                            })
                            .catch(() => {})
                            .finally(() => {
                                if (isMounted) setLoadingShipments(false);
                            });
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setDetailedUser(user as IAdminUserDetail);
                        shipmentService
                            .getAllShipments({ limit: 100 })
                            .then((sRes) => {
                                if (isMounted && sRes?.shipments) {
                                    const targetUserId = user.id.trim();
                                    const targetUserEmail = (user.email || "").toLowerCase().trim();
                                    const matched = sRes.shipments.filter((s) => {
                                        return (
                                            s.userId === targetUserId ||
                                            s.user?.id === targetUserId ||
                                            s.assignedAgentId === targetUserId ||
                                            s.assignedAgent?.id === targetUserId ||
                                            Boolean(
                                                targetUserEmail &&
                                                    (s.user?.email?.toLowerCase().trim() === targetUserEmail ||
                                                        s.assignedAgent?.email?.toLowerCase().trim() ===
                                                            targetUserEmail)
                                            )
                                        );
                                    });
                                    setUserShipments(matched as IAdminUserShipment[]);
                                }
                            })
                            .catch(() => {})
                            .finally(() => {
                                if (isMounted) setLoadingShipments(false);
                            });
                    }
                })
                .finally(() => {
                    if (isMounted) setLoadingDetails(false);
                });

            // If user is an AGENT, fetch locations created by or assigned to them
            if (user.role === "AGENT") {
                setLoadingLocations(true);
                locationService
                    .getAll({ limit: 100 }, true)
                    .then((res) => {
                        if (isMounted && res?.data && Array.isArray(res.data)) {
                            const userId = user.id.trim();
                            const userEmail = (user.email || "").toLowerCase().trim();
                            const matched = res.data.filter((loc) => {
                                const creatorId = loc.createdBy?.id
                                    ? String(loc.createdBy.id).trim()
                                    : "";
                                const creatorEmail = loc.createdBy?.email
                                    ? loc.createdBy.email.toLowerCase().trim()
                                    : "";
                                return (
                                    (creatorId && creatorId === userId) ||
                                    (creatorEmail && creatorEmail === userEmail)
                                );
                            });
                            setAgentCreatedLocations(matched);
                        }
                    })
                    .catch(() => {
                        if (isMounted) setAgentCreatedLocations([]);
                    })
                    .finally(() => {
                        if (isMounted) setLoadingLocations(false);
                    });
            } else {
                setAgentCreatedLocations([]);
            }

            // Fetch user's active login sessions
            const isSelfUser = Boolean(
                currentAdminId && user.id && user.id.trim() === currentAdminId.trim()
            );
            setLoadingSessions(true);
            adminService
                .getUserSessions(user.id, isSelfUser)
                .then((sessData) => {
                    if (isMounted) {
                        setSessions(sessData.sessions || []);
                        setSessionsBreakdown(
                            sessData.breakdown || {
                                total: sessData.sessions?.length || 0,
                                mobile: 0,
                                tablet: 0,
                                desktop: 0,
                            }
                        );
                    }
                })
                .catch(() => {
                    if (isMounted) {
                        setSessions([]);
                        setSessionsBreakdown({ total: 0, mobile: 0, tablet: 0, desktop: 0 });
                    }
                })
                .finally(() => {
                    if (isMounted) setLoadingSessions(false);
                });

            return () => {
                isMounted = false;
            };
        } else {
            setDetailedUser(null);
            setAgentCreatedLocations([]);
            setSessions([]);
            setSessionsBreakdown({ total: 0, mobile: 0, tablet: 0, desktop: 0 });
            setUserShipments([]);
            setAvailableAgents([]);
            setExpandedShipmentId(null);
            setCopiedTrackingId(null);
            setShipmentTab("ALL");
            setShipmentSearch("");
        }
    }, [isOpen, user, currentAdminId]);

    if (!isOpen || !user) return null;

    const displayUser: IAdminUserDetail = detailedUser || user;
    const isSelf = currentAdminId && user.id ? user.id.trim() === currentAdminId.trim() : false;
    const isBlocked = Boolean(displayUser.isBlocked || displayUser.status === "SUSPENDED");
    const isAgent = displayUser.role === "AGENT";

    // Extract phone safely from any backend property
    const rawDisplay = displayUser as unknown as Record<string, unknown>;
    const phone =
        displayUser.phone ||
        (rawDisplay?.phoneNumber as string) ||
        (rawDisplay?.contact as string) ||
        (rawDisplay?.mobile as string);

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

    // Corridors list parsing
    let corridorList: string[] = [];
    if (Array.isArray(displayUser.corridors)) {
        corridorList = displayUser.corridors;
    } else if (typeof displayUser.corridors === "string") {
        try {
            const parsed = JSON.parse(displayUser.corridors);
            if (Array.isArray(parsed)) corridorList = parsed;
            else corridorList = [displayUser.corridors];
        } catch {
            corridorList = [displayUser.corridors];
        }
    }

    // Merge locations attached on displayUser with database created locations
    const attachedLocations: ILocation[] = Array.isArray(displayUser.locations)
        ? (displayUser.locations.filter(
              (l) => typeof l === "object" && l !== null && "id" in (l as Record<string, unknown>)
          ) as ILocation[])
        : [];

    const allAgentLocations: ILocation[] = [...agentCreatedLocations];
    attachedLocations.forEach((loc) => {
        if (!allAgentLocations.some((l) => l.id === loc.id || (l.code && l.code === loc.code))) {
            allAgentLocations.push(loc);
        }
    });

    const isTargetAgent = displayUser.role === "AGENT";
    const targetUserId = (displayUser.id || user.id || "").trim();
    const targetUserEmail = (displayUser.email || user.email || "").toLowerCase().trim();

    const isShipmentAssignedToThisUser = useCallback(
        (s: IAdminUserShipment): boolean => {
            if (!isTargetAgent) return false;
            const agentId = (s.assignedAgentId || s.assignedAgent?.id || "").trim();
            const agentEmail = (s.assignedAgent?.email || "").toLowerCase().trim();
            return Boolean(
                (targetUserId && agentId === targetUserId) ||
                (targetUserEmail && agentEmail === targetUserEmail)
            );
        },
        [isTargetAgent, targetUserId, targetUserEmail]
    );

    const isShipmentBookedByThisUser = useCallback(
        (s: IAdminUserShipment): boolean => {
            const shipperId = (s.userId || s.user?.id || "").trim();
            const shipperEmail = (s.user?.email || "").toLowerCase().trim();
            return Boolean(
                (targetUserId && shipperId === targetUserId) ||
                (targetUserEmail && shipperEmail === targetUserEmail)
            );
        },
        [targetUserId, targetUserEmail]
    );

    const effectiveShipments = userShipments.length > 0 ? userShipments : displayUser.shipments ?? [];
    const assignedCount = effectiveShipments.filter(isShipmentAssignedToThisUser).length;
    const bookedCount = effectiveShipments.filter(isShipmentBookedByThisUser).length;

    const filteredShipments = effectiveShipments.filter((s) => {
        if (shipmentTab === "ASSIGNED" && !isShipmentAssignedToThisUser(s)) return false;
        if (shipmentTab === "BOOKED" && !isShipmentBookedByThisUser(s)) return false;

        if (shipmentSearch.trim()) {
            const q = shipmentSearch.trim().toLowerCase();
            const tracking = (s.trackingId || s.id || "").toLowerCase();
            const origin = (s.origin || "").toLowerCase();
            const dest = (s.destination || "").toLowerCase();
            const status = (s.status || "").toLowerCase();
            const agent = resolveShipmentAgent(s, availableAgents);
            const agentName = (agent?.name || "").toLowerCase();
            return (
                tracking.includes(q) ||
                origin.includes(q) ||
                dest.includes(q) ||
                status.includes(q) ||
                agentName.includes(q)
            );
        }
        return true;
    });

    const handleCopyTrackingId = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!id) return;
        navigator.clipboard.writeText(id);
        setCopiedTrackingId(id);
        toast.success(`Waybill "${id}" copied to clipboard`);
        setTimeout(() => {
            setCopiedTrackingId((prev) => (prev === id ? null : prev));
        }, 2000);
    };

    const toggleExpandShipment = (id: string) => {
        setExpandedShipmentId((prev) => (prev === id ? null : id));
    };

    // Session Revocation & Refresh Handlers
    const handleRevokeSession = async (sessionId: string) => {
        if (!displayUser.id) return;
        try {
            setRevokingSessionId(sessionId);
            const res = await adminService.revokeUserSession(displayUser.id, sessionId);
            toast.success(res.message || "Session terminated successfully");
            setSessions((prev) => {
                const next = prev.filter((s) => s.id !== sessionId);
                setSessionsBreakdown((bPrev) => ({
                    ...bPrev,
                    total: Math.max(0, bPrev.total - 1),
                }));
                return next;
            });
        } catch (err: unknown) {
            const msg = getErrorMessage(err, "Failed to terminate session");
            toast.error(msg);
        } finally {
            setRevokingSessionId(null);
        }
    };

    const handleRevokeAllSessions = async () => {
        if (!displayUser.id) return;
        const targetIds = sessions.map((s) => s.id);
        if (targetIds.length === 0) return;

        try {
            setIsRevokingAll(true);
            const res = await adminService.revokeAllUserSessions(displayUser.id, targetIds);
            toast.success(res.message || "All sessions terminated successfully");
            setSessions([]);
            setSessionsBreakdown({ total: 0, mobile: 0, tablet: 0, desktop: 0 });
        } catch (err: unknown) {
            const msg = getErrorMessage(err, "Failed to terminate all sessions");
            toast.error(msg);
        } finally {
            setIsRevokingAll(false);
        }
    };

    const handleRefreshSessions = async () => {
        if (!displayUser.id) return;
        try {
            setLoadingSessions(true);
            const sessData = await adminService.getUserSessions(displayUser.id, isSelf);
            setSessions(sessData.sessions || []);
            setSessionsBreakdown(
                sessData.breakdown || {
                    total: sessData.sessions?.length || 0,
                    mobile: 0,
                    tablet: 0,
                    desktop: 0,
                }
            );
            toast.success("Sessions refreshed");
        } catch (err: unknown) {
            toast.error("Failed to refresh sessions");
        } finally {
            setLoadingSessions(false);
        }
    };

    return (
        <>
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                maxWidth="3xl"
                showCloseButton={true}
            >
            <div className="space-y-5">
                {/* Header */}
                    <div className="flex items-center gap-3.5 mb-5 shrink-0">
                        <div className="w-12 h-12 rounded-2xl bg-linear-to-tr from-[#00c9a7]/30 to-[#00b4d8]/30 border border-[#00c9a7]/40 flex items-center justify-center font-black text-sm text-[#00e5c0] shrink-0">
                            {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                                <h3 className="text-base font-bold text-[#e0faf5] truncate">
                                    {userName}
                                </h3>
                                {isSelf && (
                                    <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-sm bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30">
                                        You
                                    </span>
                                )}
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-[#7ecfc4] mt-0.5">
                                <span className="flex items-center gap-1.5">
                                    <Mail size={12} className="text-[#00c9a7] shrink-0" />
                                    <span className="truncate">{displayUser.email}</span>
                                </span>
                                {phone ? (
                                    <span className="flex items-center gap-1.5 font-mono text-[#e0faf5]">
                                        <Phone size={12} className="text-[#00c9a7] shrink-0" />
                                        <span>{String(phone)}</span>
                                    </span>
                                ) : loadingDetails ? (
                                    <span className="w-24 h-3.5 rounded-sm bg-[#1a4a4a]/40 animate-pulse" />
                                ) : (
                                    <span className="flex items-center gap-1.5 text-[#3a6b66] italic text-[11px]">
                                        <Phone size={11} className="shrink-0" />
                                        <span>No phone</span>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Scrollable Body */}
                    <div className="overflow-y-auto pr-1 space-y-4 flex-1">
                        {loadingDetails ? (
                            /* Full Skeleton Loader when details are fetching */
                            <div className="space-y-4 animate-pulse">
                                {/* Account Details Grid Skeleton */}
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/50 space-y-2"
                                        >
                                            <div className="w-12 h-2.5 rounded-sm bg-[#1a4a4a]/40" />
                                            <div className="w-20 h-4.5 rounded-full bg-[#1a4a4a]/30" />
                                        </div>
                                    ))}
                                </div>

                                {/* Contact & Activity Grid Skeleton */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/50 flex items-center gap-2.5"
                                        >
                                            <div className="w-7 h-7 rounded-lg bg-[#1a4a4a]/40 shrink-0" />
                                            <div className="space-y-1.5 flex-1">
                                                <div className="w-14 h-2.5 rounded-sm bg-[#1a4a4a]/30" />
                                                <div className="w-32 h-3.5 rounded-sm bg-[#1a4a4a]/40" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Agent Operational Locations Skeleton (Agent Only) */}
                                {isAgent && (
                                    <div className="p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/50 space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-[#1a4a4a]/40 shrink-0" />
                                            <div className="w-48 h-3.5 rounded-sm bg-[#1a4a4a]/40" />
                                        </div>
                                        <div className="p-3 rounded-xl bg-[#0d2626]/30 border border-[#1a4a4a]/30 space-y-2">
                                            <div className="w-28 h-2.5 rounded-sm bg-[#1a4a4a]/30" />
                                            <div className="w-44 h-3 rounded-sm bg-[#1a4a4a]/40" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="w-24 h-2.5 rounded-sm bg-[#1a4a4a]/30" />
                                            <div className="flex gap-2">
                                                <div className="w-24 h-6 rounded-lg bg-[#1a4a4a]/30" />
                                                <div className="w-24 h-6 rounded-lg bg-[#1a4a4a]/30" />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Shipments Table Skeleton */}
                                <div className="space-y-2">
                                    <div className="w-40 h-3.5 rounded-sm bg-[#1a4a4a]/40" />
                                    <div className="rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]/50 p-4 space-y-2.5">
                                        {Array.from({ length: 3 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="flex items-center justify-between gap-4 py-2 border-b border-[#1a4a4a]/20 last:border-0"
                                            >
                                                <div className="w-20 h-3.5 rounded-sm bg-[#1a4a4a]/40" />
                                                <div className="w-36 h-3.5 rounded-sm bg-[#1a4a4a]/30" />
                                                <div className="w-16 h-4 rounded-full bg-[#1a4a4a]/40" />
                                                <div className="w-16 h-3 rounded-sm bg-[#1a4a4a]/30" />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Live Populated Data Body */
                            <>
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
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
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
                                            <span>
                                                {displayUser.emailVerified ? "Verified" : "Unverified"}
                                            </span>
                                        </span>
                                    </div>

                                    <div
                                        onClick={() => setIsDeviceSessionsModalOpen(true)}
                                        className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] hover:border-[#00c9a7]/50 transition-colors cursor-pointer group"
                                        title="Click to manage active devices and sessions"
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                                Active Sessions
                                            </span>
                                            <span className="text-[9px] text-[#00c9a7] opacity-0 group-hover:opacity-100 transition-opacity">
                                                Manage
                                            </span>
                                        </div>
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-[#00c9a7]/15 text-[#00e5c0] border-[#00c9a7]/30 inline-flex items-center gap-1">
                                            <Laptop size={10} />
                                            <span>
                                                {loadingSessions
                                                    ? "Checking..."
                                                    : `${sessions.length} Active`}
                                            </span>
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
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] text-[#7ecfc4]/70 block">
                                                Phone Number
                                            </span>
                                            {phone ? (
                                                <a
                                                    href={`tel:${phone}`}
                                                    className="text-xs font-mono font-medium text-[#00e5c0] hover:underline truncate block"
                                                >
                                                    {String(phone)}
                                                </a>
                                            ) : (
                                                <span className="text-xs italic text-[#3a6b66] block">
                                                    Not provided
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center gap-2.5">
                                        <MapPin size={16} className="text-[#00c9a7] shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] text-[#7ecfc4]/70 block">
                                                Address
                                            </span>
                                            <span className="text-xs font-medium text-[#e0faf5] truncate block">
                                                {displayUser.address || "Not specified"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center gap-2.5">
                                        <Calendar size={16} className="text-[#00c9a7] shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] text-[#7ecfc4]/70 block">
                                                Registered Date & Time
                                            </span>
                                            <span className="text-xs font-medium text-[#e0faf5] truncate block">
                                                {formatDateTime(displayUser.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-3 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] flex items-center gap-2.5">
                                        <Clock size={16} className="text-[#00c9a7] shrink-0" />
                                        <div className="min-w-0 flex-1">
                                            <span className="text-[10px] text-[#7ecfc4]/70 block">
                                                Last Active Login
                                            </span>
                                            <span className="text-xs font-medium text-[#e0faf5] truncate block">
                                                {formatDateTime(displayUser.lastLoginAt)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Active Device Sign-in Sessions Section (Reusable Component) */}
                                <ActiveSessionsSection
                                    sessions={sessions}
                                    breakdown={sessionsBreakdown}
                                    isLoadingSessions={loadingSessions}
                                    revokingSessionId={revokingSessionId}
                                    isRevokingAll={isRevokingAll}
                                    onRevokeSession={handleRevokeSession}
                                    onRevokeAllOther={handleRevokeAllSessions}
                                    onRefreshSessions={handleRefreshSessions}
                                    isAdminView={true}
                                    isSelf={isSelf}
                                    targetUserName={userName}
                                    compact={true}
                                />

                                {/* Agent Added Locations & Operating Coverage (AGENT ONLY) */}
                                {isAgent && (
                                    <div className="space-y-3 p-4 rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-lg bg-[#0284c7]/20 border border-[#0284c7]/40 flex items-center justify-center text-[#38bdf8]">
                                                    <Navigation size={13} />
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-bold text-[#e0faf5] flex items-center gap-2">
                                                        Agent Operational Locations & Added Routes
                                                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/30">
                                                            Agent Only
                                                        </span>
                                                    </h4>
                                                </div>
                                            </div>
                                            {loadingLocations && (
                                                <Loader2
                                                    size={13}
                                                    className="animate-spin text-[#00c9a7]"
                                                />
                                            )}
                                        </div>

                                        {/* Operating Coverage Area / Hub */}
                                        {displayUser.assignedArea && (
                                            <div className="p-3 rounded-xl bg-[#0d2626]/40 border border-[#1a4a4a] text-xs">
                                                <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                                    Coverage Area / Operating Hub
                                                </span>
                                                <p className="text-xs font-semibold text-[#00e5c0] flex items-center gap-1.5">
                                                    <MapPin size={13} className="text-[#00c9a7] shrink-0" />
                                                    <span>{displayUser.assignedArea}</span>
                                                </p>
                                            </div>
                                        )}

                                        {/* Configured Trade Corridors */}
                                        {corridorList.length > 0 && (
                                            <div>
                                                <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1.5">
                                                    Configured Trade Corridors ({corridorList.length})
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {corridorList.map((corridor, idx) => (
                                                        <span
                                                            key={idx}
                                                            className="text-[11px] font-mono font-medium px-2.5 py-1 rounded-lg bg-[#0284c7]/10 text-[#38bdf8] border border-[#0284c7]/30 flex items-center gap-1.5"
                                                        >
                                                            <Route size={11} className="shrink-0" />
                                                            <span>{corridor}</span>
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Locations Added in System by Agent */}
                                        <div>
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block">
                                                    Locations Added by Agent{" "}
                                                    {allAgentLocations.length > 0
                                                        ? `(${allAgentLocations.length})`
                                                        : ""}
                                                </span>
                                            </div>

                                            {loadingLocations ? (
                                                <div className="space-y-1.5">
                                                    {Array.from({ length: 3 }).map((_, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="p-2.5 rounded-xl bg-[#081414] border border-[#1a4a4a]/60 flex items-center justify-between gap-3 animate-pulse"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                                                <div className="w-7 h-7 rounded-lg bg-[#1a4a4a]/40 shrink-0" />
                                                                <div className="space-y-1.5 flex-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="w-28 h-3.5 rounded-sm bg-[#1a4a4a]/50" />
                                                                        <div className="w-10 h-3 rounded-sm bg-[#1a4a4a]/30" />
                                                                    </div>
                                                                    <div className="w-36 h-3 rounded-sm bg-[#1a4a4a]/30" />
                                                                </div>
                                                            </div>
                                                            <div className="w-14 h-5 rounded-full bg-[#1a4a4a]/40 shrink-0" />
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : allAgentLocations.length === 0 ? (
                                                <div className="p-3 text-center text-[11px] text-[#7ecfc4]/60 rounded-xl bg-[#081414] border border-[#1a4a4a]">
                                                    No locations directly added by this agent yet.
                                                </div>
                                            ) : (
                                                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                                                    {allAgentLocations.map((loc) => (
                                                        <div
                                                            key={loc.id}
                                                            className="p-2.5 rounded-xl bg-[#081414] border border-[#1a4a4a] hover:border-[#00c9a7]/40 transition-colors flex items-center justify-between gap-3 text-xs"
                                                        >
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                <div className="w-7 h-7 rounded-lg bg-[#00c9a7]/10 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0] shrink-0">
                                                                    <MapPin size={13} />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="font-bold text-[#e0faf5] truncate">
                                                                            {loc.name}
                                                                        </span>
                                                                        <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-sm bg-[#112a2a] text-[#7ecfc4] border border-[#1a4a4a]">
                                                                            {loc.code}
                                                                        </span>
                                                                    </div>
                                                                    <span className="text-[11px] text-[#7ecfc4]/70 truncate block">
                                                                        {[loc.city, loc.country]
                                                                            .filter(Boolean)
                                                                            .join(", ")}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="text-right shrink-0">
                                                                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30 uppercase">
                                                                    {loc.type
                                                                        ? loc.type.replace(/_/g, " ")
                                                                        : "HUB"}
                                                                </span>
                                                                {loc.createdAt && (
                                                                    <span className="text-[10px] text-[#3a6b66] block mt-0.5">
                                                                        {new Date(
                                                                            loc.createdAt
                                                                        ).toLocaleDateString()}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* User Consignments & Carrier Assignment Section */}
                                <div className="space-y-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-[#00c9a7]/20 border border-[#00c9a7]/40 flex items-center justify-center text-[#00e5c0]">
                                                <Package size={13} />
                                            </div>
                                            <div>
                                                <h4 className="text-xs font-bold text-[#e0faf5] flex items-center gap-2">
                                                    User Consignments & Carrier Assignments
                                                    <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-[#00c9a7]/10 text-[#00e5c0] border border-[#00c9a7]/30">
                                                        {effectiveShipments.length} {effectiveShipments.length === 1 ? "Shipment" : "Shipments"}
                                                    </span>
                                                </h4>
                                            </div>
                                        </div>

                                        {/* Search & Tabs */}
                                        <div className="flex items-center gap-2">
                                            {effectiveShipments.length > 2 && (
                                                <div className="relative">
                                                    <Search
                                                        size={11}
                                                        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#3a6b66]"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={shipmentSearch}
                                                        onChange={(e) => setShipmentSearch(e.target.value)}
                                                        placeholder="Search shipment, route, agent..."
                                                        className="w-40 sm:w-48 pl-7 pr-2.5 py-1 text-[11px] rounded-lg bg-[#081414] border border-[#1a4a4a] text-[#e0faf5] placeholder:text-[#3a6b66] focus:border-[#00c9a7]/60 focus:outline-hidden"
                                                    />
                                                </div>
                                            )}

                                            {isTargetAgent && (assignedCount > 0 || bookedCount > 0) && (
                                                <div className="flex items-center p-0.5 rounded-lg bg-[#081414] border border-[#1a4a4a] text-[10px]">
                                                    <button
                                                        type="button"
                                                        onClick={() => setShipmentTab("ALL")}
                                                        className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                                                            shipmentTab === "ALL"
                                                                ? "bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30"
                                                                : "text-[#7ecfc4]/70 hover:text-[#e0faf5]"
                                                        }`}
                                                    >
                                                        All ({effectiveShipments.length})
                                                    </button>
                                                    {assignedCount > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShipmentTab("ASSIGNED")}
                                                            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                                                                shipmentTab === "ASSIGNED"
                                                                    ? "bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/30"
                                                                    : "text-[#7ecfc4]/70 hover:text-[#e0faf5]"
                                                            }`}
                                                        >
                                                            Assigned ({assignedCount})
                                                        </button>
                                                    )}
                                                    {bookedCount > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setShipmentTab("BOOKED")}
                                                            className={`px-2 py-0.5 rounded-md font-medium transition-colors ${
                                                                shipmentTab === "BOOKED"
                                                                    ? "bg-[#00c9a7]/20 text-[#00e5c0] border border-[#00c9a7]/30"
                                                                    : "text-[#7ecfc4]/70 hover:text-[#e0faf5]"
                                                            }`}
                                                        >
                                                            Booked ({bookedCount})
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="rounded-2xl bg-[#0a1a1a] border border-[#1a4a4a] overflow-hidden">
                                        {loadingShipments && effectiveShipments.length === 0 ? (
                                            <div className="p-8 text-center space-y-2">
                                                <Loader2 size={18} className="animate-spin text-[#00c9a7] mx-auto" />
                                                <p className="text-xs text-[#7ecfc4]/70">Loading user consignments and carrier records...</p>
                                            </div>
                                        ) : filteredShipments.length === 0 ? (
                                            <div className="p-6 text-center text-xs text-[#7ecfc4]/70 space-y-1">
                                                <p>No shipments matching your filter criteria found for this account.</p>
                                                {shipmentSearch && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setShipmentSearch("")}
                                                        className="text-[11px] text-[#00c9a7] hover:underline cursor-pointer"
                                                    >
                                                        Clear search filter
                                                    </button>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-xs">
                                                    <thead>
                                                        <tr className="border-b border-[#1a4a4a] bg-[#081414] text-[10px] font-bold text-[#3a6b66] uppercase">
                                                            <th className="py-2.5 px-3">Tracking / Waybill</th>
                                                            <th className="py-2.5 px-3">Route Corridor</th>
                                                            <th className="py-2.5 px-3">Status</th>
                                                            <th className="py-2.5 px-3">Assigned Carrier Agent</th>
                                                            <th className="py-2.5 px-3 text-right">Date</th>
                                                            <th className="py-2.5 px-3 text-right">Action</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-[#1a4a4a]/40">
                                                        {filteredShipments.map((s) => {
                                                            const isExpanded = expandedShipmentId === s.id;
                                                            const agent = resolveShipmentAgent(s, availableAgents);
                                                            const isThisUserAgent = isShipmentAssignedToThisUser(s);
                                                            const trackingCode = s.trackingId || (s.id ? s.id.slice(0, 8) : "N/A");

                                                            return (
                                                                <React.Fragment key={s.id}>
                                                                    <tr
                                                                        onClick={() => toggleExpandShipment(s.id)}
                                                                        className={`hover:bg-[#112a2a]/40 transition-colors cursor-pointer group ${
                                                                            isExpanded ? "bg-[#112a2a]/30" : ""
                                                                        }`}
                                                                    >
                                                                        {/* Tracking / Waybill */}
                                                                        <td className="py-2.5 px-3">
                                                                            <div className="flex items-center gap-1.5">
                                                                                <span className="font-mono text-xs font-bold text-[#00e5c0]">
                                                                                    {trackingCode}
                                                                                </span>
                                                                                <button
                                                                                    type="button"
                                                                                    onClick={(e) => handleCopyTrackingId(e, trackingCode)}
                                                                                    className="p-1 rounded-sm text-[#7ecfc4]/60 hover:text-[#00e5c0] hover:bg-[#00c9a7]/10 transition-colors"
                                                                                    title="Copy Waybill Tracking ID"
                                                                                >
                                                                                    {copiedTrackingId === trackingCode ? (
                                                                                        <Check size={11} className="text-[#00e5c0]" />
                                                                                    ) : (
                                                                                        <Copy size={11} />
                                                                                    )}
                                                                                </button>
                                                                                {s.weight ? (
                                                                                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded-sm bg-[#112a2a] text-[#7ecfc4] border border-[#1a4a4a]">
                                                                                        {s.weight}kg
                                                                                    </span>
                                                                                ) : null}
                                                                            </div>
                                                                            {isThisUserAgent && (
                                                                                <span className="text-[9px] font-semibold text-[#38bdf8] flex items-center gap-1 mt-0.5">
                                                                                    <span>Fleet Delivery Task</span>
                                                                                </span>
                                                                            )}
                                                                        </td>

                                                                        {/* Route Corridor */}
                                                                        <td className="py-2.5 px-3 text-[#e0faf5]">
                                                                            <div className="flex items-center gap-1.5 font-medium">
                                                                                <span className="truncate max-w-[110px]" title={s.origin}>
                                                                                    {s.origin}
                                                                                </span>
                                                                                <ArrowRight size={11} className="text-[#00c9a7] shrink-0" />
                                                                                <span className="truncate max-w-[110px]" title={s.destination}>
                                                                                    {s.destination}
                                                                                </span>
                                                                            </div>
                                                                        </td>

                                                                        {/* Status */}
                                                                        <td className="py-2.5 px-3">
                                                                            <span
                                                                                className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${getShipmentStatusBadge(
                                                                                    s.status
                                                                                )}`}
                                                                            >
                                                                                {s.status.replace(/_/g, " ")}
                                                                            </span>
                                                                        </td>

                                                                        {/* Assigned Carrier Agent */}
                                                                        <td className="py-2.5 px-3">
                                                                            {agent ? (
                                                                                <div className="flex items-center gap-2">
                                                                                    <div className="w-6 h-6 rounded-lg bg-[#00c9a7]/15 border border-[#00c9a7]/30 flex items-center justify-center text-[#00e5c0] shrink-0">
                                                                                        <UserCheck size={12} />
                                                                                    </div>
                                                                                    <div className="min-w-0">
                                                                                        <div className="flex items-center gap-1.5">
                                                                                            <span className="font-bold text-[#e0faf5] truncate text-xs">
                                                                                                {agent.name}
                                                                                            </span>
                                                                                            {isThisUserAgent && (
                                                                                                <span className="text-[8px] font-bold px-1.5 py-0.2 rounded-xs bg-[#0284c7]/20 text-[#38bdf8] border border-[#0284c7]/30 shrink-0">
                                                                                                    This Agent
                                                                                                </span>
                                                                                            )}
                                                                                        </div>
                                                                                        {agent.phone ? (
                                                                                            <a
                                                                                                href={`tel:${agent.phone}`}
                                                                                                onClick={(e) => e.stopPropagation()}
                                                                                                className="text-[10px] font-mono text-[#7ecfc4] hover:underline hover:text-[#00e5c0] truncate block"
                                                                                            >
                                                                                                {agent.phone}
                                                                                            </a>
                                                                                        ) : agent.email ? (
                                                                                            <span className="text-[10px] text-[#7ecfc4]/70 truncate block max-w-[150px]">
                                                                                                {agent.email}
                                                                                            </span>
                                                                                        ) : (
                                                                                            <span className="text-[10px] text-[#00c9a7] block">
                                                                                                Assigned
                                                                                            </span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ) : (
                                                                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#f59e0b]/10 text-[#fbbf24] border border-[#f59e0b]/30">
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b] animate-pulse shrink-0" />
                                                                                    <span className="text-[10px] font-semibold">
                                                                                        Unassigned
                                                                                    </span>
                                                                                </span>
                                                                            )}
                                                                        </td>

                                                                        {/* Date */}
                                                                        <td className="py-2.5 px-3 text-right text-[#7ecfc4]/80 text-[11px] font-mono">
                                                                            {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                                                                        </td>

                                                                        {/* Action / Toggle */}
                                                                        <td className="py-2.5 px-3 text-right">
                                                                            <button
                                                                                type="button"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    toggleExpandShipment(s.id);
                                                                                }}
                                                                                className="p-1 rounded-lg text-[#7ecfc4]/70 hover:text-[#00e5c0] hover:bg-[#1a4a4a]/40 transition-colors"
                                                                                title={isExpanded ? "Collapse details" : "Expand details"}
                                                                            >
                                                                                {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                                                            </button>
                                                                        </td>
                                                                    </tr>

                                                                    {/* Expanded Detail Accordion */}
                                                                    {isExpanded && (
                                                                        <tr>
                                                                            <td colSpan={6} className="p-0 bg-[#081414]/90 border-b border-[#1a4a4a]">
                                                                                <div className="p-3.5 space-y-3">
                                                                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                                                                                        {/* Cargo & Dimensions */}
                                                                                        <div className="p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                                                                            <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                                                                                Cargo & Transit Specs
                                                                                            </span>
                                                                                            <p className="text-xs font-semibold text-[#e0faf5] line-clamp-2">
                                                                                                {s.description || "General Freight Consignment"}
                                                                                            </p>
                                                                                            <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#7ecfc4]">
                                                                                                {s.weight && (
                                                                                                    <span>Weight: <strong className="text-[#00e5c0] font-mono">{s.weight} kg</strong></span>
                                                                                                )}
                                                                                                {s.estimatedDate && (
                                                                                                    <span>Est. Delivery: <strong className="text-[#e0faf5]">{new Date(s.estimatedDate).toLocaleDateString()}</strong></span>
                                                                                                )}
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Assigned Carrier Agent Breakdown */}
                                                                                        <div className="p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                                                                            <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                                                                                Assigned Carrier Agent Profile
                                                                                            </span>
                                                                                            {agent ? (
                                                                                                <div className="space-y-1.5">
                                                                                                    <p className="text-xs font-bold text-[#00e5c0] flex items-center gap-1.5">
                                                                                                        <UserCheck size={13} className="text-[#00c9a7]" />
                                                                                                        <span>{agent.name}</span>
                                                                                                    </p>
                                                                                                    <div className="flex flex-col gap-1 text-[11px]">
                                                                                                        {agent.phone && (
                                                                                                            <a
                                                                                                                href={`tel:${agent.phone}`}
                                                                                                                className="text-[#7ecfc4] hover:underline flex items-center gap-1.5 font-mono"
                                                                                                            >
                                                                                                                <Phone size={10} className="text-[#00c9a7]" />
                                                                                                                <span>{agent.phone}</span>
                                                                                                            </a>
                                                                                                        )}
                                                                                                        {agent.email && (
                                                                                                            <a
                                                                                                                href={`mailto:${agent.email}`}
                                                                                                                className="text-[#7ecfc4]/80 hover:underline flex items-center gap-1.5 truncate"
                                                                                                            >
                                                                                                                <Mail size={10} className="text-[#00c9a7]" />
                                                                                                                <span className="truncate">{agent.email}</span>
                                                                                                            </a>
                                                                                                        )}
                                                                                                    </div>
                                                                                                </div>
                                                                                            ) : (
                                                                                                <div className="space-y-1">
                                                                                                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f59e0b]/15 text-[#fbbf24] border border-[#f59e0b]/30 inline-block">
                                                                                                        Awaiting Carrier Assignment
                                                                                                    </span>
                                                                                                    <p className="text-[10px] text-[#7ecfc4]/60">
                                                                                                        No road carrier is currently assigned to this consignment.
                                                                                                    </p>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>

                                                                                        {/* Billing & Dispatcher */}
                                                                                        <div className="p-3 rounded-xl bg-[#0a1a1a] border border-[#1a4a4a]">
                                                                                            <span className="text-[10px] text-[#7ecfc4]/70 uppercase tracking-wider block mb-1">
                                                                                                Billing & Dispatch Information
                                                                                            </span>
                                                                                            <div className="flex items-center justify-between text-xs mb-1.5">
                                                                                                <span className="text-[#7ecfc4]/80">Payment:</span>
                                                                                                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-[#00c9a7]/15 text-[#00e5c0] border border-[#00c9a7]/30 uppercase">
                                                                                                    {s.paymentStatus || "PENDING"}
                                                                                                </span>
                                                                                            </div>
                                                                                            <p className="text-[11px] text-[#7ecfc4]/80">
                                                                                                {s.assignedBy?.name ? (
                                                                                                    <span>Dispatcher: <strong className="text-[#e0faf5]">{s.assignedBy.name}</strong></span>
                                                                                                ) : (
                                                                                                    <span>Booking: Direct shipper consignment</span>
                                                                                                )}
                                                                                            </p>
                                                                                            {s.cost?.totalCost && (
                                                                                                <div className="text-[11px] text-[#e0faf5] font-mono mt-1">
                                                                                                    Total Rate: <strong className="text-[#00e5c0]">${s.cost.totalCost}</strong>
                                                                                                </div>
                                                                                            )}
                                                                                        </div>
                                                                                    </div>
                                                                                </div>
                                                                            </td>
                                                                        </tr>
                                                                    )}
                                                                </React.Fragment>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 mt-3 border-t border-[#1a4a4a] shrink-0">
                        <div className="flex items-center gap-3">
                            <a
                                href={`mailto:${displayUser.email}`}
                                className="text-xs text-[#00c9a7] hover:underline flex items-center gap-1.5"
                            >
                                <Mail size={13} />
                                <span>Email</span>
                            </a>
                            {phone && (
                                <a
                                    href={`tel:${phone}`}
                                    className="text-xs text-[#00c9a7] hover:underline flex items-center gap-1.5"
                                >
                                    <Phone size={13} />
                                    <span>Call ({String(phone)})</span>
                                </a>
                            )}
                        </div>

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
                                    title={
                                        isSelf
                                            ? "Cannot suspend own account"
                                            : isBlocked
                                            ? "Reactivate"
                                            : "Suspend"
                                    }
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
                </div>
            </Modal>

            {/* Dedicated Active Devices & Sessions Management Modal */}
            <UserSessionsModal
                userId={displayUser.id || user?.id || null}
                userName={userName}
                userEmail={displayUser.email}
                isOpen={isDeviceSessionsModalOpen}
                onClose={() => setIsDeviceSessionsModalOpen(false)}
                onSessionRevoked={(revokedId) => {
                    setSessions((prev) => prev.filter((s) => s.id !== revokedId));
                    setSessionsBreakdown((prev) => ({
                        ...prev,
                        total: Math.max(0, prev.total - 1),
                    }));
                }}
                onAllRevoked={() => {
                    setSessions([]);
                    setSessionsBreakdown({ total: 0, mobile: 0, tablet: 0, desktop: 0 });
                }}
            />
        </>
    );
}
