/**
 * Socket.IO Real-Time Event Contracts & Payload Definitions
 */

import { ShipmentStatus } from "./shipment.types";

export interface IAgentAssignedSocketPayload {
    trackingId: string;
    agent: {
        id?: string;
        name: string;
        email: string;
        phone?: string | null;
        assignedArea?: string | null;
    };
    assignedBy: {
        id?: string;
        name: string;
        email: string;
    };
}

export interface IShipmentStatusUpdatedSocketPayload {
    trackingId: string;
    status: ShipmentStatus;
    location: string;
    note?: string | null;
    updatedBy?: {
        name: string;
        email: string;
        role: string;
    };
}

export interface IShipmentAssignedSocketPayload {
    trackingId: string;
    origin: string;
    destination: string;
    customer?: {
        name?: string;
        email?: string;
        phone?: string | null;
    };
    assignedBy?: {
        name?: string;
        email?: string;
    };
}

export interface INewShipmentRequestSocketPayload {
    trackingId: string;
    shipment?: {
        id?: string;
        trackingId?: string;
        origin?: string;
        destination?: string;
        weight?: number;
        status?: ShipmentStatus;
    };
    customer?: {
        name?: string;
        email?: string;
    };
}

export interface PaymentSocketPayload {
    type: "PAYMENT_SUCCESS" | "PAYMENT_FAILED" | "PAYMENT_REFUNDED" | "SHIPMENT_PAID" | "PAYMENT_RECEIVED";
    shipmentId: string;
    trackingId: string;
    amount?: number;
    currency?: string;
    error?: string;
    refundId?: string;
    message: string;
}
