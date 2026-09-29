"use client";

import { useSocketEvent } from "@/app/hooks/useSocket";
import { toast } from "sonner";
import { PaymentSocketPayload } from "@/app/types/socket.types";

/**
 * Custom hook to listen to real-time payment notifications across customer, agent, and admin dashboards
 */
export const usePaymentSocket = (onRefresh?: () => void) => {
    useSocketEvent("notification", (data: unknown) => {
        const payload = data as PaymentSocketPayload;
        if (!payload || !payload.type) return;

        switch (payload.type) {
            case "PAYMENT_SUCCESS":
                toast.success(
                    `Payment of $${payload.amount ? Number(payload.amount).toFixed(2) : ""} USD received for #${payload.trackingId || ""}`
                );
                onRefresh?.();
                break;
            case "PAYMENT_FAILED":
                toast.error(
                    `Payment failed for #${payload.trackingId || ""}: ${payload.error || payload.message || "Card transaction rejected"}`
                );
                onRefresh?.();
                break;
            case "PAYMENT_REFUNDED":
                toast.info(`Refund processed for #${payload.trackingId || ""}`);
                onRefresh?.();
                break;
            case "SHIPMENT_PAID":
                toast.success(`Assigned consignment #${payload.trackingId || ""} has been marked as PAID.`);
                onRefresh?.();
                break;
            case "PAYMENT_RECEIVED":
                toast.success(`Payment received for consignment #${payload.trackingId || ""}`);
                onRefresh?.();
                break;
            default:
                break;
        }
    });
};
