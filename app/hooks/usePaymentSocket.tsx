"use client";


import { toast } from "sonner";
import { useSocketEvent } from "./useSocket";
import { resolveInvoiceUrl } from "../lib/invoice";
import { PaymentSocketPayload } from "../types";

/**
 * Custom hook to listen to real-time payment notifications across customer, agent, and admin dashboards
 */
export const usePaymentSocket = (onRefresh?: () => void): void => {
    useSocketEvent("notification", (data: unknown) => {
        const payload = data as PaymentSocketPayload;
        if (!payload || !payload.type) return;

        switch (payload.type) {
            case "PAYMENT_SUCCESS": {
                const resolvedUrl = resolveInvoiceUrl(payload.invoiceUrl, payload.trackingId);
                toast.success(
                    <div className="flex flex-col gap-1">
                        <p className="font-bold text-white">
                            {payload.message || `Payment of $${payload.amount ? Number(payload.amount).toFixed(2) : ""} USD received for #${payload.trackingId || ""}! 🎉`}
                        </p>
                        <a
                            href={resolvedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#00e5c0] hover:text-[#7ecfc4] underline text-xs font-semibold block transition-colors cursor-pointer"
                        >
                            📄 Click to view Invoice →
                        </a>
                    </div>,
                    { duration: 8000 }
                );
                onRefresh?.();
                break;
            }
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
