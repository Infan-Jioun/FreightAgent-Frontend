"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/app/store/authStore";
import type { Socket } from "socket.io-client";
import {
    IAgentAssignedSocketPayload,
    IShipmentStatusUpdatedSocketPayload,
    IShipmentAssignedSocketPayload,
    INewShipmentRequestSocketPayload,
} from "@/app/types/socket.types";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    emit: (event: string, ...args: unknown[]) => void;
    subscribe: (event: string, callback: (data: unknown) => void) => () => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    emit: () => {},
    subscribe: () => () => {},
});

/**
 * Normalizes backend URL by stripping /api/v1 to reach the base Socket.IO server
 */
function getSocketBaseUrl(): string {
    const rawUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    try {
        const parsed = new URL(rawUrl);
        return parsed.origin;
    } catch {
        return "http://localhost:5000";
    }
}

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuthStore();
    const [isConnected, setIsConnected] = useState(false);
    const socketRef = useRef<Socket | null>(null);

    // Pub/Sub listener registry for local subscribers
    const listenersRef = useRef<Map<string, Set<(data: unknown) => void>>>(new Map());

    const notifySubscribers = useCallback((event: string, data: unknown) => {
        const subscribers = listenersRef.current.get(event);
        if (subscribers) {
            subscribers.forEach((cb) => {
                try {
                    cb(data);
                } catch (err) {
                    console.error(`Error in socket listener callback for [${event}]:`, err);
                }
            });
        }
    }, []);

    useEffect(() => {
        if (!user?.id) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        let isCancelled = false;
        let localSocket: Socket | null = null;

        const initSocket = async () => {
            try {
                const { io } = await import("socket.io-client");
                if (isCancelled) return;

                const socketBaseUrl = getSocketBaseUrl();

                localSocket = io(socketBaseUrl, {
                    query: {
                        userId: user.id,
                        role: user.role, // "ADMIN" | "AGENT" | "CUSTOMER"
                    },
                    transports: ["websocket", "polling"],
                    withCredentials: true,
                    reconnection: true,
                    reconnectionAttempts: 10,
                    reconnectionDelay: 2000,
                });

                socketRef.current = localSocket;

                localSocket.on("connect", () => {
                    if (!isCancelled) setIsConnected(true);
                });

                localSocket.on("disconnect", () => {
                    if (!isCancelled) setIsConnected(false);
                });

                // Customer Event 1: agent_assigned
                localSocket.on("agent_assigned", (data: unknown) => {
                    if (isCancelled) return;
                    const payload = data as IAgentAssignedSocketPayload;
                    const agentName = payload?.agent?.name || "A carrier agent";
                    const trackingId = payload?.trackingId || "";

                    toast.info(`Road Agent ${agentName} has been assigned to your shipment #${trackingId}!`, {
                        description: payload?.agent?.phone ? `Agent Phone: ${payload.agent.phone}` : undefined,
                        duration: 6000,
                    });

                    notifySubscribers("agent_assigned", payload);
                });

                // Customer Event 2: shipment_status_updated
                localSocket.on("shipment_status_updated", (data: unknown) => {
                    if (isCancelled) return;
                    const payload = data as IShipmentStatusUpdatedSocketPayload;
                    const trackingId = payload?.trackingId || "";
                    const statusFormatted = payload?.status ? payload.status.replace(/_/g, " ") : "UPDATED";

                    toast.info(`Shipment #${trackingId} status updated to ${statusFormatted}`, {
                        description: payload?.location ? `Location: ${payload.location}` : undefined,
                        duration: 5000,
                    });

                    notifySubscribers("shipment_status_updated", payload);
                    // Legacy alias broadcast
                    notifySubscribers("shipment_update", payload);
                });

                // Agent Event: shipment_assigned
                localSocket.on("shipment_assigned", (data: unknown) => {
                    if (isCancelled) return;
                    const payload = data as IShipmentAssignedSocketPayload;
                    const trackingId = payload?.trackingId || "";

                    toast.success(`New shipment #${trackingId} assigned to you!`, {
                        description:
                            payload?.origin && payload?.destination
                                ? `Route: ${payload.origin} → ${payload.destination}`
                                : undefined,
                        duration: 6000,
                    });

                    notifySubscribers("shipment_assigned", payload);
                    // Legacy alias broadcast
                    notifySubscribers("new_shipment", payload);
                });

                // Admin Event: new_shipment_request
                localSocket.on("new_shipment_request", (data: unknown) => {
                    if (isCancelled) return;
                    const payload = data as INewShipmentRequestSocketPayload;
                    const trackingId = payload?.trackingId || "";
                    const customerName = payload?.customer?.name || "A customer";

                    toast.info(`New shipment request #${trackingId} from ${customerName}`, {
                        description: "Pending consignment dispatch & road agent allocation",
                        duration: 6000,
                    });

                    notifySubscribers("new_shipment_request", payload);
                });

                // Legacy fallback: new_shipment
                localSocket.on("new_shipment", (data: unknown) => {
                    if (isCancelled) return;
                    notifySubscribers("new_shipment", data);
                });

                // Legacy fallback: shipment_update
                localSocket.on("shipment_update", (data: unknown) => {
                    if (isCancelled) return;
                    notifySubscribers("shipment_update", data);
                });

                // Real-time backend notification event
                localSocket.on("notification", (data: unknown) => {
                    if (isCancelled) return;
                    notifySubscribers("notification", data);
                });

                // Real-time unread count sync event
                localSocket.on("unread_count_updated", (data: unknown) => {
                    if (isCancelled) return;
                    notifySubscribers("unread_count_updated", data);
                });
            } catch (err) {
                console.warn("Socket initialization skipped:", err);
            }
        };

        void initSocket();

        return () => {
            isCancelled = true;
            if (localSocket) {
                localSocket.off("connect");
                localSocket.off("disconnect");
                localSocket.off("agent_assigned");
                localSocket.off("shipment_status_updated");
                localSocket.off("shipment_assigned");
                localSocket.off("new_shipment_request");
                localSocket.off("new_shipment");
                localSocket.off("shipment_update");
                localSocket.off("notification");
                localSocket.off("unread_count_updated");
                localSocket.disconnect();
            }
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [user?.id, user?.role, notifySubscribers]);

    const emit = useCallback((event: string, ...args: unknown[]) => {
        if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit(event, ...args);
        }
    }, []);

    const subscribe = useCallback((event: string, callback: (data: unknown) => void) => {
        if (!listenersRef.current.has(event)) {
            listenersRef.current.set(event, new Set());
        }
        listenersRef.current.get(event)!.add(callback);

        return () => {
            const set = listenersRef.current.get(event);
            if (set) {
                set.delete(callback);
                if (set.size === 0) {
                    listenersRef.current.delete(event);
                }
            }
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket: socketRef.current, isConnected, emit, subscribe }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocketContext() {
    return useContext(SocketContext);
}

/**
 * Reusable hook to subscribe to any socket event without duplicating connections
 */
export function useSocketEvent<T = unknown>(
    event: string,
    handler: (data: T) => void
) {
    const { subscribe, isConnected } = useSocketContext();
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        const unsubscribe = subscribe(event, (data) => {
            handlerRef.current(data as T);
        });
        return unsubscribe;
    }, [event, subscribe]);

    return { isConnected };
}
