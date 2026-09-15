"use client";

import { useSocketContext, useSocketEvent } from "@/app/providers/SocketProvider";
import { IShipment } from "@/app/types/shipment.types";

export { useSocketContext, useSocketEvent };

interface UseSocketOptions {
    userId?: string;
    onNewShipment?: (shipment: IShipment) => void;
    onShipmentUpdate?: (shipment: IShipment) => void;
    autoConnect?: boolean;
}

export function useSocket(options: UseSocketOptions = {}) {
    const { socket, isConnected, emit } = useSocketContext();

    useSocketEvent<unknown>("new_shipment", (data) => {
        if (options.onNewShipment) {
            const raw =
                data && typeof data === "object" && "data" in data
                    ? (data as { data: unknown }).data
                    : data;
            const record =
                raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
            const trackingId =
                (typeof record.trackingId === "string" && record.trackingId) ||
                (typeof record.tracking_id === "string" && record.tracking_id) ||
                "N/A";
            const shipment = { ...record, trackingId } as unknown as IShipment;
            options.onNewShipment(shipment);
        }
    });

    useSocketEvent<unknown>("shipment_update", (data) => {
        if (options.onShipmentUpdate) {
            const raw =
                data && typeof data === "object" && "data" in data
                    ? (data as { data: unknown }).data
                    : data;
            const record =
                raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
            const trackingId =
                (typeof record.trackingId === "string" && record.trackingId) ||
                (typeof record.tracking_id === "string" && record.tracking_id) ||
                "N/A";
            const shipment = { ...record, trackingId } as unknown as IShipment;
            options.onShipmentUpdate(shipment);
        }
    });

    return {
        socket,
        isConnected,
        emit,
    };
}

export default useSocket;
