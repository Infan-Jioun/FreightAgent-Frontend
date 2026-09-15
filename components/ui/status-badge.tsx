import * as React from "react";
import { ShipmentStatus, PaymentStatus } from "@/app/types/shipment.types";
import { cn } from "@/lib/utils";
import {
    Clock,
    UserCheck,
    CheckSquare,
    PackageCheck,
    Truck,
    CheckCircle2,
    XCircle,
    HelpCircle,
    AlertTriangle,
    Loader2,
    RotateCcw,
} from "lucide-react";

interface StatusBadgeProps {
    status: ShipmentStatus | string;
    className?: string;
    showIcon?: boolean;
}

export function StatusBadge({ status, className, showIcon = true }: StatusBadgeProps) {
    const normalized = (status || "").toUpperCase() as ShipmentStatus;

    switch (normalized) {
        case "PENDING":
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-neutral-600/50 bg-neutral-800/70 text-neutral-300 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <Clock size={12} className="shrink-0 text-neutral-400" />}
                    Pending
                </span>
            );
        case "ASSIGNED":
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-blue-500/30 bg-blue-500/15 text-blue-400 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <UserCheck size={12} className="shrink-0 text-blue-400" />}
                    Assigned
                </span>
            );
        case "ACCEPTED":
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-purple-500/30 bg-purple-500/15 text-purple-400 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <CheckSquare size={12} className="shrink-0 text-purple-400" />}
                    Accepted
                </span>
            );
        case "PICKED_UP":
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-amber-500/30 bg-amber-500/15 text-amber-400 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <PackageCheck size={12} className="shrink-0 text-amber-400" />}
                    Picked Up
                </span>
            );
        case "IN_TRANSIT":
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-orange-500/30 bg-orange-500/15 text-orange-400 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <Truck size={12} className="shrink-0 text-orange-400" />}
                    In Transit
                </span>
            );
        case "DELIVERED":
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />}
                    Delivered
                </span>
            );
        case "CANCELLED":
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-rose-500/30 bg-rose-500/15 text-rose-400 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <XCircle size={12} className="shrink-0 text-rose-400" />}
                    Cancelled
                </span>
            );
        default:
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-neutral-700 bg-neutral-800 text-neutral-300 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <HelpCircle size={12} className="shrink-0 text-neutral-400" />}
                    {status || "Unknown"}
                </span>
            );
    }
}

interface PaymentStatusBadgeProps {
    status?: PaymentStatus | string | null;
    className?: string;
    showIcon?: boolean;
}

export function PaymentStatusBadge({
    status,
    className,
    showIcon = true,
}: PaymentStatusBadgeProps) {
    const normalized = (status || "UNPAID").toUpperCase() as PaymentStatus;

    switch (normalized) {
        case "UNPAID":
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border border-amber-500/30 bg-amber-500/15 text-amber-400 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <AlertTriangle size={12} className="shrink-0 text-amber-400" />}
                    Unpaid
                </span>
            );
        case "PROCESSING":
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border border-blue-500/30 bg-blue-500/15 text-blue-400 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <Loader2 size={12} className="shrink-0 text-blue-400 animate-spin" />}
                    Processing
                </span>
            );
        case "PAID":
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <CheckCircle2 size={12} className="shrink-0 text-emerald-400" />}
                    Paid
                </span>
            );
        case "FAILED":
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide border border-rose-500/30 bg-rose-500/15 text-rose-400 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <XCircle size={12} className="shrink-0 text-rose-400" />}
                    Failed
                </span>
            );
        case "REFUNDED":
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-neutral-700 bg-neutral-800/80 text-neutral-400 line-through shadow-xs",
                        className
                    )}
                >
                    {showIcon && <RotateCcw size={12} className="shrink-0 text-neutral-400" />}
                    Refunded
                </span>
            );
        default:
            return (
                <span
                    className={cn(
                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border border-neutral-700 bg-neutral-800 text-neutral-400 shadow-xs",
                        className
                    )}
                >
                    {showIcon && <HelpCircle size={12} className="shrink-0 text-neutral-400" />}
                    {status || "Unpaid"}
                </span>
            );
    }
}

